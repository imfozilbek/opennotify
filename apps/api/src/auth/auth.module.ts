import { Global, Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import {
    InMemoryApiKeyRepository,
    InMemoryMerchantRepository,
} from "../infrastructure/repositories"

// Shared repository instances (singleton for in-memory storage)
const merchantRepository = new InMemoryMerchantRepository()
const apiKeyRepository = new InMemoryApiKeyRepository()

@Global()
@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: "MerchantRepository",
            useValue: merchantRepository,
        },
        {
            provide: "ApiKeyRepository",
            useValue: apiKeyRepository,
        },
    ],
    exports: ["MerchantRepository", "ApiKeyRepository"],
})
export class AuthModule {}
