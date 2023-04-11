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
import { ChannelConfigService } from './channelConfig.service'

@ApiBearerAuth()
@ApiTags('Конфигурация каналов')
@Controller('channels/config')
export class ChannelConfigController {
    constructor(private readonly channelConfigService: ChannelConfigService) {}

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

        return await this.channelConfigService.setOpenOpenAiApiKey({ channelId: request.tokenData?.id ?? '', key })
    }
}
