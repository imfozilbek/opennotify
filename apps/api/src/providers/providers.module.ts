import { Module } from "@nestjs/common"
import { ProvidersController } from "./providers.controller"
import { ProvidersService } from "./providers.service"
import { MerchantProviderAdapter } from "./merchant-provider.adapter"

@Module({
    controllers: [ProvidersController],
    providers: [ProvidersService, MerchantProviderAdapter],
    exports: [ProvidersService, MerchantProviderAdapter],
})
export class ProvidersModule {}
