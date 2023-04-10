import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { BotModule } from './bot/bot.module'

function createSwagger(app: INestApplication) {
    const moobotOptions = new DocumentBuilder()
        .setTitle('Kicshikxo Twitch bot API')
        .setDescription('<a href="https://github.com/Kicshikxo/Moobot-commands#readme" target="_blank"><b>Документация</b></a>')
        .setVersion('')
        .build()

    const moobotDocument = SwaggerModule.createDocument(app, moobotOptions, {
        include: [BotModule]
    })

    SwaggerModule.setup('/', app, moobotDocument, {
        customCss: '.swagger-ui .topbar { display: none } * { outline: none !important }',
        customSiteTitle: 'Kicshikxo Twitch bot API'
    })
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    createSwagger(app)
    const configService = app.get(ConfigService)
    await app.listen(configService.get('PORT') ?? 3000)
}
bootstrap()
