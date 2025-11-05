# Soul Fragments - Multi-Dimensional Puzzle Game

## Overview

Soul Fragments is a 3D puzzle-adventure game built with React Three Fiber that features multi-dimensional gameplay mechanics. Players navigate through three distinct dimensions (Reality, Dream, and Memory), each with unique visual themes and gameplay elements. The core mechanic involves switching between dimensions to collect abilities and solve puzzles, where actions in one dimension can affect objects in others.

The application is a full-stack TypeScript project using Express.js for the backend and React with Three.js for a WebGL-based 3D frontend. The game features keyboard controls for movement and dimension switching, with a state management system built on Zustand.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Technology Stack:**
- React 18 with TypeScript for UI components
- React Three Fiber (@react-three/fiber) for 3D rendering and WebGL integration
- React Three Drei (@react-three/drei) for 3D utilities and helpers
- Vite as the build tool and development server
- TailwindCSS for styling with Radix UI component library

**3D Rendering Engine:**
- Three.js as the underlying 3D graphics library
- Custom GLSL shader support via vite-plugin-glsl
- Post-processing effects through @react-three/postprocessing
- Support for GLTF/GLB 3D models and audio files

**State Management:**
- Zustand with selector subscriptions for game state
- Multiple isolated stores for different concerns:
  - `useSoulFragments`: Manages dimension states, player positions, abilities, and interactive objects
  - `useGame`: Controls game phase (ready/playing/ended)
  - `useAudio`: Handles audio playback and mute state
- Local state with React hooks for component-specific data

**Component Structure:**
- `Game.tsx`: Main game orchestrator, renders all dimensions simultaneously
- `Player.tsx`: Player controller with physics and input handling
- `World.tsx`: Dimension-specific environments with fog and lighting
- `CameraController.tsx`: Smooth camera following with lerp transitions
- `DimensionSwitcher.tsx`: Keyboard-based dimension switching (keys 1, 2, 3)
- UI components in `client/src/components/ui/` using Radix UI primitives

**Game Architecture:**
- Three parallel dimensions rendered concurrently with different opacity levels
- Active dimension is fully opaque; inactive dimensions are semi-transparent
- Keyboard controls via @react-three/drei's KeyboardControls system
- Physics simulation with velocity-based movement and ground detection
- Ability system for unlocking new player capabilities (double jump, phase shift, time slow)

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for HTTP server
- ESM module system throughout the codebase
- Vite middleware integration for development hot reload
- Custom logging middleware for API request tracking

**API Design:**
- RESTful API structure with `/api` prefix convention
- Routes defined in `server/routes.ts`
- Centralized error handling middleware
- JSON request/response format

**Data Layer:**
- Storage abstraction interface (`IStorage`) for flexible backend implementations
- In-memory storage (`MemStorage`) as default implementation
- Prepared for database integration via Drizzle ORM
- User schema defined in `shared/schema.ts` with Zod validation

**Build System:**
- Separate client and server build processes
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js`
- Production mode serves static files after build

### External Dependencies

**Database:**
- Drizzle ORM configured for PostgreSQL dialect
- Neon Database serverless driver (@neondatabase/serverless)
- Schema migrations in `./migrations` directory
- Connection via `DATABASE_URL` environment variable
- Note: Database is configured but not actively used; current implementation uses in-memory storage

**Session Management:**
- connect-pg-simple for PostgreSQL session storage (configured but not implemented)
- Prepared for cookie-based session authentication

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- Custom styled variants using class-variance-authority
- TailwindCSS for utility-first styling
- Inter font from @fontsource

**Development Tools:**
- @replit/vite-plugin-runtime-error-modal for error overlay
- TypeScript with strict mode enabled
- Path aliases: `@/` for client source, `@shared/` for shared code
- tsx for running TypeScript in development

**3D Asset Pipeline:**
- Support for GLTF/GLB 3D model formats
- Audio file support (MP3, OGG, WAV)
- Texture loading via @react-three/drei's useTexture hook
- GLSL shader compilation

**Query Management:**
- TanStack Query (@tanstack/react-query) for server state
- Custom query client with fetch wrapper
- Configured for credential-based requests
- Infinite stale time by default

**Styling System:**
- CSS custom properties for theming (HSL color system)
- Dark mode support via class-based strategy
- Responsive design with mobile breakpoints
- PostCSS with Autoprefixer