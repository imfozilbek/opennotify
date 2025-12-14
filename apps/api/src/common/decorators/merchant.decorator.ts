import {
    createParamDecorator,
    CustomDecorator,
    ExecutionContext,
    SetMetadata,
} from "@nestjs/common"
import { ApiKeyPermission } from "@opennotify/core"
import { PERMISSIONS_KEY, RequestWithMerchant } from "../guards/api-key.guard"

/**
 * Decorator to get the authenticated merchant from request.
 *
 * @example
 * ```typescript
 * @Get("profile")
 * @UseGuards(ApiKeyGuard)
 * getProfile(@CurrentMerchant() merchant: Merchant) {
 *     return { name: merchant.name, email: merchant.email }
 * }
 * ```
 */
export const CurrentMerchant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithMerchant>()
    return request.merchant
})

/**
 * Decorator to get the authenticated API key from request.
 *
 * @example
 * ```typescript
 * @Get("key-info")
 * @UseGuards(ApiKeyGuard)
 * getKeyInfo(@CurrentApiKey() apiKey: ApiKey) {
 *     return { name: apiKey.name, permissions: apiKey.permissions }
 * }
 * ```
 */
export const CurrentApiKey = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithMerchant>()
    return request.apiKey
})

/**
 * Decorator to require specific permissions for an endpoint.
 *
 * @example
 * ```typescript
 * @Post("send")
 * @UseGuards(ApiKeyGuard)
 * @RequirePermissions(ApiKeyPermission.SEND)
 * async sendNotification() { ... }
 * ```
 */
export const RequirePermissions = (...permissions: ApiKeyPermission[]): CustomDecorator =>
    SetMetadata(PERMISSIONS_KEY, permissions)
