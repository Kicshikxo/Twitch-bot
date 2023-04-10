import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import isUrl from 'is-url'
import { Configuration, OpenAIApi } from 'openai'
import querystring from 'querystring'
import seedrandom from 'seedrandom'
import { VM } from 'vm2'
import youtubeSearch, { Video } from 'ytsr'
import { PrismaService } from '../prisma/prisma.service'

function randInt(min: number, max: number) {
    return ~~(Math.random() * (max - min + 1) + min)
}

@Injectable()
export class CommandsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    ask(options: { question: string; random?: boolean; fullAnswer?: boolean }): string {
        if (!options.question) return 'Введите вопрос'

        options.random ??= true
        options.fullAnswer ??= true

        const answer = seedrandom(options.random ? options.question : undefined)() < 0.5

        return options.fullAnswer
            ? `Ответ на вопрос ${options.question} - ${answer ? 'Да' : 'Нет'}`
            : `${answer ? 'Да' : 'Нет'}`
    }

    choice(options: { options: string[] }): string {
        if (!Array.isArray(options.options) || options.options.length < 2)
            return 'Количество вариантов должно быть больше одного'

        return options.options[randInt(0, options.options.length - 1)]
    }

    calc(options: { expression: string }): string {
        if (!options.expression) return 'Введите пример, например "2+2"'

        try {
            return new VM().run(`eval("${options.expression}")`).toString()
        } catch (e) {
            return `Ошибка: ${e.message}`
        }
    }

    async dj(options: {
        channelId: string
        command: string
        query?: string
        nickname?: string
        djLink?: string
    }): Promise<string> {
        if (['current'].includes(options.command)) {
            const { data: response } = await this.httpService.axiosRef.get(
                `https://streamdj.ru/api/get_track/${options.channelId}`
            )

            if (response === null) return 'Ничего не играет'
            else
                return `Текущий трек: ${response.title}, прислал - ${response.author}. Ссылка: https://www.youtube.com/watch?v=${response.yid}`
        }
        if (['count'].includes(options.command)) {
            const { data: response } = await this.httpService.axiosRef.get(
                `https://streamdj.ru/api/playlist/${options.channelId}/c`
            )
            return `Количество треков: ${Object.keys(response).length}`
        }
        if (['list'].includes(options.command)) {
            const { data: response } = await this.httpService.axiosRef.get(
                `https://streamdj.ru/api/playlist/${options.channelId}/c`
            )

            if (response === false) return 'Список треков пуст :('
            else {
                return `Количество треков: ${Object.keys(response).length}. ${Object.keys(response)
                    .map((index) => `${index} - ${response[index].title}; `)
                    .join('')}`
            }
        }
        if (['add'].includes(options.command)) {
            if (!options.query) throw new BadRequestException('Не указано название трека или ютуб ссылка')

            const videoLink = isUrl(options.query)
                ? options.query
                : ((await youtubeSearch(`${options.query} Official Music Video`, { limit: 1 })).items.at(0) as Video).url

            const { data: response } = await this.httpService.axiosRef.post(
                `https://streamdj.app/includes/back.php?func=add_track&channel=99840`,
                querystring.stringify({
                    url: videoLink,
                    author: options.nickname ?? this.configService.get('TWITCH_BOT_USERNAME') ?? 'unknown'
                })
            )

            if (response.success) {
                return 'Трек успешно добавлен'
            } else if (response.error) {
                return `Ошибка: ${response?.error?.toLowerCase()}`
            } else {
                return 'Произошла неизвестная ошибка'
            }
        }
        if (['link'].includes(options.command) && options.djLink) {
            return `Ссылка на диджея: ${options.djLink}`
        }

        return 'Неизвестная команда'
    }

    async gpt(options: { question: string; key: string }): Promise<string> {
        const openai = new OpenAIApi(new Configuration({ apiKey: options.key }))
        try {
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                messages: [{ role: 'user', content: options.question }]
            })
            return response.data.choices.at(0)?.message?.content ?? ''
        } catch (e) {
            return `Ошибка: ${e.response.data.error.message}`
        }
    }
}
