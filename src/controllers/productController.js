const { db } = require('../database/db');

class ProductController {
  async getAll(req, res) {
    db.all(
      `SELECT p.*, c.nome as categoria_name FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id`,
      [],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        // Mapeia para o padrão esperado pelo frontend
        const formatted = rows.map(r => ({
          ...r,
          categoria_nome: r.categoria_name
        }));
        res.json(formatted);
      }
    );
  }

  async getById(req, res) {
    const { id } = req.params;
    db.get(
      `SELECT p.*, c.nome as categoria_name FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?`,
      [id],
      (err, row) => {
        if (err || !row) {
          return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.json({ ...row, categoria_nome: row.categoria_name });
      }
    );
  }

  async create(req, res) {
    const { categoria_id, subcategoria, nome, descricao, preco, estoque, imagem_url } = req.body;
    if (!nome || !preco || !estoque) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios.' });
    }

    const sub = subcategoria || 'Outros';
    db.run(
      `INSERT INTO produtos (categoria_id, subcategoria, nome, descricao, preco, estoque, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [categoria_id || 1, sub, nome, descricao || '', preco, estoque, imagem_url || ''],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, mensagem: 'Produto criado com sucesso.' });
      }
    );
  }

  async update(req, res) {
    const { id } = req.params;
    const { categoria_id, subcategoria, nome, descricao, preco, estoque, imagem_url } = req.body;

    const sub = subcategoria || 'Outros';
    db.run(
      `UPDATE produtos SET categoria_id = ?, subcategoria = ?, nome = ?, descricao = ?, preco = ?, estoque = ?, imagem_url = ? WHERE id = ?`,
      [categoria_id || 1, sub, nome, descricao || '', preco, estoque, imagem_url || '', id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ mensagem: 'Produto atualizado com sucesso.' });
      }
    );
  }

  async delete(req, res) {
    const { id } = req.params;
    db.run(`DELETE FROM produtos WHERE id = ?`, [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ mensagem: 'Produto excluído com sucesso.' });
    });
  }
}

module.exports = new ProductController();