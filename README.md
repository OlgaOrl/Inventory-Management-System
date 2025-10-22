# Inventory Management System

![Tests](https://github.com/OlgaOrl/Inventory-Management-System/actions/workflows/test.yml/badge.svg)

## Description

A test-driven inventory management system built with TypeScript, demonstrating TDD principles, ORM best practices, and proper use of mocks for unit testing. This project showcases the RED → GREEN → REFACTOR cycle for building robust, maintainable code.

## Domain

This system manages product inventory with the following capabilities:
- Add products to inventory with validation
- Remove products from inventory
- Alert when stock levels are low

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Testing**: Jest with mocks
- **ORM**: Prisma
- **Database**: SQLite (development)
- **Module System**: CommonJS

## Features Implemented

### Feature 1: Add Product to Inventory

**Business Rule**: A product can be added only if it has valid name, unique SKU, and quantity ≥ 0

**Tests**:
- ✓ Adds product when valid data provided
- ✓ Throws error when SKU already exists
- ✓ Throws error when quantity is negative

**Implementation**:
- Validates quantity is non-negative
- Validates SKU is unique
- Creates product in database
- Returns created product with metadata

### Feature 2: Remove Product from Inventory

**Business Rule**: A product can be removed only if it exists

**Tests**:
- ✓ Removes product when it exists
- ✓ Throws error when product not found
- ✓ Verifies product no longer exists after removal

**Implementation**:
- Verifies product exists before deletion
- Deletes product from database
- Returns success message

### Feature 3: Low Stock Alert

**Business Rule**: System alerts when product quantity falls below threshold (5 units)

**Tests**:
- ✓ Sends alert when quantity below threshold
- ✓ Does not send alert when quantity above threshold
- ✓ Throws error when product not found

**Implementation**:
- Checks product stock level
- Sends notification if below threshold
- Returns alert status

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd Inventory-Management-System

# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### Environment Setup

Create `.env` file in project root:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Running Migrations

```bash
# Create and apply migration
npm run migrate

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npm run studio
```

## Test Coverage

Current coverage results:

```
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   92.1  |   86.66  |    90   |   92.1  |
 constants                |    100  |     100  |   100   |    100  |
  inventory.constants.ts  |    100  |     100  |   100   |    100  |
 services                 |  91.89  |   86.66  |    90   |  91.89  |
  inventory.service.ts    |  94.28  |   86.66  |   100   |  94.28  |
  notification.service.ts |     50  |     100  |     0   |     50  |
```

✅ **Overall coverage: 92.1%** (exceeds 70% requirement)

Run coverage report:

```bash
npm run test:coverage
```

## Project Structure

```
Inventory-Management-System/
├── src/
│   ├── services/
│   │   ├── inventory.service.ts      # Core business logic
│   │   └── notification.service.ts   # Alert notifications
│   ├── models/
│   │   ├── product.interface.ts      # Product DTO
│   │   └── operation-result.interface.ts  # Operation response
│   ├── constants/
│   │   └── inventory.constants.ts    # Application constants
│   └── __tests__/
│       ├── inventory.service.test.ts # addProduct tests
│       ├── remove-product.test.ts    # removeProduct tests
│       └── low-stock-alert.test.ts   # checkLowStock tests
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   └── dev.db                        # SQLite database
├── jest.config.js                    # Jest configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json
└── README.md
```

## Database Schema

### Product Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | Integer | Primary Key, Auto-increment |
| `name` | String | Required |
| `sku` | String | Required, Unique |
| `quantity` | Integer | Required |
| `createdAt` | DateTime | Default: now() |

## Mocking Strategy

Tests use mocks for external dependencies:

- **Database (PrismaClient)**: Mocked with Jest to avoid real database calls
- **Notification Service**: Mocked to verify alert behavior without external calls
- **Domain Logic**: Not mocked - tests verify actual business logic

### Mock Structure

```typescript
const mockPrisma = {
  product: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
};

const mockNotificationService = {
  sendAlert: jest.fn(),
};
```

## Dependency Injection Pattern

The `InventoryService` uses constructor-based dependency injection for testability:

```typescript
constructor(
  prisma?: PrismaClient,
  notificationService?: INotificationService
) {
  // Uses real implementations if not provided
  // Accepts mocks for testing
}
```

## Git Workflow

This project follows TDD workflow with feature branches:

- Each feature in separate branch: `feature/<name>` or `refactor/<name>`
- Commits follow pattern: `red` → `green` → `refactor`
- Example commits:
  - `red: write failing tests for low stock alert`
  - `green: implement low stock alert functionality`
  - `refactor: improve code quality with constants and message generation`

## Code Quality Principles

- **DRY (Don't Repeat Yourself)**: Reusable methods like `findProductBySku()`
- **SRP (Single Responsibility)**: Each method has one clear purpose
- **Consistent Error Handling**: Centralized error messages
- **Type Safety**: Full TypeScript coverage
- **Documentation**: JSDoc comments on public methods

## Author

[Your Name]

## Assignment

This project is part of TAK24 course assignment on Test-Driven Development.

## License

MIT