import { Body, Controller, Delete, Post } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger'
import { ChannelsService } from './channels.service'

@ApiTags('Каналы')
@Controller('channels')
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Post('/create')
    @ApiOperation({ summary: 'Добавить канал в бота' })
    @ApiCreatedResponse({
        schema: {
            type: 'string',
            example: 'Канал успешно добавлен'
        },
        description: 'Успех: канал успешно добавлен'
    })
    @ApiBadRequestResponse({
        schema: {
            type: 'string',
            example: 'Не указано название канала'
        },
        description: 'Ошибка: не указано название канала'
    })
    @ApiInternalServerErrorResponse({
        schema: {
            type: 'string',
            example: 'Ошибка добавления канала'
        },
        description: 'Ошибка: ошибка добавления канала'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                channelName: {
                    type: 'string',
                    description: 'Название канала',
                    example: 'example_channel'
                }
            },
            required: ['channelName']
        },
        required: true
    })
    createChannel(@Body('channelName') channelName: string) {
        return this.channelsService.createChannel(channelName)
    }

    @Delete('/delete')
    @ApiOperation({ summary: 'Удалить канал из бота' })
    @ApiOkResponse({
        schema: {
            type: 'string',
            example: 'Канал успешно удалён'
        },
        description: 'Успех: канал успешно удалён'
    })
    @ApiBadRequestResponse({
        schema: {
            type: 'string',
            example: 'Не указано название канала'
        },
        description: 'Ошибка: не указано название канала'
    })
    @ApiInternalServerErrorResponse({
        schema: {
            type: 'string',
            example: 'Ошибка удаления канала'
        },
        description: 'Ошибка: ошибка удаления канала'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        description: 'Название канала',
        schema: {
            type: 'object',
            properties: {
                channelName: {
                    type: 'string',
                    description: 'Название канала',
                    example: 'example_channel'
                }
            },
            required: ['channelName']
        },
        required: true
    })
    deleteChannel(@Body('channelName') channelName: string) {
        return this.channelsService.deleteChannel(channelName)
    }
}
