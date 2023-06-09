import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import crc32 from 'crc/crc32'
import { Request, Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'
import { AuthService } from './auth.service'
import { TokenDataDto } from './dto/token.data.dto'

declare module 'express' {
    interface Request {
        channelTokenData?: TokenDataDto
    }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService, private readonly prismaService: PrismaService) {}

    async use(req: Request, res: Response, next: () => void) {
        req.channelTokenData = this.authService.readToken(req.headers.authorization?.substring('Bearer '.length))
        if (!req.channelTokenData) {
            throw new UnauthorizedException()
        }

        const channel = await this.prismaService.channel.findUnique({ where: { id: req.channelTokenData.id } })
        if (!channel) {
            throw new UnauthorizedException('Канал не найден')
        }
        if (req.channelTokenData.password !== crc32(channel.password).toString(16)) {
            throw new UnauthorizedException('Пароль был изменён')
        }

        next()
    }
}
