import { InventoryService } from '../services/inventory.service';
import type { CreateProductDto } from '../models/product.interface';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockPrisma: any;

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      product: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      $disconnect: jest.fn(),
    };
    inventoryService = new InventoryService(mockPrisma);
  });

  afterAll(async () => {
    // Cleanup: disconnect from database
    await inventoryService.disconnect();
  });

  describe('addProduct', () => {
    it('should add product to inventory when valid data provided', async () => {
      const productData: CreateProductDto = {
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 10,
      };

      const mockProduct = {
        id: 1,
        ...productData,
        createdAt: new Date(),
      };

      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await inventoryService.addProduct(productData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Laptop');
      expect(result.sku).toBe('LAP-001');
      expect(result.quantity).toBe(10);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { sku: 'LAP-001' },
      });
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: productData,
      });
    });

    it('should throw error when SKU already exists', async () => {
      const productData: CreateProductDto = {
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 10,
      };

      const existingProduct = {
        id: 1,
        ...productData,
        createdAt: new Date(),
      };

      // Mock that SKU already exists
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);

      // Try to add another product with same SKU
      const duplicateProduct: CreateProductDto = {
        name: 'Desktop',
        sku: 'LAP-001',
        quantity: 5,
      };

      await expect(inventoryService.addProduct(duplicateProduct)).rejects.toThrow(
        'Product with this SKU already exists'
      );
      expect(mockPrisma.product.create).not.toHaveBeenCalled();
    });

    it('should throw error when quantity is negative', async () => {
      const productData: CreateProductDto = {
        name: 'Laptop',
        sku: 'LAP-002',
        quantity: -5,
      };

      await expect(inventoryService.addProduct(productData)).rejects.toThrow(
        'Quantity cannot be negative'
      );
    });
  });
});

