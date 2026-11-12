const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');

class OrderController {
  async createOrder(req, res) {
    try {
      const { items, total } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio' });
      }

      // Validação de estoque no Backend
      for (const item of items) {
        const product = await productRepository.getById(item.id);
        if (!product || product.estoque < item.qtd) {
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto: ${product ? product.nome : 'Item'}. Disponível: ${product ? product.estoque : 0}` 
          });
        }
      }

      const data = new Date().toISOString().split('T')[0];
      const newOrder = await orderRepository.create({ usuario_id: 1, data, total, items });
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getOrders(req, res) {
    try {
      const orders = await orderRepository.getAll();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await orderRepository.updateStatus(req.params.id, status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new OrderController();