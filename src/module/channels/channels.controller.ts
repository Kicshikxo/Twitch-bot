import { Body, Controller, Delete, Post } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger'
import { ChannelsService } from './channels.service'
import { CreateChannelRequest } from './dto/CreateChannelRequest.dto'
import { DeleteChannelRequest } from './dto/DeleteChannelRequest.dto'

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
    @ApiBody({
        description: 'Название канала',
        type: CreateChannelRequest,
        required: true
    })
    createChannel(@Body() createChannelData: CreateChannelRequest) {
        return this.channelsService.createChannel(createChannelData.channelName)
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
    @ApiBody({
        description: 'Название канала',
        type: DeleteChannelRequest,
        required: true
    })
    deleteChannel(@Body() deleteChannelData: DeleteChannelRequest) {
        return this.channelsService.deleteChannel(deleteChannelData.channelName)
    }
}
