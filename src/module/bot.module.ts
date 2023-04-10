import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth/auth.controller'
import { AuthMiddleware } from './auth/auth.middleware'
import { AuthService } from './auth/auth.service'
import { BotService } from './bot.service'
import { ChannelsController } from './channels/channels.controller'
import { ChannelsService } from './channels/channels.service'
import { CommandsController } from './commands/commands.controller'
import { CommandsService } from './commands/commands.service'
import { PrismaService } from './prisma/prisma.service'

@Module({
    imports: [
        HttpModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('TWITCH_AUTH_SECRET_KEY')
            }),
            inject: [ConfigService]
        }),
        ConfigModule.forRoot()
    ],
    controllers: [AuthController, ChannelsController, CommandsController],
    providers: [BotService, AuthService, ChannelsService, CommandsService, PrismaService, ConfigService]
})
export class BotModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(ChannelsController)
    }
}
