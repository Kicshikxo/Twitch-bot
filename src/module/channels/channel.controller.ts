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

        return this.channelService.renameChannel({ channelId: request.tokenData?.id ?? '', channelName })
    }

    @Post('set-openai-api-key')
    @ApiOperation({ summary: 'Добавить/обновить OpenAI API ключ для канала' })
    @ApiCreatedResponse({
        schema: {
            type: 'string',
            example: 'Ключ успешно установлен'
        },
        description: 'Успех: канал успешно установлен'
    })
    @ApiBadRequestResponse({
        description: 'Ошибка: не указан ключ'
    })
    @ApiInternalServerErrorResponse({
        description: 'Ошибка: не удалось добавить/обновить ключ'
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

        return await this.channelService.setOpenOpenAiApiKey({ channelId: request.tokenData?.id ?? '', key })
    }
}
