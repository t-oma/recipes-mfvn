## [0.6.0] - 2026-04-14

### 🚀 Features

- Role-based authorization and admin user management (#36)
- *(cache)* Add cache service infrastructure (#39)
- *(cache)* Integrate cache into category and recipe modules (#40)
- Graceful shutdown for Fastify, MongoDB, and Redis (#42)
- *(swagger)* Add response schemas for all endpoints (#45)

### 🚜 Refactor

- Add typed error classes replacing raw AppError usage (#29)
- Merge comment static methods into findFull (#31)
- Unify service interfaces with object parameters (#33)
- Prepare types for role-based authorization (#34)
- *(cache)* Remove hardcoded TTL defaults and add JSDoc (#43)
- Replace console with pino logger and add critical logging (#44)

### 🧪 Testing

- Unit tests for common layer (utils, middleware, bootstrap) (#37)
- Unit tests for service layer (6 services) (#38)

### ⚙️ Miscellaneous Tasks

- Add env example (#41)


## [0.5.0] - 2026-04-06

### 🚀 Features

- Add rate limiting, security headers, input sanitization and docker compose (#18)

### 🐛 Bug Fixes

- Patch optionalAuth await, category dependency check, comment ID validation (#22)

### 🚜 Refactor

- Rename model interfaces and add constant model names (#20)
- Add BaseDocument types, remove unused toObject options, clean up model schemas (#21)
- *(api)* Rename resource-specific params to 'id' (#24)
- Add ModelType interfaces for all models, replace Model<XxxDocument> in services (#25)
- Move recipe retrieval to aggregation pipeline (#26)
- Move user favorites retrieval to aggregation pipeline (#27)
- Move comment retrieval to aggregation pipeline with visibility filter (#28)

### 📚 Documentation

- Updated changelog for 0.5.0

### ⚙️ Miscellaneous Tasks

- Remove unsafe JWT cast, extract bcrypt rounds to env, simplify favoritedIds (#23)


## [0.4.1] - 2026-04-03

### 📚 Documentation

- Updated for v0.4.1

### ⚙️ Miscellaneous Tasks

- Release v0.4.1 (#15)


## [0.4.0] - 2026-04-02

### 🚀 Features

- Add favorites feature with backend architecture refactoring (#12)

### 📚 Documentation

- Updated changelog for v0.4.0


## [0.3.0] - 2026-03-30

### 🚀 Features

- *(recipes)* Added difficulty for filtering & isPublic for recipe protection (#7)

### 📚 Documentation

- Updated changelog for v0.2.0
- Updated changelog and backend package version for v0.3.0


## [0.2.0] - 2026-03-28

### 🚀 Features

- *(comments)* Add comments for recipes with improved error handling (#3)


## [0.1.0] - 2026-03-27

### 🐛 Bug Fixes

- *(backend)* Remove MongoDB-specific fields from response
- *(backend)* Added category and author validation before recipe creation

### 🚜 Refactor

- *(monorepo)* Migrate to pnpm workspaces
- Created base tsconfig
- *(backend)* HasNext & hasPrev pagination helpers
- Moved form schemas from backend to shared package
- *(backend)* Updated biome configuration
- *(backend)* Created shared types
- *(backend)* Moved auth/me logic to service
- *(backend)* Moved AuthResponse to packages/shared
- *(backend)* Branded Minutes type for recipe cookingTime

### 📚 Documentation

- Update changelog for v0.1.0 release

### 🧪 Testing

- *(categories)* Added unit tests for category service

### ⚙️ Miscellaneous Tasks

- Configure vitest


