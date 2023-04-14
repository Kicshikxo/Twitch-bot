import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compareSync } from 'bcrypt'
import { crc32 } from 'crc'
import { PrismaService } from '../prisma/prisma.service'
import { TokenDataDto } from './dto/token.data.dto'

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) {}

    readToken(token?: string) {
        try {
            return this.jwtService.verify(token ?? '')
        } catch {
            throw new UnauthorizedException()
        }
    }

    async login(options: { login: string; password: string }) {
        const user = await this.prismaService.channel.findUnique({ where: { name: options.login } })

        if (user && compareSync(options.password, user?.password)) {
            return this.jwtService.sign({
                id: user.id,
                password: crc32(user.password).toString(16)
            } as TokenDataDto)
        }

        throw new UnauthorizedException('Неверные данные для входа')
    }
}
