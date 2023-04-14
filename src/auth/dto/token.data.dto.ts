import { ApiProperty } from '@nestjs/swagger'

export class TokenDataDto {
    @ApiProperty({
        example: '8e4aa71a-fb3a-404d-af89-9a22eeec8f4c',
        description: 'uuid-v4 пользователя',
        required: true
    })
    id: string

    @ApiProperty({
        example: 'CBF43926',
        description: 'Пароль в хэше crc32',
        required: false
    })
    password: string
}
