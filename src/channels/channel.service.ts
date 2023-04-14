import { Injectable } from '@nestjs/common'
import { BotService } from '../bot.service'
import { ConfigType } from '../prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelService {
    constructor(private readonly prismaService: PrismaService, private readonly botService: BotService) {}

    async renameChannel(options: { channelId: string; channelName: string }) {
        const response = await this.prismaService.channel.update({
            where: { id: options.channelId },
            data: { name: options.channelName }
        })
        await this.botService.onModuleInit()
        return response
    }

    async setOpenOpenAiApiKey(options: { channelId: string; key: string }) {
        const response = await this.prismaService.config.upsert({
            where: {
                channelId_type: {
                    channelId: options.channelId,
                    type: ConfigType.OPEN_AI_API_KEY
                }
            },
            create: {
                channelId: options.channelId,
                value: options.key,
                type: ConfigType.OPEN_AI_API_KEY
            },
            update: {
                value: options.key,
                type: ConfigType.OPEN_AI_API_KEY
            }
        })
        await this.botService.onModuleInit()
        return response
    }
}
