const productRepository = require('../repositories/productRepository');

class ProductService {
  async listProducts() {
    return await productRepository.getAll();
  }

  async getProduct(id) {
    return await productRepository.getById(id);
  }

  async createProduct(data) {
    if (!data.nome || !data.preco) {
      throw new Error('Nome e preço são obrigatórios');
    }
    return await productRepository.create(data);
  }

  async updateProduct(id, data) {
    return await productRepository.update(id, data);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
