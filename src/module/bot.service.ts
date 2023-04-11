import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import tmi, { ChatUserstate, Client } from 'tmi.js-reply-fork'
import { CommandsService } from './commands/commands.service'
import { MessageStatus, SettingType } from './prisma/client'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class BotService implements OnModuleInit {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
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
            where: { status: MessageStatus.IN_PROGRESS },
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
            const channelId = await this.prismaService.settings.findFirst({
                where: { channel: { name: channel.slice(1) }, type: SettingType.STREAM_DJ_CHANNEL_ID }
            })
            if (!channelId) {
                return this.client.reply(channel, 'Для этого канала не указан Stream DJ ID', userstate)
            }

            const djLink = await this.prismaService.settings.findFirst({
                where: { channel: { name: channel.slice(1) }, type: SettingType.STREAM_DJ_LINK }
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

        this.client.reply(channel, 'Отвечаю...', message.userstate as ChatUserstate)
        await this.prismaService.chatQueue.update({ where: { id: message.id }, data: { status: MessageStatus.IN_PROGRESS } })

        const apiKey = await this.prismaService.settings.findFirst({
            where: { channel: { name: channel.slice(1) }, type: SettingType.OPEN_AI_AUTH_TOKEN }
        })
        if (!apiKey) {
            this.client.reply(channel, 'Для этого канала не указан API ключ', message.userstate as ChatUserstate)
            await this.prismaService.chatQueue.deleteMany({ where: { channel: channel } })
            return
        }

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
