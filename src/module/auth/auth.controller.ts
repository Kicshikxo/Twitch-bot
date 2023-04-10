import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { AuthService } from './auth.service'

@ApiTags('Авторизация')
@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Получение токена аутентификации' })
    @ApiCreatedResponse({
        description: 'Токен аутентификации'
    })
    @ApiBadRequestResponse({
        description: 'Не указан логин или пароль'
    })
    @ApiUnauthorizedResponse({
        description: 'Неверные данные для входа'
    })
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                login: {
                    type: 'string',
                    description: 'Логин пользователя',
                    example: 'test'
                },
                password: {
                    type: 'string',
                    description: 'Пароль пользователя',
                    example: 'test'
                }
            },
            required: ['login', 'password']
        },
        description: 'Данные для аутентификации',
        required: true
    })
    login(@Body('login') login: string, @Body('password') password: string) {
        if (!login) throw new BadRequestException('Обязательный параметр login не указан')
        if (!password) throw new BadRequestException('Обязательный параметр password не указан')

        return this.authService.login({ login, password })
    }
}
