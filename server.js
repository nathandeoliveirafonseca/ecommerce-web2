const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb } = require('./src/database/db');

const productController = require('./src/controllers/productController');
const orderController = require('./src/controllers/orderController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializa o banco de dados
initDb();

// Rotas da API
app.get('/api/products', productController.getAll);
app.get('/api/products/:id', productController.getById);
app.post('/api/products', productController.create);
app.put('/api/products/:id', productController.update);
app.delete('/api/products/:id', productController.delete);

app.post('/api/orders', orderController.createOrder);
app.get('/api/orders', orderController.getOrders);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}: http://localhost:${PORT}`);
});
