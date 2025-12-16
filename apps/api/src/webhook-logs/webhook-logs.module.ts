import { Module } from "@nestjs/common"
import { WebhookLogsController } from "./webhook-logs.controller"
import { WebhookLogsService } from "./webhook-logs.service"

@Module({
    controllers: [WebhookLogsController],
    providers: [WebhookLogsService],
    exports: [WebhookLogsService],
})
export class WebhookLogsModule {}
