import type { PrismaClient } from 'prisma/generated/client';
import type { CreateProductDto } from '../models/product.interface';

export class InventoryService {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    if (prisma) {
      this.prisma = prisma;
    } else {
      // Lazy load Prisma client only when needed
      const { PrismaClient: PC } = require('prisma/generated/client');
      this.prisma = new PC();
    }
  }

  /**
   * Validates that quantity is not negative
   * @throws Error if quantity is negative
   */
  private validateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  /**
   * Validates that SKU is unique in the database
   * @throws Error if SKU already exists
   */
  private async validateUniqueSku(sku: string): Promise<void> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }
  }

  /**
   * Adds a new product to inventory
   * @param data Product data to create
   * @returns Created product with id and createdAt
   * @throws Error if validation fails
   */
  async addProduct(data: CreateProductDto) {
    // Validate input
    this.validateQuantity(data.quantity);
    await this.validateUniqueSku(data.sku);

    // Create product in database
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        quantity: data.quantity,
      },
    });

    return product;
  }

  /**
   * Disconnects from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

