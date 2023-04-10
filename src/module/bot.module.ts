import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BotService } from './bot.service'
import { ChannelsController } from './channels/channels.controller'
import { ChannelsService } from './channels/channels.service'
import { CommandsController } from './commands/commands.controller'
import { CommandsService } from './commands/commands.service'
import { PrismaService } from './prisma/prisma.service'

@Module({
    imports: [HttpModule, ConfigModule.forRoot()],
    controllers: [ChannelsController, CommandsController],
    providers: [BotService, ChannelsService, CommandsService, PrismaService, ConfigService]
})
export class BotModule {}
