import type { PrismaClient } from 'prisma/generated/client';
import type { CreateProductDto } from '../models/product.interface';
import type { OperationResult } from '../models/operation-result.interface';
import type { INotificationService } from './notification.service';
import { NotificationService } from './notification.service';

// Error messages
const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Product not found',
  QUANTITY_NEGATIVE: 'Quantity cannot be negative',
  SKU_DUPLICATE: 'Product with this SKU already exists',
};

export class InventoryService {
  private prisma: PrismaClient;
  private notificationService: INotificationService;

  constructor(prisma?: PrismaClient, notificationService?: INotificationService) {
    // Initialize Prisma client
    if (prisma) {
      this.prisma = prisma;
    } else {
      // Lazy load Prisma client only when needed
      const { PrismaClient: PC } = require('prisma/generated/client');
      this.prisma = new PC();
    }

    // Initialize Notification service
    this.notificationService = notificationService || new NotificationService();
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
   * Checks if product stock is below threshold and sends alert if needed
   * @param sku Product SKU to check
   * @param threshold Stock level threshold (default: 5)
   * @throws Error if product not found
   */
  async checkLowStock(sku: string, threshold: number = 5): Promise<void> {
    // Find product by SKU
    const product = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    // Check if stock is below threshold
    if (product.quantity < threshold) {
      await this.notificationService.sendAlert(
        `Low stock alert: Product ${sku} has only ${product.quantity} units left`
      );
    }
  }

  /**
   * Disconnects from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

