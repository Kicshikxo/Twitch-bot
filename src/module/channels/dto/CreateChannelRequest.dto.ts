import { ApiProperty } from '@nestjs/swagger'

export class CreateChannelRequest {
    @ApiProperty({
        example: 'example_channel',
        description: 'Название твич канала'
    })
    channelName: string
}
