const { db } = require('../database/db');

class OrderRepository {
  async create(orderData) {
    const { usuario_id, data, total, items } = orderData;
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO pedidos (usuario_id, data, status, total) VALUES (?, ?, 'Pendente', ?)",
        [usuario_id || 1, data, total],
        function (err) {
          if (err) return reject(err);
          const orderId = this.lastID;

          const stmt = db.prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
          items.forEach(item => {
            stmt.run([orderId, item.id, item.qtd, item.preco]);
          });
          stmt.finalize();

          resolve({ id: orderId, status: 'Pendente', ...orderData });
        }
      );
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM pedidos ORDER BY id DESC", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run("UPDATE pedidos SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) reject(err);
        else resolve({ id, status });
      });
    });
  }
}

module.exports = new OrderRepository();