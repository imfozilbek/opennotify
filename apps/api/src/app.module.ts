import { Module } from "@nestjs/common"
import { NotificationsModule } from "./notifications/notifications.module"
import { OtpModule } from "./otp/otp.module"
import { HealthModule } from "./health/health.module"

@Module({
    imports: [HealthModule, NotificationsModule, OtpModule],
})
export class AppModule {}
