import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { BotModule } from './module/bot.module'
import { createSwagger } from './swagger'

async function bootstrap() {
    const app = await NestFactory.create(BotModule)
    createSwagger(app)
    const configService = app.get(ConfigService)
    await app.listen(configService.get('PORT') ?? 3000)
}
bootstrap()
