import { Injectable } from '@nestjs/common'
import { SettingType } from '../prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelService {
    constructor(private readonly prismaService: PrismaService) {}

    async renameChannel(options: { channelId: string; channelName: string }) {
        return await this.prismaService.channel.update({
            where: { id: options.channelId },
            data: { name: options.channelName }
        })
    }

    async setOpenOpenAiApiKey(options: { channelId: string; key: string }) {
        return await this.prismaService.settings.upsert({
            where: {
                channelId_type: {
                    channelId: options.channelId,
                    type: SettingType.OPEN_AI_API_KEY
                }
            },
            create: {
                channelId: options.channelId,
                value: options.key,
                type: SettingType.OPEN_AI_API_KEY
            },
            update: {
                value: options.key,
                type: SettingType.OPEN_AI_API_KEY
            }
        })
    }
}
