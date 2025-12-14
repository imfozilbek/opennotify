import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import {
    ApiKeyPermission,
    ApiKeyRepositoryPort,
    MerchantRepositoryPort,
    ValidateApiKeyUseCase,
} from "@opennotify/core"
import { Request } from "express"

export const PERMISSIONS_KEY = "permissions"

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly validateUseCase: ValidateApiKeyUseCase

    constructor(
        @Inject("MerchantRepository")
        private readonly merchantRepository: MerchantRepositoryPort,
        @Inject("ApiKeyRepository")
        private readonly apiKeyRepository: ApiKeyRepositoryPort,
        private readonly reflector: Reflector,
    ) {
        this.validateUseCase = new ValidateApiKeyUseCase(
            this.apiKeyRepository,
            this.merchantRepository,
        )
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()
        const apiKey = this.extractApiKey(request)

        if (!apiKey) {
            throw new UnauthorizedException("API key is required")
        }

        // Get required permissions from decorator
        const requiredPermissions = this.reflector.getAllAndOverride<ApiKeyPermission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        )

        const result = await this.validateUseCase.execute({
            rawKey: apiKey,
            requiredPermissions,
        })

        if (!result.valid || !result.merchant || !result.apiKey) {
            throw new UnauthorizedException(result.errorMessage ?? "Invalid API key")
        }

        // Attach merchant and apiKey to request
        ;(request as RequestWithMerchant).merchant = result.merchant
        ;(request as RequestWithMerchant).apiKey = result.apiKey

        return true
    }

    private extractApiKey(request: Request): string | undefined {
        const header = request.headers["x-api-key"]
        if (typeof header === "string") {
            return header
        }
        return undefined
    }
}

export interface RequestWithMerchant extends Request {
    merchant: import("@opennotify/core").Merchant
    apiKey: import("@opennotify/core").ApiKey
}
