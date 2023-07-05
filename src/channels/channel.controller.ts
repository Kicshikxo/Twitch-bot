import { BadRequestException, Body, Controller, Post, Req } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { ChannelService } from './channel.service'

@ApiBearerAuth()
@ApiTags('Каналы')
@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Post('/rename')
    @ApiOperation({ summary: 'Изменить название канала' })
    @ApiCreatedResponse({
        description: 'Успех: название канала успешно изменено'
    })
    @ApiBadRequestResponse({
        description: 'Ошибка: не указано название канала'
    })
    @ApiInternalServerErrorResponse({
        description: 'Ошибка: не удалось изменить название канала'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                channelName: {
                    type: 'string',
                    description: 'Новое название канала',
                    example: 'example_channel'
                }
            },
            required: ['channelName']
        },
        required: true
    })
    createChannel(@Req() request: Request, @Body('channelName') channelName: string) {
        if (!channelName) throw new BadRequestException('Обязательный параметр channelName не указан')

        return this.channelService.renameChannel({ channelId: request.channelTokenData?.id ?? '', channelName })
    }

    @Post('set-openai-api-key')
    @ApiOperation({ summary: 'Установить OpenAI API ключ для канала' })
    @ApiCreatedResponse({
        description: 'Успех: ключ успешно установлен'
    })
    @ApiBadRequestResponse({
        description: 'Ошибка: не указан ключ'
    })
    @ApiInternalServerErrorResponse({
        description: 'Ошибка: не удалось установить ключ'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    description: 'OpenAI API key',
                    example: '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'
                }
            },
            required: ['key']
        },
        required: true
    })
    async setOpenOpenAiApiKey(@Req() request: Request, @Body('key') key: string) {
        if (!key) throw new BadRequestException('Обязательный параметр key не указан')

        return await this.channelService.setOpenOpenAiApiKey({ channelId: request.channelTokenData?.id ?? '', key })
    }

    @Post('set-stream-dj-id')
    @ApiOperation({ summary: 'Установить идентификатор StreamDJ для канала' })
    @ApiCreatedResponse({
        description: 'Успех: идентификатор StreamDJ успешно установлен'
    })
    @ApiBadRequestResponse({
        description: 'Ошибка: не указан идентификатор'
    })
    @ApiInternalServerErrorResponse({
        description: 'Ошибка: не удалось установить идентификатор'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'number',
                    description: 'StreamDJ id',
                    example: '000000'
                }
            },
            required: ['id']
        },
        required: true
    })
    async setStreamDjChannelId(@Req() request: Request, @Body('id') id: string) {
        if (!id) throw new BadRequestException('Обязательный параметр id не указан')

        return await this.channelService.setStreamDjChannelId({ channelId: request.channelTokenData?.id ?? '', id })
    }

    @Post('set-stream-dj-link')
    @ApiOperation({ summary: 'Установить ссылку на StreamDJ для канала' })
    @ApiCreatedResponse({
        description: 'Успех: ссылка на StreamDJ успешно установлена'
    })
    @ApiBadRequestResponse({
        description: 'Ошибка: не указана ссылка'
    })
    @ApiInternalServerErrorResponse({
        description: 'Ошибка: не удалось установить ссылку'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                link: {
                    type: 'string',
                    description: 'StreamDJ link',
                    example: 'https://streamdj.app/c/example_channel'
                }
            },
            required: ['link']
        },
        required: true
    })
    async setStreamDjLink(@Req() request: Request, @Body('link') link: string) {
        if (!link) throw new BadRequestException('Обязательный параметр link не указан')

        return await this.channelService.setStreamDjLink({ channelId: request.channelTokenData?.id ?? '', link })
    }
}
