import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { TokenDataDto } from './dto/token.data.dto'

declare module 'express' {
    interface Request {
        tokenData?: TokenDataDto
    }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) {}

    use(req: Request, res: Response, next: () => void) {
        req.tokenData = this.authService.readToken(req.headers.authorization?.substring('Bearer '.length))
        if (!req.tokenData) {
            throw new UnauthorizedException()
        }

        next()
    }
}
