import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BotModule } from './module/bot.module'

@Module({
    imports: [BotModule, ConfigModule.forRoot()],
    controllers: [],
    providers: []
})
export class AppModule {}
