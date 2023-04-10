import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { BotModule } from './module/bot.module'

export const createDocument = (app: INestApplication) => {
    const options = new DocumentBuilder()
        .setTitle('Kicshikxo Twitch bot API')
        .setDescription('<a href="https://github.com/Kicshikxo/Twitch-bot#readme" target="_blank"><b>Документация</b></a>')
        .setVersion('')
        .build()

    const document = SwaggerModule.createDocument(app, options, {
        include: [BotModule]
    })

    return document
}

export const createSwagger = (app: INestApplication, options?: { path?: string }) => {
    const document = createDocument(app)

    SwaggerModule.setup(options?.path ?? '/', app, document, {
        customCss: '.swagger-ui .topbar{display:none}*{outline:none!important;font-family:Rubik,sans-serif!important}',
        customCssUrl: 'https://fonts.googleapis.com/css2?family=Rubik&display=swap',
        customSiteTitle: 'Kicshikxo Twitch bot API'
    })
}
