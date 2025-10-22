# Inventory Management System

A TypeScript-based inventory management system built with Test-Driven Development (TDD) principles.

## Project Description

This is a university TDD assignment for building an inventory management system. The project demonstrates best practices for test-driven development using modern tools and frameworks.

## Tech Stack

- **Language:** Node.js + TypeScript
- **Testing:** Jest
- **Database:** SQLite
- **ORM:** Prisma (with migrations)

## Setup Instructions

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run migrate
```

## How to Run Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## How to Run Migrations

Create and apply a new migration:
```bash
npm run migrate
```

Push schema changes to database:
```bash
npm run db:push
```

Open Prisma Studio (database GUI):
```bash
npm run studio
```

## Project Structure

```
src/
├── models/      # Data models and types
├── services/    # Business logic
└── __tests__/   # Test files
```

## License

ISC