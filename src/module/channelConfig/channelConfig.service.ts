import { Injectable } from '@nestjs/common'
import { SettingType } from '../prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelConfigService {
    constructor(private readonly prismaService: PrismaService) {}

    async setOpenOpenAiApiKey(options: { channelId: string; key: string }) {
        await this.prismaService.settings.upsert({
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
        return 'Ключ успешно установлен'
    }
}
