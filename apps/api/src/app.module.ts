import { Module } from "@nestjs/common"
import { AuthModule } from "./auth/auth.module"
import { HealthModule } from "./health/health.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { OtpModule } from "./otp/otp.module"
import { ProvidersModule } from "./providers/providers.module"
import { TemplatesModule } from "./templates/templates.module"

@Module({
    imports: [
        AuthModule,
        HealthModule,
        NotificationsModule,
        OtpModule,
        ProvidersModule,
        TemplatesModule,
    ],
})
export class AppModule {}
