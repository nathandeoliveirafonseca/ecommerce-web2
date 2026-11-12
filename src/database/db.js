const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

function initDb() {
  db.serialize(() => {
    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT
    )`);

    // Tabela de Produtos
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      estoque INTEGER DEFAULT 0,
      imagem_url TEXT,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`);

    // Tabela de Usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      tipo TEXT DEFAULT 'cliente'
    )`);

    // Tabela de Pedidos
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'Pendente',
      total REAL NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    // Tabela de Itens do Pedido
    db.run(`CREATE TABLE IF NOT EXISTS itens_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )`);

    // Seed inicial se vazio
    db.get("SELECT COUNT(*) AS count FROM produtos", (err, row) => {
      if (row && row.count === 0) {
        db.run(`INSERT INTO categorias (nome, descricao) VALUES 
          ('Eletrônicos', 'Gadgets e tecnologia'),
          ('Vestuário', 'Roupas e acessórios'),
          ('Livros', 'Livros físicos e didáticos'),
          ('Casa', 'Itens para lar e decoração')`);

        db.run(`INSERT INTO produtos (categoria_id, nome, descricao, preco, estoque, imagem_url) VALUES
          (1, 'Smartphone Galaxy S23', 'Smartphone 256GB 8GB RAM', 3499.90, 15, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'),
          (1, 'Notebook Dell XPS 13', 'Intel i7 16GB RAM SSD 512GB', 7899.00, 8, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80'),
          (1, 'Fone de Ouvido Bluetooth', 'Cancelamento de ruído ativo', 450.00, 30, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'),
          (2, 'Camiseta Algodão Premium', '100% Algodão cor Preta', 79.90, 50, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'),
          (3, 'Livro - Código Limpo', 'Habilidades Práticas do Agile Software', 95.00, 20, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'),
          (4, 'Cafeteira Expressa', 'Pressão de 15 Bar para café expresso', 389.90, 12, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=400&q=80')`);
      }
    });
  });
}

module.exports = { db, initDb };
