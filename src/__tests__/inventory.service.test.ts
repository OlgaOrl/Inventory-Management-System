import { InventoryService } from '../services/inventory.service';

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
  });

  describe('addProduct', () => {
    it('should add product to inventory when valid data provided', async () => {
      const productData = {
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 10,
      };

      const result = await inventoryService.addProduct(productData);

      expect(result).toBeDefined();
      expect(result.name).toBe('Laptop');
      expect(result.sku).toBe('LAP-001');
      expect(result.quantity).toBe(10);
    });

    it('should throw error when SKU already exists', async () => {
      const productData = {
        name: 'Laptop',
        sku: 'LAP-001',
        quantity: 10,
      };

      // Add first product
      await inventoryService.addProduct(productData);

      // Try to add another product with same SKU
      const duplicateProduct = {
        name: 'Desktop',
        sku: 'LAP-001',
        quantity: 5,
      };

      await expect(inventoryService.addProduct(duplicateProduct)).rejects.toThrow(
        'Product with this SKU already exists'
      );
    });

    it('should throw error when quantity is negative', async () => {
      const productData = {
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

