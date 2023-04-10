import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatUserstate, Client } from 'tmi.js'
import { PrismaService } from './prisma/prisma.service'

@Injectable()
export class BotService implements OnModuleInit {
    constructor(private readonly prismaService: PrismaService, private readonly configService: ConfigService) {}

    private client: Client

    async onModuleInit() {
        await this.initClient()
        await this.connectClient()
        this.client.on('message', this.messageHandler.bind(this))
    }

    private async initClient() {
        const tmi = await import('tmi.js')

        this.client = new tmi.Client({
            options: {
                debug: true
            },
            identity: {
                username: this.configService.get('TWITCH_BOT_USERNAME'),
                password: this.configService.get('TWITCH_BOT_OAUTH_TOKEN')
            },
            channels: (await this.prismaService.channel.findMany()).map((channel) => channel.name)
        })
    }

    private async connectClient() {
        this.client.connect()
    }

    private async messageHandler(channel: string, userstate: ChatUserstate, message: string, self: boolean) {
        if (self || !message.startsWith('!')) return

        const [command, ...args] = message
            .slice(1)
            .split(' ')
            .filter((part) => part.trim())

        console.log(command, args)
        console.log(userstate)

        if (command === 'тест') {
            this.client.say(channel, `Тест: ${args}`)
        }
    }
}
