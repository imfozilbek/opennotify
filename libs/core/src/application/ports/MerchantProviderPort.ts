import { Provider } from "../../domain/value-objects/Provider"
import { NotificationProviderPort } from "./NotificationProviderPort"

/**
 * Port for accessing merchant's connected providers.
 *
 * This port bridges the gap between the stored provider credentials
 * and the notification sending flow. It allows the routing engine
 * to get dynamically configured provider adapters based on the
 * merchant's connected providers.
 *
 * @example
 * ```typescript
 * class MerchantProviderAdapter implements MerchantProviderPort {
 *     async getConnectedProviders(merchantId: string): Promise<Provider[]> {
 *         // Fetch from database
 *     }
 *
 *     async getProviderAdapter(
 *         merchantId: string,
 *         provider: Provider,
 *     ): Promise<NotificationProviderPort | null> {
 *         // Get credentials and create adapter
 *     }
 * }
 * ```
 */
export interface MerchantProviderPort {
    /**
     * Get all providers connected by a merchant.
     *
     * @param merchantId - The merchant's ID
     * @returns Array of connected provider types
     */
    getConnectedProviders(merchantId: string): Promise<Provider[]>

    /**
     * Get a provider adapter instance initialized with merchant's credentials.
     *
     * Returns null if the merchant hasn't connected this provider.
     *
     * @param merchantId - The merchant's ID
     * @param provider - The provider type
     * @returns Initialized provider adapter or null
     */
    getProviderAdapter(
        merchantId: string,
        provider: Provider,
    ): Promise<NotificationProviderPort | null>

    /**
     * Check if a merchant has connected a specific provider.
     *
     * @param merchantId - The merchant's ID
     * @param provider - The provider type
     * @returns True if connected
     */
    hasProvider(merchantId: string, provider: Provider): Promise<boolean>
}
