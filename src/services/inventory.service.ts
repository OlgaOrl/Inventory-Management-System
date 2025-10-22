import type { PrismaClient } from 'prisma/generated/client';

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

  async addProduct(data: { name: string; sku: string; quantity: number }) {
    // Validate quantity is not negative
    if (data.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      throw new Error('Product with this SKU already exists');
    }

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
}

