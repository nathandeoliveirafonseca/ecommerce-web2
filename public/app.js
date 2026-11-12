let products = [];
let cart = [];
let selectedCategory = 'Todas';

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});

async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    products = await res.json();
    renderProducts();
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const search = document.getElementById('searchInput').value.toLowerCase();
  
  const filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'Todas' || p.categoria_nome === selectedCategory;
    const matchesSearch = p.nome.toLowerCase().includes(search) || p.descricao.toLowerCase().includes(search);
    return matchesCat && matchesSearch;
  });

  document.getElementById('productCounter').innerText = `${filtered.length} produto(s) encontrado(s)`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-medium">Nenhum produto encontrado.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col">
      <img src="${p.imagem_url || 'https://via.placeholder.com/300'}" alt="${p.nome}" class="w-full h-48 object-cover bg-slate-100">
      <div class="p-4 flex flex-col flex-grow">
        <span class="text-xs font-semibold uppercase text-brandOrange tracking-wider">${p.categoria_nome || 'Geral'}</span>
        <h4 class="font-bold text-slate-800 text-base mt-1 mb-1 line-clamp-1">${p.nome}</h4>
        <p class="text-slate-500 text-xs mb-4 line-clamp-2 flex-grow">${p.descricao}</p>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-lg font-extrabold text-brandDark">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
          <button onclick="addToCart(${p.id})" class="bg-brandDark hover:bg-brandOrange text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1">
            <i class="fa-solid fa-cart-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function selectCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('text-brandOrange', 'font-bold');
    if (btn.innerText.includes(cat) || (cat === 'Todas' && btn.innerText.includes('Todas'))) {
      btn.classList.add('text-brandOrange', 'font-bold');
    }
  });
  renderProducts();
}

function filterProducts() {
  renderProducts();
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qtd += 1;
  } else {
    cart.push({ ...prod, qtd: 1 });
  }

  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function changeQtd(id, delta) {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qtd += delta;
    if (item.qtd <= 0) removeFromCart(id);
    else updateCartUI();
  }
}

function updateCartUI() {
  const list = document.getElementById('cartItemsList');
  const count = cart.reduce((acc, i) => acc + i.qtd, 0);
  const total = cart.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

  document.getElementById('cartCount').innerText = count;
  document.getElementById('cartTotal').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;

  if (cart.length === 0) {
    list.innerHTML = `<div class="text-center py-12 text-slate-400">Seu carrinho está vazio.</div>`;
    return;
  }

  list.innerHTML = cart.map(i => `
    <div class="py-3 flex items-center justify-between gap-3">
      <div class="flex-grow">
        <h5 class="font-bold text-sm text-slate-800 line-clamp-1">${i.nome}</h5>
        <span class="text-xs text-slate-500">R$ ${i.preco.toFixed(2).replace('.', ',')} un.</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="changeQtd(${i.id}, -1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-xs">-</button>
        <span class="text-sm font-semibold">${i.qtd}</span>
        <button onclick="changeQtd(${i.id}, 1)" class="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold text-xs">+</button>
      </div>
      <button onclick="removeFromCart(${i.id})" class="text-red-500 hover:text-red-700 text-sm"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');
}

async function checkout() {
  if (cart.length === 0) return alert('Seu carrinho está vazio!');
  const total = cart.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    });

    if (res.ok) {
      alert('Pedido realizado com sucesso!');
      cart = [];
      updateCartUI();
      toggleCartModal();
    } else {
      alert('Erro ao processar pedido.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function saveProduct(e) {
  e.preventDefault();
  const nome = document.getElementById('prodNome').value;
  const preco = parseFloat(document.getElementById('prodPreco').value);
  const categoria_id = parseInt(document.getElementById('prodCategoria').value);
  const estoque = parseInt(document.getElementById('prodEstoque').value);
  const imagem_url = document.getElementById('prodImagem').value;
  const descricao = document.getElementById('prodDescricao').value;

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria_id, nome, descricao, preco, estoque, imagem_url })
    });

    if (res.ok) {
      alert('Produto cadastrado com sucesso!');
      document.getElementById('productForm').reset();
      toggleAdminModal();
      fetchProducts();
    }
  } catch (err) {
    console.error(err);
  }
}

async function toggleOrdersModal() {
  const modal = document.getElementById('ordersModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    const res = await fetch('/api/orders');
    const orders = await res.json();
    const list = document.getElementById('ordersList');
    if (orders.length === 0) {
      list.innerHTML = `<div class="text-center py-8 text-slate-500">Nenhum pedido realizado ainda.</div>`;
    } else {
      list.innerHTML = orders.map(o => `
        <div class="border rounded-lg p-4 bg-slate-50 flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-800">Pedido #${o.id}</span>
            <span class="text-xs text-slate-500 block">Data: ${o.data}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 mt-1 inline-block">${o.status}</span>
          </div>
          <span class="text-lg font-bold text-brandDark">R$ ${o.total.toFixed(2).replace('.', ',')}</span>
        </div>
      `).join('');
    }
  }
}

function toggleCartModal() {
  document.getElementById('cartModal').classList.toggle('hidden');
}

function toggleAdminModal() {
  document.getElementById('adminModal').classList.toggle('hidden');
}
