import type { PrismaClient } from 'prisma/generated/client';
import type { CreateProductDto } from '../models/product.interface';
import type { OperationResult } from '../models/operation-result.interface';

// Error messages
const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  QUANTITY_NEGATIVE: 'Quantity cannot be negative',
  SKU_DUPLICATE: 'Product with this SKU already exists',
};

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
   * Finds a product by SKU
   * @param sku Product SKU to find
   * @returns Product if found
   * @throws Error if product not found
   */
  private async findProductBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  /**
   * Validates that quantity is not negative
   * @throws Error if quantity is negative
   */
  private validateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error(ERROR_MESSAGES.QUANTITY_NEGATIVE);
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
      throw new Error(ERROR_MESSAGES.SKU_DUPLICATE);
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
   * Removes a product from inventory by SKU
   * @param sku Product SKU to remove
   * @returns Success message
   * @throws Error if product not found
   */
  async removeProduct(sku: string): Promise<OperationResult> {
    // Verify product exists
    await this.findProductBySku(sku);

    // Delete product from database
    await this.prisma.product.delete({
      where: { sku },
    });

    return { message: 'Product removed successfully' };
  }

  /**
   * Disconnects from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

