import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChannelsService {
    constructor(private readonly prismaService: PrismaService) {}

    async createChannel(channelName: string) {
        return await this.prismaService.channel.create({ data: { name: channelName } })
    }

    async deleteChannel(channelName: string) {
        return await this.prismaService.channel.delete({ where: { name: channelName } })
    }
}
