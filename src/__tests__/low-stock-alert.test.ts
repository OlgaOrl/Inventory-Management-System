import { InventoryService } from '../services/inventory.service';
import type { INotificationService } from '../services/notification.service';

describe('InventoryService - Low Stock Alert', () => {
  let inventoryService: InventoryService;
  let mockPrisma: any;
  let mockNotificationService: jest.Mocked<INotificationService>;

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      product: {
        findUnique: jest.fn(),
      },
      $disconnect: jest.fn(),
    };

    // Mock Notification Service
    mockNotificationService = {
      sendAlert: jest.fn(),
    };

    // Create InventoryService with mocked dependencies
    inventoryService = new InventoryService(mockPrisma, mockNotificationService);
  });

  afterAll(async () => {
    // Cleanup: disconnect from database
    await inventoryService.disconnect();
  });

  describe('checkLowStock', () => {
    it('should send alert when product quantity is below threshold', async () => {
      const sku = 'LAP-001';
      const lowStockProduct = {
        id: 1,
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 3, // Below threshold of 5
        createdAt: new Date(),
      };

      // Mock that product exists with low stock
      mockPrisma.product.findUnique.mockResolvedValue(lowStockProduct);

      await inventoryService.checkLowStock(sku);

      // Verify notification was sent
      expect(mockNotificationService.sendAlert).toHaveBeenCalled();
      expect(mockNotificationService.sendAlert).toHaveBeenCalledWith(
        expect.stringContaining('low stock')
      );
    });

    it('should NOT send alert when product quantity is above threshold', async () => {
      const sku = 'LAP-002';
      const normalStockProduct = {
        id: 2,
        name: 'Desktop',
        sku: 'LAP-002',
        quantity: 10, // Above threshold of 5
        createdAt: new Date(),
      };

      // Mock that product exists with normal stock
      mockPrisma.product.findUnique.mockResolvedValue(normalStockProduct);

      await inventoryService.checkLowStock(sku);

      // Verify notification was NOT sent
      expect(mockNotificationService.sendAlert).not.toHaveBeenCalled();
    });

    it('should throw error when product does not exist', async () => {
      const sku = 'NON-EXISTENT';

      // Mock that product does not exist
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(inventoryService.checkLowStock(sku)).rejects.toThrow(
        'Product not found'
      );

      // Verify notification was NOT sent
      expect(mockNotificationService.sendAlert).not.toHaveBeenCalled();
    });
  });
});

