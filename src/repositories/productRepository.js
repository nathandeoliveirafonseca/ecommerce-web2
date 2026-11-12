const { db } = require('../database/db');

class ProductRepository {
  async getAll() {
    return new Promise((resolve, reject) => {
      db.all("SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getById(id) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM produtos WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async create(product) {
    const { categoria_id, nome, descricao, preco, estoque, imagem_url } = product;
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO produtos (categoria_id, nome, descricao, preco, estoque, imagem_url) VALUES (?, ?, ?, ?, ?, ?)",
        [categoria_id, nome, descricao, preco, estoque, imagem_url],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...product });
        }
      );
    });
  }

  async update(id, product) {
    const { categoria_id, nome, descricao, preco, estoque, imagem_url } = product;
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE produtos SET categoria_id = ?, nome = ?, descricao = ?, preco = ?, estoque = ?, imagem_url = ? WHERE id = ?",
        [categoria_id, nome, descricao, preco, estoque, imagem_url, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, ...product });
        }
      );
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM produtos WHERE id = ?", [id], function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }
}

module.exports = new ProductRepository();
