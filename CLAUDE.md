# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Atlassian Forge app** that integrates ONLYOFFICE Docs into Jira Cloud, enabling users to create, edit, and view office documents (DOCX, XLSX, PPTX, PDF, etc.) directly within Jira issues.

## Commands

### Root project (Forge backend)
```bash
npm install           # Install dependencies
npm run eslint        # Lint TypeScript/TSX files
npm run eslint:fix    # Auto-fix linting issues
```

### Custom UI (React frontend)
```bash
cd static/onlyoffice-docs-jira-cloud-custom-ui
npm install
npm run build         # Build React app to ./build/
npm run start         # Dev server
npm run eslint        # Lint
npm run eslint:fix    # Auto-fix
```

### Forge CLI (deployment)
```bash
forge deploy                              # Deploy to default environment
forge deploy --environment production     # Deploy to production
forge deploy --environment staging        # Deploy to staging
forge tunnel                              # Local development tunnel
forge install                             # Install to a Jira Cloud instance
```

There is no test framework — linting is the primary quality gate.

## Architecture

The app has three layers:

### 1. Forge Backend (`src/`)
Serverless Node.js 22 functions on the Forge platform.

- **`src/index.ts`** — Entry point; exports `settingsPageResolver` and `mainPageResolver`
- **`src/resolvers/mainPageResolver.ts`** — Handles Jira issue panel: authorizes editor sessions, creates attachments, fetches formats
- **`src/resolvers/settingsPageResolver.ts`** — Handles admin settings page: reads/writes app config
- **`src/client/index.ts`** — All calls to the remote ONLYOFFICE backend; includes retry logic and `ClientError`
- **`src/storage/index.tsx`** — Forge KVS (key-value store) layer for persistent settings; includes retry logic
- **`src/types/types.ts`** — Shared TypeScript interfaces (`User`, `Attachment`, `Format`, `RemoteSettings`, etc.) and error classes

### 2. Forge Frontend (`src/frontend/`)
Native Forge React components rendered in the Forge sandbox.

- **`src/frontend/settingsPage.tsx`** — Admin configuration form using Atlaskit components

### 3. Custom UI (`static/onlyoffice-docs-jira-cloud-custom-ui/`)
A standalone React app bundled separately and served as a Forge custom UI resource. This hosts the actual ONLYOFFICE document editor iframe. It communicates with the backend via `@forge/bridge`.

## Data Flow

1. User opens a Jira issue → Forge renders the issue panel via `mainPageResolver`
2. The panel UI (custom UI) calls resolver functions via `@forge/bridge`
3. Resolvers call the external ONLYOFFICE backend (`FORGE_REMOTE_APP_URL`) through `src/client/`
4. JWT tokens from the backend are passed to the editor iframe for authorization
5. Settings are stored/retrieved via Forge KVS (secrets for sensitive fields)

## Key Configuration

**`manifest.yml`** — Forge app manifest defining:
- Runtime: Node.js 22, ARM64, 256MB
- Two modules: `jira:adminPage` (settings) and `jira:issuePanel` (main editor panel)
- Two resolver functions
- External resource permissions (frames, scripts, styles for editor iframe)
- `FORGE_REMOTE_APP_URL` environment variable pointing to the ONLYOFFICE backend

**Environment variable:** `FORGE_REMOTE_APP_URL` must point to a running ONLYOFFICE Docs backend (ngrok tunnel for local dev, production URL for releases).

## Code Conventions

- **License headers required** on all source files — ESLint enforces Apache 2.0 headers via `eslint-plugin-notice`
- **Double quotes** for strings (ESLint enforced)
- **Alphabetized imports** grouped by source type (`eslint-plugin-simple-import-sort`)
- **TypeScript strict mode** — all new code must satisfy strict null checks
- **CommonJS modules** — Forge requires `"module": "commonjs"` in tsconfig

## Localization

Six languages supported: `de-DE`, `en-US`, `es-ES`, `fr-FR`, `it-IT`, `ru-RU`. Translation files live in `locales/`.
