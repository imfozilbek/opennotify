# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**OpenNotify** is a unified notification API for Uzbekistan and Central Asia.

**Platform-first approach**: SDK is a thin HTTP client, all business logic lives in Platform API.

Supports all major channels: SMS (Eskiz, PlayMobile, GetSMS), Telegram Bot, Email (SMTP, SendGrid, Mailgun), Push (FCM, APNs), WhatsApp Business.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       OPENNOTIFY                                 │
├─────────────────────────────────────────────────────────────────┤
│  packages/              │  apps/                                │
│  (Public SDKs)          │  (Platform)                           │
│  ─────────────────────  │  ──────────────────────────────────── │
│  @opennotify/node-sdk   │  api/ ──────► libs/core               │
│  opennotify (Python)    │  dashboard/   (internal, DDD)         │
│  opennotify-php (PHP)   │  landing/                             │
│  opennotify (Go)        │                                       │
│  opennotify-java (Java) │                                       │
│  OpenNotify.NET (C#)    │                                       │
│  opennotify (Ruby)      │                                       │
│  opennotify-rs (Rust)   │                                       │
└─────────────────────────────────────────────────────────────────┘
```

### How it works

```
Developer → SDK (HTTP client) → Platform API → libs/core → Providers
```

SDK is a thin HTTP client. All notification logic, provider adapters, and business rules are in `libs/core`, used only by Platform API.

## Project Structure

```
opennotify/
├── packages/                    # Public SDKs
│   ├── node-sdk/                # @opennotify/node-sdk - Node.js/TypeScript
│   ├── python-sdk/              # opennotify - PyPI
│   ├── php-sdk/                 # opennotify-php - Packagist
│   ├── go-sdk/                  # opennotify - Go module
│   ├── java-sdk/                # opennotify-java - Maven Central
│   ├── dotnet-sdk/              # OpenNotify.NET - NuGet
│   ├── ruby-sdk/                # opennotify - RubyGems
│   └── rust-sdk/                # opennotify-rs - crates.io
│
├── libs/                        # Internal shared libraries
│   └── core/                    # @opennotify/core - Domain logic (DDD)
│
├── apps/                        # Platform applications
│   ├── api/                     # @opennotify/api - NestJS API
│   ├── dashboard/               # @opennotify/dashboard - Merchant Portal
│   └── landing/                 # @opennotify/landing - Marketing Site
│
├── .gitmessage                  # Commit message template
├── CLAUDE.md
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Key Paths

| Description | Path |
|-------------|------|
| **Root** | `/Users/fozilbeksamiyev/projects/opennotify` |
| **Core (internal)** | `libs/core` |
| **Node.js SDK** | `packages/node-sdk` |
| **Python SDK** | `packages/python-sdk` |
| **PHP SDK** | `packages/php-sdk` |
| **Go SDK** | `packages/go-sdk` |
| **Java SDK** | `packages/java-sdk` |
| **C#/.NET SDK** | `packages/dotnet-sdk` |
| **Ruby SDK** | `packages/ruby-sdk` |
| **Rust SDK** | `packages/rust-sdk` |
| **Platform API** | `apps/api` |
| **Dashboard** | `apps/dashboard` |
| **Landing** | `apps/landing` |

## Essential Commands

```bash
# Install all dependencies
pnpm install

# Build everything
pnpm build

# Build specific package/app
pnpm --filter @opennotify/core build
pnpm --filter @opennotify/api build
pnpm --filter @opennotify/dashboard dev

# Run Platform API
pnpm --filter @opennotify/api start:dev

# Run Dashboard
pnpm --filter @opennotify/dashboard dev

# Run tests
pnpm test

# Format code
pnpm format

# Lint code
pnpm lint
```

## Code Style

- **Indentation:** 4 spaces
- **Quotes:** Double quotes
- **Semicolons:** Never
- **Line Length:** 100 chars max

## Lint Rules (MUST follow)

### Formatting (Prettier)
```
tabWidth: 4           // 4 spaces
semi: false           // no semicolons
singleQuote: false    // double quotes "
trailingComma: "all"  // trailing commas in multiline
arrowParens: "always" // (x) => x, not x => x
printWidth: 100       // max line length
```

### TypeScript (errors — must fix)
| Rule | Meaning |
|------|---------|
| `no-floating-promises` | Always `await` or handle promises |
| `await-thenable` | Only `await` promises, not regular values |
| `no-misused-promises` | Don't pass promises where not expected |
| `no-unused-vars` | Remove unused variables (prefix with `_` to ignore) |

### TypeScript (warnings — should fix)
| Rule | Meaning |
|------|---------|
| `explicit-function-return-type` | Always specify return type: `function foo(): string` |
| `explicit-module-boundary-types` | Exported functions must have explicit types |
| `no-explicit-any` | Avoid `any`, use `unknown` or specific type |
| `no-unsafe-*` | Avoid unsafe operations with `any` types |
| `prefer-optional-chain` | Use `a?.b` instead of `a && a.b` |
| `prefer-readonly` | Mark properties as `readonly` when possible |
| `promise-function-async` | Functions returning Promise should be `async` |
| `require-await` | `async` functions should have `await` |
| `no-non-null-assertion` | Avoid `value!`, use proper null checks |

### Code Quality (errors)
| Rule | Meaning |
|------|---------|
| `eqeqeq` | Use `===` and `!==`, never `==` or `!=` |
| `curly` | Always use braces: `if (x) { return }` |
| `no-var` | Use `const`/`let`, never `var` |
| `prefer-const` | Use `const` if variable is never reassigned |
| `no-debugger` | Remove `debugger` statements |
| `no-duplicate-imports` | Combine imports from same module |

### Code Quality (warnings)
| Rule | Meaning |
|------|---------|
| `no-console` | Use `console.warn`/`console.error` only, no `console.log` |
| `prefer-template` | Use template literals: `` `Hello ${name}` `` |
| `no-else-return` | No `else` after `return` |
| `prefer-arrow-callback` | Use arrow functions for callbacks |

### Complexity Limits (warnings)
| Rule | Limit | Note |
|------|-------|------|
| `complexity` | 15 | Max cyclomatic complexity |
| `max-depth` | 4 | Max nesting level |
| `max-lines-per-function` | 100 | Excluding blanks/comments |
| `max-params` | 5 | (8 for DDD value objects/use cases) |

### Quick Reference
```typescript
// ✅ Good
async function sendNotification(id: string): Promise<Notification> {
    const notification = await notificationRepo.findById(id)
    if (!notification) {
        throw new Error("Notification not found")
    }
    return notification
}

// ❌ Bad
async function sendNotification(id) {        // missing types
    const notification = notificationRepo.findById(id)  // missing await
    if (!notification)                      // missing curly braces
        throw new Error("Notification not found")
    console.log(notification)               // no console.log
    return notification
}
```

## Core Library Structure (libs/core)

```
libs/core/src/
├── domain/              # Pure domain logic
│   ├── entities/        # Notification, Merchant, ApiKey, Template, Recipient
│   ├── value-objects/   # Channel, Provider, NotificationStatus, ProviderCredentials
│   └── events/          # NotificationSent, NotificationDelivered, NotificationFailed
├── application/         # Use cases
│   ├── use-cases/       # SendNotification, SendOTP, VerifyOTP, CreateTemplate
│   └── ports/           # NotificationProviderPort, NotificationRepositoryPort
└── infrastructure/      # External integrations
    └── adapters/        # EskizAdapter, TelegramAdapter, SendGridAdapter, ...
```

### NotificationProviderPort Interface

Each notification provider implements this interface:

```typescript
interface NotificationProviderPort {
    channel: Channel
    provider: Provider
    send(request: SendNotificationRequest): Promise<SendNotificationResponse>
    getDeliveryStatus(messageId: string): Promise<DeliveryStatusResponse>
    verifyWebhook(payload: WebhookPayload): Promise<WebhookResult>
}
```

## Platform API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send notification (unified) |
| GET | `/notifications/:id` | Get notification |
| GET | `/notifications/:id/status` | Get delivery status |
| POST | `/otp/send` | Send OTP |
| POST | `/otp/verify` | Verify OTP |
| POST | `/templates` | Create template |
| GET | `/templates` | List templates |
| POST | `/recipients` | Create/update recipient |
| GET | `/recipients` | List recipients |
| POST | `/webhooks/:provider` | Provider webhooks |

## Git Commit Format

Follow Conventional Commits format.

**Monorepo format:** `<type>(<scope>): <subject>`

Examples:
- `feat(api): add eskiz adapter`
- `fix(sdk): resolve timeout issue`
- `docs(core): update type definitions`
- `refactor(node-sdk): extract http client`

**Root-level changes:** `<type>: <subject>` (no scope)
- `chore: update eslint config`
- `docs: update root README`

**Types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Scopes:** core, node-sdk, python, php, go, java, dotnet, ruby, rust, api, dashboard, landing

**Rules:**
- Imperative mood, no caps, max 50 chars
- Do NOT add "Generated with Claude Code" footer
- Do NOT add "Co-Authored-By: Claude"

## Monorepo Versioning Strategy

### Git Tag Format

**Prefixed tags for each package:**
```
core-v0.1.0
sdk-v0.1.0
api-v0.1.0
```

**Why prefixed tags:**
- Independent versioning per package
- Clear release history for each package
- Easy to filter: `git tag -l "api-*"`

### Semantic Versioning

All packages follow SemVer: `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (0.1.0) - New features, backwards compatible
- **PATCH** (0.0.1) - Bug fixes, backwards compatible

**Pre-1.0 policy:** Minor bumps (0.x.0) may include breaking changes.

## Release Pipeline

**Quick reference:** Say "run pipeline for [package]" to execute full release flow.

The pipeline has 5 phases. Each phase must pass before proceeding.

### Phase 1: Quality Gates

```bash
cd packages/<package>  # or libs/core, apps/api

# All must pass:
pnpm format                              # 4-space indentation
pnpm build                               # TypeScript compiles
cd ../.. && pnpm lint                    # 0 errors, 0 warnings
cd packages/<package>
pnpm test:run                            # All tests pass
```

### Phase 2: Documentation

Update these files in the package directory:

| File | Action |
|------|--------|
| `README.md` | Add feature docs, update usage |
| `TODO.md` | Mark completed tasks, add new tech debt if any |
| `CHANGELOG.md` | Add version entry with all changes |
| `ROADMAP.md` | Update if milestone completed |

**Tech debt rule:** If implementation leaves known issues, shortcuts, or future improvements needed — add them to TODO.md before committing.

### Phase 3: Manual Testing

```bash
# Test manually
# Verify output, edge cases, error handling
```

### Phase 4: Commit

```bash
git add .
git commit -m "<type>(<scope>): <description>"

# Examples:
# feat(api): add eskiz webhook handler
# fix(sdk): resolve notification timeout
# docs(core): update notification entity docs
```

### Phase 5: Version & Tag

```bash
cd packages/<package>

# Bump version in package.json manually or:
npm version patch  # 0.1.0 → 0.1.1 (bug fix)
npm version minor  # 0.1.0 → 0.2.0 (new feature)
npm version major  # 0.1.0 → 1.0.0 (breaking change)

# Create prefixed git tag
git tag <scope>-v<version>
# Example: git tag api-v0.2.0

# Push
git push origin main
git push origin <scope>-v<version>
```

## Pipeline Checklist

Copy and use for each release:

```markdown
## Release: <package> v<version>

### Quality Gates
- [ ] `pnpm format` - no changes
- [ ] `pnpm build` - compiles
- [ ] `pnpm lint` - 0 errors, 0 warnings
- [ ] `pnpm test:run` - all pass

### Documentation
- [ ] README.md updated (if needed)
- [ ] TODO.md - completed tasks marked, new debt added
- [ ] CHANGELOG.md - version entry added
- [ ] ROADMAP.md updated (if milestone completed)

### Testing
- [ ] Tested manually
- [ ] Edge cases verified

### Release
- [ ] Commit with conventional format
- [ ] Version bumped in package.json
- [ ] Git tag created: <scope>-v<version>
- [ ] Pushed to origin
```

## Working with ROADMAP

When the user points to `ROADMAP.md` or asks about the roadmap/next steps:

1. **Read both files together:**
   - `<package>/ROADMAP.md` - to understand the planned features and milestones
   - `<package>/CHANGELOG.md` - to see what's already implemented

2. **Determine current position:**
   - Check the latest version in CHANGELOG.md
   - Cross-reference with ROADMAP.md milestones
   - Identify which roadmap items are already completed (present in CHANGELOG)

3. **Suggest next steps:**
   - Find the first uncompleted item in the current milestone
   - Or identify the next milestone if current one is complete
   - Present clear "start here" recommendation

## Working with TODO

TODO.md tracks technical debt and pending improvements:

- **Add items** when you notice shortcuts, hacks, or improvements needed
- **Mark completed** when tech debt is resolved
- **Prioritize** items that block other work
- **Reference** in commits: `fix(api): resolve auth issue (TODO #3)`

## Adding New Notification Provider

1. Add to `Channel` and `Provider` enums in `libs/core/src/domain/value-objects/`
2. Create adapter in `libs/core/src/infrastructure/adapters/`
3. Implement `NotificationProviderPort` interface
4. Add webhook handler in `apps/api/src/modules/webhooks/`
5. Update SDK types
6. Write tests

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    apps/                                     │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐                  │
│  │   api    │  │ dashboard │  │ landing  │                  │
│  └────┬─────┘  └───────────┘  └──────────┘                  │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           libs/core                                 │    │
│  │     (internal, not published)                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│                   packages/                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  node, python, php, go, java, dotnet, ruby, rust     │    │
│  └──────────────────────────────────────────────────────┘    │
│       │                                                      │
│       └──────────► HTTP to Platform API                      │
└─────────────────────────────────────────────────────────────┘
```

## Notification Channels

| Channel | Providers | Priority |
|---------|-----------|----------|
| **SMS** | Eskiz, PlayMobile, GetSMS | Critical |
| **Telegram** | Telegram Bot API | Critical |
| **Email** | SMTP, SendGrid, Mailgun | High |
| **Push** | Firebase FCM, Apple APNs | High |
| **WhatsApp** | WhatsApp Business API | Medium |

## Smart Routing

```
Routing Rules:
├── By message type
│   ├── OTP → Telegram first, SMS fallback
│   ├── Marketing → Email + Push
│   └── Transactional → SMS (guaranteed delivery)
│
├── By cost
│   └── Cheapest first: Telegram → Email → SMS
│
├── By recipient preferences
│   └── User opted for Telegram → skip SMS
│
└── By time
    └── Night hours → Push only (no SMS)
```

## Important Notes

- Node.js >= 22.0.0 required (check `.nvmrc`)
- Always run `pnpm format` before committing
- Build `libs/core` first when making shared changes
- SDK packages are thin HTTP clients (Platform mode only)
- Never commit provider credentials
