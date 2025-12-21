# @opennotify/docs

Documentation site for OpenNotify — built with [Fumadocs](https://fumadocs.dev).

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:4404](http://localhost:4404).

## Build

```bash
pnpm build
pnpm start
```

## Content Structure

```
content/docs/
├── index.mdx                    # Welcome page
├── getting-started/
│   ├── quickstart.mdx
│   ├── authentication.mdx
│   └── first-notification.mdx
├── channels/                    # v0.2.0
├── features/                    # v0.2.0
├── sdks/                        # v0.2.0
├── api-reference/               # v0.3.0
└── providers/                   # v0.4.0
```

## Adding Content

1. Create `.mdx` file in `content/docs/`
2. Add frontmatter with `title` and `description`
3. Update `meta.json` in the section folder

```mdx
---
title: Page Title
description: Short description
---

# Page Title

Content here...
```

## Tech Stack

- **Framework:** Next.js 16
- **Documentation:** Fumadocs
- **Styling:** Tailwind CSS 4.0
- **Syntax Highlighting:** Shiki
