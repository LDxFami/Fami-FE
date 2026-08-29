# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fami-FE is the admin dashboard frontend for **Fami Dental** — a dental clinic management system. Built with **React 17**, Redux Toolkit, and React Router v5. Uses CRACO to extend Create React App without ejecting.

## Commands

```bash
# Install dependencies
yarn install

# Start development server (requires Node 22.x and --openssl-legacy-provider flag)
yarn start

# Production build
yarn build

# Run tests
yarn test

# Lint
yarn lint

# Lint with auto-fix
yarn lint:fix
```

## Architecture

### Path Aliases (from craco.config.js)
| Alias | Resolves to |
|---|---|
| `@src` | `src/` |
| `@components` | `src/@core/components/` |
| `@layouts` | `src/@core/layouts/` |
| `@store` | `src/redux/` |
| `@styles` | `src/@core/scss/` |
| `@configs` | `src/configs/` |
| `@utils` | `src/utility/Utils` |
| `@hooks` | `src/utility/hooks` |

### State Management (Redux)
[src/redux/rootReducer.js](src/redux/rootReducer.js) combines all slices. App-specific slices live in [src/redux/](src/redux/): `authentication`, `user`, `users`, `customer`, `doctor`, `appointment`, `navbar`, `layout`. Feature-specific slices live alongside their views (e.g., `src/views/apps/calendar/store`). On logout (`authentication/handleLogout`), the entire Redux state is reset to `undefined`.

### Routing
[src/router/Router.js](src/router/Router.js) uses React Router v5. Route groups are split by feature in [src/router/routes/](src/router/routes/) (e.g., `Apps.js`, `Dashboards.js`, `Pages.js`). Protected routes require authentication (Sanctum token stored in auth state).

### Authentication
JWT/token auth via `src/auth/jwt/useJwt.js`. The token is stored via a `getStorage` utility. All API calls use **axios** with the token attached.

### Key Feature Areas in `src/views/apps/`
- `calendar/` — Appointment scheduling using FullCalendar
- `user/` — User management (list, view)
- `roles-permissions/` — Role/permission management

### Theme & Config
App name and theme options are set in [src/configs/themeConfig.js](src/configs/themeConfig.js). The app is named **"Fami Dental"** with a vertical layout and light skin by default.

### Core Framework (`src/@core/`)
Contains the base layout components, SCSS theme, reusable components, and auth wrappers. Treat this as a vendor-like layer — avoid modifying unless necessary.
