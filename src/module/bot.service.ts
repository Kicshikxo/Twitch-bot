import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import tmi, { ChatUserstate, Client } from 'tmi.js-reply-fork'
import { CommandsService } from './commands/commands.service'
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
        if (self && this.configService.get('NODE_ENV') === 'production') this.client.say(channel, 'peepoHey')
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
            this.client.reply(channel, 'Думаю...', userstate)
            const response = await this.commandsService.gpt({
                question: args.join(' '),
                key: this.configService.get('OPENAI_API_KEY') ?? ''
            })
            for (const part of response.match(/([\s\S]{1,500}(\s|$))\s*/g) ?? []) {
                this.client.reply(channel, part, userstate)
            }
            return
        }
    }
}
