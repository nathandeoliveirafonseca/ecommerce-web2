const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.resolve(__dirname, 'ecommerce.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

function initDb() {
  db.serialize(() => {
    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    )`);

    // Tabela de Produtos (com subcategoria)
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER,
      subcategoria TEXT DEFAULT 'Outros',
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      estoque INTEGER NOT NULL,
      imagem_url TEXT,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )`);

    // Tabela de Pedidos
    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'Pendente'
    )`);

    // Tabela de Itens do Pedido
    db.run(`CREATE TABLE IF NOT EXISTS pedido_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      produto_id INTEGER,
      quantidade INTEGER NOT NULL,
      preco REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    )`);

    // Inserir categorias padrão se estiver vazio
    db.get(`SELECT COUNT(*) as count FROM categorias`, (err, row) => {
      if (row && row.count === 0) {
        db.run(`INSERT INTO categorias (nome) VALUES ('Eletrônicos')`);
        db.run(`INSERT INTO categorias (nome) VALUES ('Vestuário')`);
        db.run(`INSERT INTO categorias (nome) VALUES ('Livros')`);
        db.run(`INSERT INTO categorias (nome) VALUES ('Casa')`);
        console.log('Categorias padrão inseridas.');
      }
    });
  });
}

module.exports = { db, initDb };