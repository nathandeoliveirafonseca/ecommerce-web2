const orderRepository = require('../repositories/orderRepository');

class OrderController {
  async createOrder(req, res) {
    try {
      const { items, total } = req.body;
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho vazio' });
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
}

module.exports = new OrderController();
