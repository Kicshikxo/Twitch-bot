import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { BotService } from '../bot.service'
import { ConfigType } from '../prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelService {
    constructor(
        private readonly prismaService: PrismaService,
        @Inject(forwardRef(() => BotService))
        private readonly botService: BotService
    ) {}

    async renameChannel(options: { channelId: string; channelName: string }) {
        await this.prismaService.channel.update({
            where: { id: options.channelId },
            data: { name: options.channelName }
        })
        await this.botService.onModuleInit()
        return 'Название канала успешно изменено'
    }

    async setOpenOpenAiApiKey(options: { channelId: string; key: string }) {
        if (!/^sk-[A-Za-z0-9-_]{48}$/.test(options.key)) {
            return 'Неверный формат ключа'
        }

        await this.prismaService.config.upsert({
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
        return 'Ключ успешно установлен'
    }

    async setStreamDjChannelId(options: { channelId: string; id: string }) {
        if (!/^\d+$/.test(options.id)) {
            return 'Неверный формат идентификатора StreamDJ'
        }

        await this.prismaService.config.upsert({
            where: {
                channelId_type: {
                    channelId: options.channelId,
                    type: ConfigType.STREAM_DJ_ID
                }
            },
            create: {
                channelId: options.channelId,
                value: options.id,
                type: ConfigType.STREAM_DJ_ID
            },
            update: {
                value: options.id,
                type: ConfigType.STREAM_DJ_ID
            }
        })
        return 'Идентификатор StreamDJ успешно установлен'
    }

    async setStreamDjLink(options: { channelId: string; link: string }) {
        if (!/^https:\/\/streamdj.app\/c\/\w+$/.test(options.link)) {
            return 'Неверный формат ссылки на StreamDJ'
        }

        await this.prismaService.config.upsert({
            where: {
                channelId_type: {
                    channelId: options.channelId,
                    type: ConfigType.STREAM_DJ_LINK
                }
            },
            create: {
                channelId: options.channelId,
                value: options.link,
                type: ConfigType.STREAM_DJ_LINK
            },
            update: {
                value: options.link,
                type: ConfigType.STREAM_DJ_LINK
            }
        })
        return 'Ссылка на StreamDJ успешно установлена'
    }
}
