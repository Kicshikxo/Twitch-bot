import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BotController } from './bot.controller'
import { BotService } from './bot.service'
import { ChannelsController } from './channels/channels.controller'
import { ChannelsService } from './channels/channels.service'
import { PrismaService } from './prisma/prisma.service'

@Module({
    imports: [],
    controllers: [BotController, ChannelsController],
    providers: [BotService, ChannelsService, PrismaService, ConfigService]
})
export class BotModule {}
