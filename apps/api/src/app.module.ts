import { Module } from "@nestjs/common"
import { AnalyticsModule } from "./analytics/analytics.module"
import { AuthModule } from "./auth/auth.module"
import { HealthModule } from "./health/health.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { OtpModule } from "./otp/otp.module"
import { ProvidersModule } from "./providers/providers.module"
import { RecipientsModule } from "./recipients/recipients.module"
import { TemplatesModule } from "./templates/templates.module"

@Module({
    imports: [
        AnalyticsModule,
        AuthModule,
        HealthModule,
        NotificationsModule,
        OtpModule,
        ProvidersModule,
        RecipientsModule,
        TemplatesModule,
    ],
})
export class AppModule {}
