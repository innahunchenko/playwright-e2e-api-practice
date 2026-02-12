# Playwright E2E & API Testing Practice

This repository contains E2E and API tests written with Playwright.
The project is used for practicing automated testing on a locally running full-stack application.

## Application under test

- Frontend: Nuxt 3 (Vue.js)
- Backend: NestJS (Node.js)
- Database: PostgreSQL
- Background jobs: Redis + BullMQ
- Authentication: JWT tokens

The application itself is **not included** in this repository.
Tests are executed against a locally running instance.

## Test types

### E2E tests
- UI tests using Playwright
- Page Object Model
- Custom fixtures
- Login handled via fixtures (no duplicated login steps)

### API tests
- API testing using Playwright `request`
- JWT authentication
- CRUD scenarios

## Project structure

