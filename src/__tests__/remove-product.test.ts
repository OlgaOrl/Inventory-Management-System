import { InventoryService } from '../services/inventory.service';
import type { CreateProductDto } from '../models/product.interface';
import type { INotificationService } from '../services/notification.service';

describe('InventoryService - removeProduct', () => {
  let inventoryService: InventoryService;
  let mockPrisma: any;
  let mockNotificationService: jest.Mocked<INotificationService>;

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      product: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $disconnect: jest.fn(),
    };

    // Mock Notification Service
    mockNotificationService = {
      sendAlert: jest.fn(),
    };

    jest.clearAllMocks();
    inventoryService = new InventoryService(mockPrisma, mockNotificationService);
  });

  afterAll(async () => {
    // Cleanup: disconnect from database
    await inventoryService.disconnect();
  });

  describe('removeProduct', () => {
    it('should remove product from inventory when product exists', async () => {
      const sku = 'LAP-001';
      const existingProduct = {
        id: 1,
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 10,
        createdAt: new Date(),
      };

      // Mock that product exists
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.delete.mockResolvedValue(existingProduct);

      const result = await inventoryService.removeProduct(sku);

      expect(result).toBeDefined();
      expect(result.message).toBe('Product removed successfully');
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { sku },
      });
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { sku },
      });
    });

    it('should throw error when trying to remove non-existent product', async () => {
      const sku = 'NON-EXISTENT';

      // Mock that product does not exist
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(inventoryService.removeProduct(sku)).rejects.toThrow(
        'Product not found'
      );
      expect(mockPrisma.product.delete).not.toHaveBeenCalled();
    });

    it('should verify product no longer exists after removal', async () => {
      const sku = 'LAP-002';
      const existingProduct = {
        id: 2,
        name: 'Desktop',
        sku: 'LAP-002',
        quantity: 5,
        createdAt: new Date(),
      };

      // Mock: product exists initially for removal
      mockPrisma.product.findUnique.mockResolvedValueOnce(existingProduct);
      mockPrisma.product.delete.mockResolvedValue(existingProduct);

      // Remove the product
      const removeResult = await inventoryService.removeProduct(sku);

      expect(removeResult).toBeDefined();
      expect(removeResult.message).toBe('Product removed successfully');
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { sku },
      });

      // Mock: product no longer exists after removal
      mockPrisma.product.findUnique.mockResolvedValueOnce(null);

      // Verify trying to remove again throws error
      await expect(inventoryService.removeProduct(sku)).rejects.toThrow(
        'Product not found'
      );
    });
  });
});

