import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import tmi, { ChatUserstate, Client } from 'tmi.js-reply-fork'
import { ChannelService } from './channels/channel.service'
import { CommandsService } from './commands/commands.service'
import { ConfigType, MessageStatus } from './prisma/client'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class BotService implements OnModuleInit {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly channelService: ChannelService,
        private readonly commandsService: CommandsService
    ) {}

    private client: Client

    async onModuleInit() {
        await this.initClient()
        await this.connectClient()
        this.client.on('message', this.messageHandler.bind(this))
        this.client.on('join', this.joinHandler.bind(this))
    }

    private async initClient() {
        this.client = new tmi.Client({
            options: {
                debug: true
            },
            identity: {
                username: this.configService.get('TWITCH_BOT_USERNAME'),
                password: this.configService.get('TWITCH_BOT_OAUTH_TOKEN')
            },
            channels: (await this.prismaService.channel.findMany({ where: { enabled: true } })).map((channel) => channel.name)
        })
    }

    private async connectClient() {
        this.client.connect()
    }

    private async joinHandler(channel: string, username: string, self: boolean) {
        if (!self) return
        await this.prismaService.chatQueue.updateMany({
            where: { channel: channel, status: MessageStatus.IN_PROGRESS },
            data: { status: MessageStatus.FINISHED }
        })
        this.gptHandler(channel)
    }

    private async messageHandler(channel: string, userstate: ChatUserstate, message: string, self: boolean) {
        if (self || !message.startsWith('!')) return

        const [command, ...args] = JSON.parse(JSON.stringify(message.trim())).slice(1).split(' ')

        if (command === 'ask') {
            return this.client.reply(channel, this.commandsService.ask({ question: args.join(' ') }), userstate)
        }
        if (command === 'choice') {
            return this.client.reply(channel, this.commandsService.choice({ options: args }), userstate)
        }
        if (command === 'calc') {
            return this.client.reply(channel, this.commandsService.calc({ expression: args.join(' ') }), userstate)
        }
        if (command === 'config') {
            if (!userstate.badges?.broadcaster) return

            const { id: channelId } = (await this.prismaService.channel.findUnique({ where: { name: channel.slice(1) } })) ?? {}
            if (!channelId) return

            const configType = args.at(0)
            if (configType === ConfigType.OPEN_AI_API_KEY) {
                return this.client.reply(
                    channel,
                    await this.channelService.setOpenOpenAiApiKey({ channelId, key: args.at(1) }),
                    userstate
                )
            }
            if (configType === ConfigType.STREAM_DJ_ID) {
                return this.client.reply(
                    channel,
                    await this.channelService.setStreamDjChannelId({ channelId, id: args.at(1) }),
                    userstate
                )
            }
            if (configType === ConfigType.STREAM_DJ_LINK) {
                return this.client.reply(
                    channel,
                    await this.channelService.setStreamDjLink({ channelId, link: args.at(1) }),
                    userstate
                )
            }
            return this.client.reply(
                channel,
                `Доступные конфигурационные опции: ${Object.keys(ConfigType).join(', ')}`,
                userstate
            )
        }
        if (command === 'gpt') {
            if (args.at(0) === 'clear' && userstate.username) {
                return this.client.reply(
                    channel,
                    await this.commandsService.gptClearHistory({ channel: channel, username: userstate.username }),
                    userstate
                )
            }

            const userQueueLength = await this.prismaService.chatQueue.count({
                where: {
                    channel: channel,
                    userstate: { path: ['username'], string_contains: userstate.username },
                    status: { not: MessageStatus.FINISHED }
                }
            })
            if (userQueueLength >= 3) {
                this.gptHandler(channel)
                return this.client.reply(channel, 'Вы задаёте слишком много вопросов!', userstate)
            }

            const queueLength = await this.prismaService.chatQueue.count({
                where: { channel: channel, status: { not: MessageStatus.FINISHED } }
            })
            if (queueLength > 0) {
                this.client.reply(channel, 'Ваш вопрос добавлен в очередь', userstate)
            }

            await this.prismaService.chatQueue.create({
                data: { channel: channel, value: args.join(' '), userstate: userstate, status: MessageStatus.QUEUED }
            })

            return this.gptHandler(channel)
        }
        if (command === 'dj') {
            const channelId = await this.prismaService.config.findFirst({
                where: { channel: { name: channel.slice(1) }, type: ConfigType.STREAM_DJ_ID }
            })
            if (!channelId) {
                return this.client.reply(channel, 'Для этого канала не указан идентификатор StreamDJ', userstate)
            }

            const djLink = await this.prismaService.config.findFirst({
                where: { channel: { name: channel.slice(1) }, type: ConfigType.STREAM_DJ_LINK }
            })

            return this.client.reply(
                channel,
                await this.commandsService.dj({
                    channelId: channelId?.value,
                    command: args.at(0),
                    query: args.slice(1).join(' '),
                    nickname: userstate.username,
                    djLink: djLink?.value
                }),
                userstate
            )
        }
    }

    private async gptHandler(channel: string): Promise<void> {
        const message = await this.prismaService.chatQueue.findFirst({
            where: { channel: channel, status: { not: MessageStatus.FINISHED } },
            orderBy: { createdAt: 'asc' }
        })
        if (!message || message.status === MessageStatus.IN_PROGRESS) return

        const apiKey = await this.prismaService.config.findFirst({
            where: { channel: { name: channel.slice(1) }, type: ConfigType.OPEN_AI_API_KEY }
        })
        if (!apiKey) {
            this.client.reply(channel, 'Для этого канала не указан OpenAI API ключ', message.userstate as ChatUserstate)
            await this.prismaService.chatQueue.updateMany({
                where: { channel: channel },
                data: { status: MessageStatus.FINISHED }
            })
            return
        }

        this.client.reply(channel, 'Отвечаю...', message.userstate as ChatUserstate)
        await this.prismaService.chatQueue.update({ where: { id: message.id }, data: { status: MessageStatus.IN_PROGRESS } })

        const response = await this.commandsService.gpt({
            question: message.value,
            key: apiKey?.value,
            channel: channel,
            username: (message.userstate as ChatUserstate)?.username
        })
        for (const part of response.match(/([\s\S]{1,500}(\s|$))\s*/g) ?? []) {
            this.client.reply(channel, part, message.userstate as ChatUserstate)
        }

        await this.prismaService.chatQueue.update({
            where: { id: message.id },
            data: { response: response, status: MessageStatus.FINISHED }
        })
        const queueLength = await this.prismaService.chatQueue.count({
            where: { channel: channel, status: { not: MessageStatus.FINISHED } }
        })
        if (queueLength > 0) {
            return this.gptHandler(channel)
        }
    }
}
