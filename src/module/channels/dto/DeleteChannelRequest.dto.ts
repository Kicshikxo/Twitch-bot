import { ApiProperty } from '@nestjs/swagger'

export class DeleteChannelRequest {
    @ApiProperty({
        example: 'example_channel',
        description: 'Название твич канала'
    })
    channelName: string
}
