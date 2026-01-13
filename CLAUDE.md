# CLAUDE.md

> ⛔ **ALL RULES ARE MANDATORY. Zero tolerance for violations.**

## Updating This File (MANDATORY)

When modifying CLAUDE.md, you MUST follow these rules:

| Rule | Requirement |
|------|-------------|
| **Format** | Compact tables and bullet points, NO verbose explanations |
| **Examples** | Only critical code examples, max 5 lines each |
| **Language** | English only |
| **Size** | Keep under 400 lines total |
| **Structure** | Use `##` headers, tables, short code blocks |
| **Redundancy** | NO duplicate information across sections |
| **New rules** | Add to existing tables, don't create new sections |

**⛔ FORBIDDEN when editing:**
- Long prose paragraphs
- Multiple examples for same rule
- Redundant explanations
- Non-English text
- Sections longer than 30 lines

## Task Workflow (MANDATORY)

**⛔ SLC, NOT MVP!** We don't build MVPs. We follow **SLC (Simple, Lovable, Complete)**:
- **Simple** — Easy to use, no unnecessary complexity
- **Lovable** — Delightful UX, polished design, feels premium
- **Complete** — Fully functional, no "coming soon" placeholders

**⛔ MUST enter planning mode before starting ANY new task.**

| Rule | Requirement |
|------|-------------|
| **New tasks** | Always use `EnterPlanMode` tool first |
| **Purpose** | Plan implementation steps before writing code |
| **Exit** | Use `ExitPlanMode` only after plan is approved |

## Session Commands (MANDATORY)

### "start-work"
| Step | Action |
|------|--------|
| 1 | Analyze entire project (structure, TODOs, open tasks, component status) |
| 2 | Show brief status for each project part |
| 3 | Sort by progress (completed first, least ready last) |
| 4 | Bottom: show blocking/lagging task |

### "end-work"
| Step | Action |
|------|--------|
| 1 | Check uncommitted changes (git status, git diff) |
| 2 | Commit and release changes |
| 3 | Review git log for last 12 hours |
| 4 | Show summary: what done, progress achieved |

## Skills Usage (MANDATORY)

| Skill | When to Use |
|-------|-------------|
| `brand-guidelines` | Before any UI/frontend work — read colors, fonts, spacing |
| `frontend-design` | Creating UI components, pages, layouts |
| `software-architecture` | New features, refactoring, architecture decisions |
| `test-driven-development` | Writing tests, TDD workflow |

**⛔ RULES:**
- Always read `.skills/brand-guidelines/SKILL.md` before frontend development
- Use `frontend-design` skill for production-grade UI components
- Follow brand palette strictly — no arbitrary colors
- Use `software-architecture` for DDD, Clean Architecture, SOLID, KISS, DRY, YAGNI
- Use `test-driven-development` when writing or updating tests
- Invoke skills proactively, don't wait for user to ask

**Auto-install if not available:**
```bash
/plugin marketplace add NeoLabHQ/context-engineering-kit
/plugin install ddd@NeoLabHQ/context-engineering-kit
/plugin install tdd@NeoLabHQ/context-engineering-kit
```

## UI Development (MANDATORY)

**Principle: SLC (Simple, Lovable, Complete)** — Every UI must be simple to use, lovable in design, complete in functionality.

**⛔ WORKFLOW for any UI task:**
1. Read `.skills/brand-guidelines/SKILL.md` first
2. Invoke `frontend-design` skill
3. Plan with animations and micro-interactions
4. Result must NOT look "AI-generated" — must feel human-crafted

**UI Libraries (by task type):**
| Task | Libraries |
|------|-----------|
| Landing pages | Aceternity UI, Magic UI |
| Dashboards | Origin UI, Tremor |
| Animations | Framer Motion, Motion Primitives |
| Base components | shadcn/ui + custom tokens |

**⛔ FORBIDDEN (generic AI look):**
- Default shadcn/ui without customization
- System fonts only (use brand fonts)
- No hover/focus states
- Symmetric/centered everything
- No micro-interactions

**REQUIRED for unique design:**
- Custom animations (not default transitions)
- Brand typography from guidelines
- Asymmetric layouts where appropriate
- Personality (illustrations, custom icons)
- Micro-interactions on all interactive elements

## Project Overview

OpenNotify — Unified notification API for Uzbekistan/Central Asia. TypeScript monorepo (pnpm workspaces). Node.js >= 22.0.0.

**Platform-first:** SDK = thin HTTP client, all logic in Platform API.

| Package | Description |
|---------|-------------|
| `@opennotify/core` | Domain logic (DDD), provider adapters |
| `@opennotify/api` | NestJS REST API |
| `@opennotify/dashboard` | Merchant Portal |
| `@opennotify/landing` | Marketing Site |

**SDKs (thin HTTP clients):**

| SDK | Package Name |
|-----|--------------|
| Node.js | `@opennotify/node-sdk` |
| Python | `opennotify` (PyPI) |
| PHP | `opennotify-php` (Packagist) |
| Go | `opennotify` (Go module) |
| Java | `opennotify-java` (Maven) |
| C#/.NET | `OpenNotify.NET` (NuGet) |
| Ruby | `opennotify` (RubyGems) |
| Rust | `opennotify-rs` (crates.io) |

**Root:** `/Users/fozilbeksamiyev/projects/opennotify`

## Commands

```bash
pnpm build                            # Build all
pnpm test                             # Test all
pnpm format                           # Format (4 spaces)
pnpm lint                             # Lint (0 errors, 0 warnings)
pnpm --filter @opennotify/api build   # Build specific package
```

## Code Style (MANDATORY)

```
4 spaces | no semicolons | double quotes | 100 chars max | trailing commas
```

## ESLint Rules (MUST FIX ALL)

| Rule | Fix |
|------|-----|
| `no-explicit-any` | Use `unknown`, generics, proper types |
| `explicit-function-return-type` | Always: `function foo(): string` |
| `no-floating-promises` | Always `await` or `.catch()` |
| `no-unused-vars` | Prefix with `_` |
| `prefer-const` | Use `const` unless reassigning |
| `eqeqeq` | Use `===` and `!==` |
| `curly` | Always use braces |
| `no-console` | Use `.warn` or `.error` only |
| `max-params` | Max 5 (8 for DDD) |
| `max-lines-per-function` | Max 100 |
| `complexity` | Max 15 |
| `max-depth` | Max 4 |

## Architecture (DDD + Clean Architecture)

```
Domain (inner)     → Entities, Value Objects, Events — NO framework imports
Application        → Use Cases, Ports (interfaces)
Infrastructure     → Controllers, Repositories, Adapters
```

**⛔ RULES:**
- Domain NEVER imports from outer layers
- Entities have behavior, not just data
- Value Objects are immutable
- API returns DTOs, not entities
- No magic numbers/strings
- No hardcoded secrets

## Anti-patterns (FORBIDDEN)

| Pattern | Solution |
|---------|----------|
| Anemic Domain | Move logic INTO entities |
| `any` type | Use proper types |
| Framework in domain | Keep domain pure |
| Entity exposure | Use DTOs |
| Magic numbers | Named constants |
| Hardcoded secrets | Environment variables |

## Notification Channels

| Channel | Providers | Priority |
|---------|-----------|----------|
| SMS | Eskiz, PlayMobile, GetSMS | Critical |
| Telegram | Telegram Bot API | Critical |
| Email | SMTP, SendGrid, Mailgun | High |
| Push | Firebase FCM, Apple APNs | High |
| WhatsApp | WhatsApp Business API | Medium |

**NotificationProviderPort Interface:**
```typescript
interface NotificationProviderPort {
    channel: Channel
    provider: Provider
    send(request: SendRequest): Promise<SendResponse>
}
```

## Smart Routing

```
OTP         → Telegram first, SMS fallback
Marketing   → Email + Push
Transactional → SMS (guaranteed)
Night hours → Push only (no SMS)
```

## Git Commits

```
<type>(<package>): <subject>
feat(api): add eskiz adapter
fix(node-sdk): resolve timeout issue
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

**⛔ DO NOT add Claude Code footer or Co-Authored-By**

## Security (MANDATORY)

**FORBIDDEN:**
```typescript
eval(userInput)           // Code injection
new Function(userInput)   // Code injection
document.innerHTML = x    // XSS
`query ${userInput}`      // Injection
```

**REQUIRED:**
- Secrets in `.env` only
- Validate all inputs
- Never log API keys/tokens
- Check `git diff` before commit
- Verify webhook signatures

## Testing (MANDATORY)

| Layer | Min Coverage |
|-------|--------------|
| Domain | 90% |
| Use Cases | 80% |
| Controllers | 70% |

```bash
pnpm test:coverage    # Must pass thresholds
```

## Database (MongoDB + Redis, self-hosted)

**⛔ No other databases allowed.**

**MongoDB:**
```typescript
@Schema({ timestamps: true, versionKey: false })
// Always: index frequently queried fields
```

**Redis:**
```typescript
// Key pattern: opennotify:{entity}:{id}:{field}
// Always set TTL: redis.setex(key, 3600, value)
```

## Performance (MANDATORY)

| Metric | Limit |
|--------|-------|
| API response | < 200ms (p95) |
| DB query | < 100ms |
| Memory | < 512MB |
| Notification delivery | < 5s |

**⛔ AVOID:**
- N+1 queries — use aggregation
- Missing indexes
- Fetching all fields — use `.select()`
- No pagination
- Cache without TTL

## Logging

```typescript
// ✅ GOOD
this.logger.info("Notification sent", { channel, recipient })

// ⛔ BAD
console.log("Notification:", notif)
this.logger.info({ apiKey })  // Never log secrets
```

Levels: `error` → `warn` → `info` → `debug`

## Error Handling

```typescript
// Custom errors with codes
throw new ProviderError("Eskiz", "Rate limit exceeded")

// Never swallow errors
try { } catch (e) { }  // ⛔ FORBIDDEN
```

## API Design

| Action | Method | Path | Status |
|--------|--------|------|--------|
| Send | POST | `/send` | 200 |
| Get | GET | `/notifications/:id` | 200/404 |
| Status | GET | `/notifications/:id/status` | 200 |
| Send OTP | POST | `/otp/send` | 200 |
| Verify OTP | POST | `/otp/verify` | 200 |

**⛔ MANDATORY decorators:**
```typescript
@ApiTags("Notifications")
@ApiOperation({ summary: "..." })
@ApiResponse({ status: 200, type: Dto })
```

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5/15min |
| `/auth/register` | 3/hour |
| `/otp/send` | 5/10min |
| `/send` | 100/min |
| Default authenticated | 300/min |

## External APIs (MANDATORY)

1. Define Port in `@opennotify/core`
2. Implement Adapter in infrastructure
3. Always set timeout (30s max)
4. Implement retry + circuit breaker
5. Verify webhook signatures
6. API keys in env only

## Import Order

```typescript
// 1. Node built-ins
// 2. External packages
// 3. @opennotify/* packages
// 4. Relative (parent first)
// 5. Type-only imports
```

## Forbidden Patterns

```typescript
any                    // Use proper type
as any                 // Fix the type
// @ts-ignore          // Fix the error
!.                     // Use null checks
var                    // Use const/let
==                     // Use ===
console.log            // Use logger
dangerouslySetInnerHTML // XSS risk
```

## CI/CD

```yaml
stages: install → lint → typecheck → test → build → security → deploy
```

**⛔ FORBIDDEN:**
- Manual deploys
- Deploy without tests
- Deploy Friday after 16:00

## Deployment

**Stack:** Hostinger VPS, PM2 + Nginx, CI/CD Gitea (self-hosted). **⛔ Docker is PROHIBITED.**

```
Nginx → /api/* → PM2: api (port 4001)
      → /* → static files
```

## Release Pipeline

**⛔ Commit Order (dependencies first):**
```
1. @opennotify/core      (domain, adapters)
2. @opennotify/api       (uses core)
3. @opennotify/node-sdk  (HTTP client)
4. @opennotify/dashboard (uses core)
5. @opennotify/landing   (standalone)
```

**Atomic Commits (one per module):**
| Order | Scope | Example |
|-------|-------|---------|
| 1 | types | `feat(core): add Notification type` |
| 2 | adapter | `feat(core): add SMS provider adapter` |
| 3 | endpoint | `feat(api): add send endpoint` |
| 4 | SDK | `feat(node-sdk): add send method` |
| 5 | UI | `feat(dashboard): add logs view` |
| 6 | tests | `test(core): add adapter tests` |

**⛔ RULES:**
- One module = one commit
- Each commit must pass all quality gates
- Never commit unfinished dependencies
- Commit order: types → adapters → API → SDK → UI

**Quality Gates (before EACH commit):**
```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm test
```

**Release Steps:**
```bash
# 1. Update CHANGELOG.md, ROADMAP.md
# 2. Version & tag
npm version minor
git tag <package>-v<version>
git push origin main --tags
```

## Session Start

**⛔ MUST read `./ROADMAP.md` first** to understand current status.

## Package Documentation (MANDATORY)

**⛔ Every package/app MUST have these files:**

| File | Purpose |
|------|---------|
| `ROADMAP.md` | Milestones, tasks with checkboxes |
| `CHANGELOG.md` | Version history, what changed |
| `TODO.md` | Technical debt, known issues |

**Root level:**

| File | Purpose |
|------|---------|
| `/ROADMAP.md` | Master: phases, architecture, status table |
| `/CHANGELOG.md` | Optional: root-level changes only |

## ROADMAP.md Rules

| Rule | Requirement |
|------|-------------|
| Structure | Phases → Milestones → Tasks with `[x]`/`[ ]` |
| Versioning | Independent semver per package (v0.1.0) |
| Dependencies | Show "Depends on: package vX.X.X" |
| Status | ✅ Completed, 🔄 In Progress, ⏳ Planned |

## CHANGELOG.md Rules

**Format:** [Keep a Changelog](https://keepachangelog.com/)

```markdown
## [0.2.0] - 2025-01-15
### Added
- New feature X
### Fixed
- Bug in Y
### Changed
- Refactored Z
```

**⛔ RULES:**
- Update BEFORE release (not after)
- Group by: Added, Changed, Fixed, Removed
- Link to issues/PRs when relevant

## TODO.md Rules (Technical Debt)

**Format:**
```markdown
## High Priority
- [ ] Fix memory leak in X (#123)
- [x] ~~Refactor auth module~~ (done in v0.2.0)

## Low Priority
- [ ] Add caching to Y
```

**⛔ RULES:**
- Add items when you notice shortcuts/hacks
- Mark `[x]` when resolved
- Reference in commits: `fix(api): resolve issue (TODO #3)`
- Review before each release

**Dependency order (always):**
```
1. @opennotify/core    (domain, adapters)
2. @opennotify/api     (uses core)
3. @opennotify/node-sdk (HTTP client)
```

## Shared Code Policy

**⛔ Code duplication is PROHIBITED.**

| Missing | Add to |
|---------|--------|
| Entity, VO, Port | `@opennotify/core` |
| API endpoint | `@opennotify/api` |
| SDK types | `packages/node-sdk` |

## Adding New Provider

1. Add to `Channel` and `Provider` enums in `@opennotify/core`
2. Create adapter in `infrastructure/adapters/`
3. Implement `NotificationProviderPort` interface
4. Add webhook handler in `apps/api/src/modules/webhooks/`
5. Update SDK types
6. Write tests

---

## Quick Reference

```
✅ MUST: Return types | await promises | const | curly braces | ===
❌ NEVER: any | console.log | floating promises | var | secrets in code | Docker
LIMITS: 5 params | 100 lines | 4 depth | 15 complexity
COMMANDS: pnpm format → pnpm lint → pnpm test → pnpm build
```
