import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CommandsService } from './commands.service'

@ApiTags('Команды')
@Controller('commands')
export class CommandsController {
    constructor(private readonly commandsService: CommandsService) {}

    @Get('ask')
    @ApiOperation({ summary: 'Ответить на вопрос да или нет' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: 'Ответ на вопрос команда крутая? - Да'
        },
        description: 'Ответ на вопрос'
    })
    @ApiQuery({
        name: 'full-answer',
        description:
            "Использовать полный ответ на вопрос по шаблону: 'Ответ на вопрос ${question} - ${answer}' (по умолчанию true)",
        type: Boolean,
        required: false,
        example: true
    })
    @ApiQuery({
        name: 'random',
        description: 'Отвечать на вопрос рандомно, или всегда отвечать на одинаковые вопросы одинаково (по умолчанию true)',
        type: Boolean,
        required: false,
        example: false
    })
    @ApiQuery({
        name: 'question',
        description: 'Текст вопроса',
        type: String,
        required: true,
        example: 'команда крутая?'
    })
    ask(
        @Query('question') question: string,
        @Query('random') random?: boolean,
        @Query('full-answer') fullAnswer?: boolean
    ): string {
        if (!question) throw new BadRequestException('Обязательный параметр question не указан')

        return this.commandsService.ask({ question, random, fullAnswer })
    }

    @Get('choice')
    @ApiOperation({ summary: 'Выбрать один из переданных вариантов' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: 'Кошки'
        },
        description: 'Случайный выбор из предложенных вариантов'
    })
    @ApiQuery({
        name: 'options',
        description: 'Варианты выбора',
        schema: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        example: ['Кошки', 'Собаки'],
        required: true
    })
    choice(@Query('options') options: string[]): string {
        if (!options) throw new BadRequestException('Обязательный параметр options не указан')
        if (!Array.isArray(options) || options.length < 2)
            throw new BadRequestException('Количество вариантов должно быть больше одного')

        return this.commandsService.choice({ options })
    }

    @Get('calc')
    @ApiOperation({ summary: 'Решить математический пример' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: '4'
        },
        description: 'Результат вычисления математического выражения'
    })
    @ApiQuery({
        name: 'expression',
        description: 'Математическое выражение для вычисления',
        type: String,
        required: true,
        example: '2 + 2'
    })
    calc(@Query('expression') expression: string): string {
        if (!expression) throw new BadRequestException('Обязательный параметр expression не указан')

        return this.commandsService.calc({ expression })
    }

    @Get('gpt')
    @ApiOperation({ summary: 'Задать вопрос ChatGPT' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: 'Привет! Чем я могу Вам помочь?'
        },
        description: 'Ответ на вопрос'
    })
    @ApiQuery({
        name: 'question',
        description: 'Текст вопроса',
        type: String,
        required: true,
        example: 'Привет'
    })
    @ApiQuery({
        name: 'key',
        description: 'OpenAI API Key',
        type: String,
        required: true,
        example: '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'
    })
    @ApiQuery({
        name: 'channel',
        description: 'Название канала для запоминания контекста',
        type: String,
        required: false,
        example: 'example_channel'
    })
    @ApiQuery({
        name: 'username',
        description: 'Имя пользователя для запоминания контекста',
        type: String,
        required: false,
        example: 'example_user'
    })
    async gpt(
        @Query('question') question: string,
        @Query('key') key: string,
        @Query('channel') channel?: string,
        @Query('username') username?: string
    ): Promise<string> {
        if (!question) throw new BadRequestException('Обязательный параметр question не указан')
        if (!key) throw new BadRequestException('Обязательный параметр key не указан')

        return await this.commandsService.gpt({ question, key, channel, username })
    }

    @Get('gpt/clear-history')
    @ApiOperation({ summary: 'Удалить историю с ChatGPT' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: 'История очищена'
        },
        description: 'Результат удаления'
    })
    @ApiQuery({
        name: 'channel',
        description: 'Название канала для удаления истории',
        type: String,
        required: true,
        example: 'example_channel'
    })
    @ApiQuery({
        name: 'username',
        description: 'Имя пользователя для удаления истории',
        type: String,
        required: true,
        example: 'example_user'
    })
    async gptClearHistory(@Query('channel') channel: string, @Query('username') username: string): Promise<string> {
        if (!channel) throw new BadRequestException('Обязательный параметр channel не указан')
        if (!username) throw new BadRequestException('Обязательный параметр username не указан')

        return await this.commandsService.gptClearHistory({ channel, username })
    }

    @Get('dj')
    @ApiOperation({ summary: 'Взаимодействие с StreamDJ' })
    @ApiQuery({
        name: 'channel-id',
        description: 'ID канала на StreamDJ',
        type: String,
        required: true,
        example: '00000'
    })
    @ApiQuery({
        name: 'command',
        description: 'Команда',
        type: String,
        required: true,
        example: 'add'
    })
    @ApiQuery({
        name: 'query',
        description: 'Запрос для команды',
        type: String,
        required: false,
        example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    })
    @ApiQuery({
        name: 'nickname',
        description: 'Никнейм пользователя который обращается к команде',
        type: String,
        required: false,
        example: 'example_user'
    })
    @ApiQuery({
        name: 'dj-link',
        description: 'Ссылка на страницу Stream Dj',
        type: String,
        required: false,
        example: 'https://streamdj.app/c/<your_nickname>'
    })
    dj(
        @Query('channel-id') channelId: string,
        @Query('command') command: string,
        @Query('query') query?: string,
        @Query('nickname') nickname?: string,
        @Query('dj-link') djLink?: string
    ): Promise<string> {
        if (!channelId) throw new BadRequestException('Обязательный параметр channel-id не указан')
        if (!command) throw new BadRequestException('Обязательный параметр command не указан')

        return this.commandsService.dj({ channelId, command, query, nickname, djLink })
    }
}
