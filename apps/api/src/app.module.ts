import { Module } from "@nestjs/common"
import { AnalyticsModule } from "./analytics/analytics.module"
import { ApiKeysModule } from "./api-keys/api-keys.module"
import { AuthModule } from "./auth/auth.module"
import { HealthModule } from "./health/health.module"
import { WebhookLogsModule } from "./webhook-logs/webhook-logs.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { OtpModule } from "./otp/otp.module"
import { ProvidersModule } from "./providers/providers.module"
import { RecipientsModule } from "./recipients/recipients.module"
import { TemplatesModule } from "./templates/templates.module"
import { TeamsModule } from "./teams/teams.module"
import { WebhooksModule } from "./webhooks/webhooks.module"

@Module({
    imports: [
        AnalyticsModule,
        ApiKeysModule,
        AuthModule,
        HealthModule,
        WebhookLogsModule,
        NotificationsModule,
        OtpModule,
        ProvidersModule,
        RecipientsModule,
        TemplatesModule,
        TeamsModule,
        WebhooksModule,
    ],
})
export class AppModule {}
