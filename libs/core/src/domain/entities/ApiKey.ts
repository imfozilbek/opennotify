import * as nodeCrypto from "crypto"

/**
 * API key permissions.
 */
export enum ApiKeyPermission {
    /** Can send notifications */
    SEND = "SEND",

    /** Can read notification status */
    READ = "READ",

    /** Can manage templates */
    TEMPLATES = "TEMPLATES",

    /** Can manage recipients */
    RECIPIENTS = "RECIPIENTS",

    /** Full access */
    ADMIN = "ADMIN",
}

/**
 * Properties for creating a new ApiKey.
 */
export interface CreateApiKeyProps {
    id: string
    merchantId: string
    name: string
    keyHash: string
    keyPrefix: string
    permissions: ApiKeyPermission[]
    expiresAt?: Date
    metadata?: Record<string, unknown>
}

/**
 * Properties for reconstructing an ApiKey from persistence.
 */
export interface ApiKeyProps extends CreateApiKeyProps {
    isActive: boolean
    lastUsedAt?: Date
    createdAt: Date
    updatedAt: Date
}

/**
 * ApiKey entity for authenticating API requests.
 *
 * The actual key is only available at creation time.
 * Only the hash and prefix are stored for validation.
 *
 * @example
 * ```typescript
 * // Generate a new API key
 * const { apiKey, rawKey } = ApiKey.generate({
 *     id: "key_123",
 *     merchantId: "merchant_456",
 *     name: "Production Key",
 *     permissions: [ApiKeyPermission.SEND, ApiKeyPermission.READ],
 * })
 *
 * // rawKey: "on_live_abc123..." (show to user once)
 * // apiKey.keyPrefix: "on_live_abc" (for identification)
 * // apiKey.keyHash: "sha256..." (for validation)
 *
 * // Validate incoming request
 * const isValid = apiKey.validateKey(incomingKey)
 * ```
 */
export class ApiKey {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _keyHash: string
    private readonly _keyPrefix: string
    private readonly _createdAt: Date

    private _name: string
    private _permissions: ApiKeyPermission[]
    private _isActive: boolean
    private readonly _expiresAt?: Date
    private _lastUsedAt?: Date
    private readonly _metadata: Record<string, unknown>
    private _updatedAt: Date

    private constructor(props: ApiKeyProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._name = props.name
        this._keyHash = props.keyHash
        this._keyPrefix = props.keyPrefix
        this._permissions = [...props.permissions]
        this._isActive = props.isActive
        this._expiresAt = props.expiresAt
        this._lastUsedAt = props.lastUsedAt
        this._metadata = { ...props.metadata }
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new API key.
     * Use ApiKey.generate() to create with a raw key.
     */
    static create(props: CreateApiKeyProps): ApiKey {
        const now = new Date()
        return new ApiKey({
            ...props,
            isActive: true,
            metadata: props.metadata ?? {},
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct an API key from persistence.
     */
    static fromPersistence(props: ApiKeyProps): ApiKey {
        return new ApiKey(props)
    }

    /**
     * Generate a new API key with raw key.
     * Returns both the entity and the raw key (show to user once).
     */
    static generate(props: {
        id: string
        merchantId: string
        name: string
        permissions: ApiKeyPermission[]
        expiresAt?: Date
        metadata?: Record<string, unknown>
        environment?: "live" | "test"
    }): { apiKey: ApiKey; rawKey: string } {
        const env = props.environment ?? "live"
        const randomPart = generateRandomString(32)
        const rawKey = `on_${env}_${randomPart}`
        const keyPrefix = `on_${env}_${randomPart.substring(0, 8)}`
        const keyHash = hashKey(rawKey)

        const apiKey = ApiKey.create({
            id: props.id,
            merchantId: props.merchantId,
            name: props.name,
            keyHash,
            keyPrefix,
            permissions: props.permissions,
            expiresAt: props.expiresAt,
            metadata: props.metadata,
        })

        return { apiKey, rawKey }
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get name(): string {
        return this._name
    }

    get keyHash(): string {
        return this._keyHash
    }

    get keyPrefix(): string {
        return this._keyPrefix
    }

    get permissions(): ApiKeyPermission[] {
        return [...this._permissions]
    }

    get isActive(): boolean {
        return this._isActive
    }

    get expiresAt(): Date | undefined {
        return this._expiresAt
    }

    get lastUsedAt(): Date | undefined {
        return this._lastUsedAt
    }

    get metadata(): Record<string, unknown> {
        return { ...this._metadata }
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    /**
     * Check if key is valid (active and not expired).
     */
    isValid(): boolean {
        if (!this._isActive) {
            return false
        }
        if (this._expiresAt && this._expiresAt < new Date()) {
            return false
        }
        return true
    }

    /**
     * Check if key has expired.
     */
    isExpired(): boolean {
        return Boolean(this._expiresAt && this._expiresAt < new Date())
    }

    /**
     * Validate a raw key against this API key.
     */
    validateKey(rawKey: string): boolean {
        if (!this.isValid()) {
            return false
        }
        return hashKey(rawKey) === this._keyHash
    }

    /**
     * Check if key has a specific permission.
     */
    hasPermission(permission: ApiKeyPermission): boolean {
        if (this._permissions.includes(ApiKeyPermission.ADMIN)) {
            return true
        }
        return this._permissions.includes(permission)
    }

    /**
     * Check if key has all specified permissions.
     */
    hasAllPermissions(permissions: ApiKeyPermission[]): boolean {
        return permissions.every((p) => this.hasPermission(p))
    }

    /**
     * Update key name.
     */
    updateName(name: string): void {
        this._name = name
        this._updatedAt = new Date()
    }

    /**
     * Update permissions.
     */
    updatePermissions(permissions: ApiKeyPermission[]): void {
        this._permissions = [...permissions]
        this._updatedAt = new Date()
    }

    /**
     * Record key usage.
     */
    recordUsage(): void {
        this._lastUsedAt = new Date()
        this._updatedAt = new Date()
    }

    /**
     * Revoke (deactivate) the key.
     */
    revoke(): void {
        this._isActive = false
        this._updatedAt = new Date()
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): ApiKeyProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            name: this._name,
            keyHash: this._keyHash,
            keyPrefix: this._keyPrefix,
            permissions: [...this._permissions],
            isActive: this._isActive,
            expiresAt: this._expiresAt,
            lastUsedAt: this._lastUsedAt,
            metadata: { ...this._metadata },
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}

/**
 * Generate a random string for API key.
 */
function generateRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length]
    }
    return result
}

/**
 * Hash an API key using SHA-256.
 */
function hashKey(key: string): string {
    return nodeCrypto.createHash("sha256").update(key).digest("hex")
}
