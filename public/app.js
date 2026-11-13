let products = [];
let cart = [];
let orders = [];
let selectedCategory = 'Todas';
let currentOrderFilter = 'Todos';

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});

function scrollCarousel(direction) {
  const grid = document.getElementById('carouselGrid');
  if (!grid) return;
  const scrollAmount = 300; 
  grid.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = type === 'success' ? 'bg-slate-900 text-white border-brandOrange' : 'bg-red-600 text-white border-red-700';
  const icon = type === 'success' ? '<i class="fa-solid fa-circle-check text-brandOrange"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border-l-4 text-sm font-medium transition-all transform translate-y-2 opacity-0 ${bgColors}`;
  toast.innerHTML = `${icon} <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    products = await res.json();
    renderProducts();
    updateAdminStats();
    renderAdminProductsList();
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    const counter = document.getElementById('productCounter');
    if (counter) counter.innerText = 'Erro ao carregar produtos.';
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const carouselGrid = document.getElementById('carouselGrid');
  const carouselSection = document.getElementById('carouselSection');
  const searchInput = document.getElementById('searchInput');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const sortSelect = document.getElementById('sortSelect');
  const sortBy = sortSelect ? sortSelect.value : 'default';
  
  // 1. Controle do Carrossel (Aparece APENAS se estiver em 'Todas' e sem pesquisa ativa)
  if (selectedCategory === 'Todas' && search === '') {
    if (carouselSection) carouselSection.classList.remove('hidden');
    if (carouselGrid) {
      // Pega alguns produtos aleatórios ou os primeiros para o carrossel
      const carouselItems = [...products].sort(() => 0.5 - Math.random());
      carouselGrid.innerHTML = carouselItems.map(p => createProductCard(p, true)).join('');
    }
  } else {
    if (carouselSection) carouselSection.classList.add('hidden');
  }

  // 2. Filtragem para a Grade Completa Abaixo
  let filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'Todas' || p.categoria_nome === selectedCategory;
    const matchesSearch = p.nome.toLowerCase().includes(search) || (p.descricao && p.descricao.toLowerCase().includes(search));
    return matchesCat && matchesSearch;
  });

  if (sortBy === 'az') {
    filtered.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (sortBy === 'za') {
    filtered.sort((a, b) => b.nome.localeCompare(a.nome));
  } else if (sortBy === 'menor-preco') {
    filtered.sort((a, b) => a.preco - b.preco);
  } else if (sortBy === 'maior-preco') {
    filtered.sort((a, b) => b.preco - a.preco);
  }

  const counter = document.getElementById('productCounter');
  if (counter) {
    counter.innerText = `${filtered.length} produto(s) encontrado(s)`;
  }

  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500 font-medium">Nenhum produto encontrado.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => createProductCard(p, false)).join('');
}

// Função auxiliar para gerar o HTML do card (usada tanto no carrossel quanto na grade)
function createProductCard(p, isCarousel) {
  const lowStockBadge = p.estoque <= 3 && p.estoque > 0 
    ? `<span class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Últimas unidades!</span>`
    : `<span class="text-xs font-semibold text-slate-400">Estoque: ${p.estoque} un.</span>`;

  const cardClasses = isCarousel 
    ? "bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col min-w-[260px] max-w-[260px] flex-shrink-0"
    : "bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col";

  return `
    <div class="${cardClasses}">
      <img src="${p.imagem_url || 'https://via.placeholder.com/300'}" alt="${p.nome}" onclick="openProductModal(${p.id})" class="w-full h-48 object-contain p-3 bg-white border-b border-slate-100 cursor-pointer">
      <div class="p-4 flex flex-col flex-grow">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs font-semibold uppercase text-brandOrange tracking-wider">${p.categoria_nome || 'Geral'}</span>
          ${lowStockBadge}
        </div>
        <h4 class="font-bold text-slate-800 text-base mb-1 line-clamp-1 cursor-pointer hover:text-brandOrange" onclick="openProductModal(${p.id})">${p.nome}</h4>
        <p class="text-slate-500 text-xs mb-4 line-clamp-2 flex-grow">${p.descricao || ''}</p>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-lg font-extrabold text-brandDark">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
          <button onclick="addToCart(${p.id})" class="bg-brandDark hover:bg-brandOrange text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1">
            <i class="fa-solid fa-cart-plus"></i> Adicionar
          </button>
        </div>
      </div>
    </div>
  `;
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

function openProductModal(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('modalImg').src = p.imagem_url || 'https://via.placeholder.com/300';
  document.getElementById('modalCategoria').innerText = p.categoria_nome || 'Geral';
  document.getElementById('modalNome').innerText = p.nome;
  document.getElementById('modalDescricao').innerText = p.descricao || 'Sem descrição detalhada.';
  document.getElementById('modalEstoque').innerText = `Estoque disponível: ${p.estoque} unidades`;
  document.getElementById('modalPreco').innerText = `R$ ${p.preco.toFixed(2).replace('.', ',')}`;
  
  const addBtn = document.getElementById('modalAddBtn');
  addBtn.onclick = () => {
    addToCart(p.id);
    toggleProductModal();
  };

  toggleProductModal();
}

function toggleProductModal() {
  document.getElementById('productModal').classList.toggle('hidden');
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const existing = cart.find(item => item.id === id);
  const currentQtyInCart = existing ? existing.qtd : 0;

  if (currentQtyInCart + 1 > prod.estoque) {
    showToast(`Estoque insuficiente! Apenas ${prod.estoque} un. disponíveis.`, 'error');
    return;
  }

  if (existing) {
    existing.qtd += 1;
  } else {
    cart.push({ ...prod, qtd: 1 });
  }

  showToast(`"${prod.nome}" adicionado ao carrinho!`);
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function changeQtd(id, delta) {
  const prod = products.find(p => p.id === id);
  const item = cart.find(i => i.id === id);
  
  if (item && prod) {
    const newQty = item.qtd + delta;
    if (newQty > prod.estoque) {
      showToast(`Estoque insuficiente! Máximo de ${prod.estoque} unidades.`, 'error');
      return;
    }
    item.qtd = newQty;
    if (item.qtd <= 0) removeFromCart(id);
    else updateCartUI();
  }
}

function togglePaymentFields(method) {
  const cardFields = document.getElementById('cartaoFields');
  if (!cardFields) return;
  if (method === 'Cartao') {
    cardFields.classList.remove('hidden');
  } else {
    cardFields.classList.add('hidden');
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
  if (cart.length === 0) return showToast('Seu carrinho está vazio!', 'error');

  const paymentInput = document.querySelector('input[name="pagamento"]:checked');
  const paymentMethod = paymentInput ? paymentInput.value : 'PIX';

  if (paymentMethod === 'Cartao') {
    const cardNum = document.getElementById('cardNumber').value;
    if (!cardNum) {
      showToast('Preencha os dados do cartão para simular o pagamento.', 'error');
      return;
    }
  }

  const total = cart.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(`Pedido realizado com sucesso via ${paymentMethod}!`);
      cart = [];
      updateCartUI();
      toggleCartModal();
      fetchProducts();
    } else {
      showToast(data.error || 'Erro ao processar pedido.', 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

// --- ADMIN & ESTATÍSTICAS ---

function updateAdminStats() {
  const totalProducts = products.length;
  const stockValue = products.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
  const lowStockCount = products.filter(p => p.estoque <= 3).length;

  const elTotal = document.getElementById('statTotalProducts');
  const elValue = document.getElementById('statStockValue');
  const elLow = document.getElementById('statLowStock');

  if (elTotal) elTotal.innerText = totalProducts;
  if (elValue) elValue.innerText = `R$ ${stockValue.toFixed(2).replace('.', ',')}`;
  if (elLow) elLow.innerText = lowStockCount;
}

function openAdminModal() {
  resetAdminForm();
  updateAdminStats();
  renderAdminProductsList();
  document.getElementById('adminModal').classList.remove('hidden');
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.add('hidden');
  resetAdminForm();
}

function renderAdminProductsList() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400">Nenhum produto cadastrado.</p>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="flex items-center justify-between p-2.5 border rounded-lg bg-white hover:bg-slate-50 gap-3">
      <div class="flex items-center gap-3 overflow-hidden">
        <img src="${p.imagem_url || 'https://via.placeholder.com/60'}" class="w-10 h-10 object-contain rounded border bg-white shrink-0">
        <div class="truncate">
          <p class="font-bold text-xs text-slate-800 truncate">${p.nome}</p>
          <p class="text-xs text-slate-500">R$ ${p.preco.toFixed(2).replace('.', ',')} • Estoque: ${p.estoque}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" onclick="editProduct(${p.id})" class="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition">
          <i class="fa-solid fa-pen"></i> Editar
        </button>
        <button type="button" onclick="deleteProduct(${p.id})" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition">
          <i class="fa-solid fa-trash"></i> Excluir
        </button>
      </div>
    </div>
  `).join('');
}

function editProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('prodId').value = p.id;
  document.getElementById('prodNome').value = p.nome;
  document.getElementById('prodPreco').value = p.preco;
  document.getElementById('prodCategoria').value = p.categoria_id || 1;
  document.getElementById('prodEstoque').value = p.estoque;
  document.getElementById('prodImagem').value = p.imagem_url || '';
  document.getElementById('prodDescricao').value = p.descricao || '';

  document.getElementById('adminFormTitle').innerText = `Editando Produto #${p.id}`;
  document.getElementById('cancelEditBtn').classList.remove('hidden');

  const btn = document.getElementById('adminSubmitBtn');
  btn.innerText = 'Salvar Alterações';
  btn.classList.remove('bg-green-600', 'hover:bg-green-700');
  btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
}

function resetAdminForm() {
  document.getElementById('productForm').reset();
  document.getElementById('prodId').value = '';
  document.getElementById('adminFormTitle').innerText = 'Cadastrar Novo Produto';
  document.getElementById('cancelEditBtn').classList.add('hidden');

  const btn = document.getElementById('adminSubmitBtn');
  btn.innerText = 'Cadastrar Produto';
  btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
  btn.classList.add('bg-green-600', 'hover:bg-green-700');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('prodId').value;
  const nome = document.getElementById('prodNome').value;
  const preco = parseFloat(document.getElementById('prodPreco').value);
  const categoria_id = parseInt(document.getElementById('prodCategoria').value);
  const estoque = parseInt(document.getElementById('prodEstoque').value);
  const imagem_url = document.getElementById('prodImagem').value;
  const descricao = document.getElementById('prodDescricao').value;

  const url = id ? `/api/products/${id}` : '/api/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria_id, nome, descricao, preco, estoque, imagem_url })
    });

    if (res.ok) {
      showToast(id ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
      resetAdminForm();
      fetchProducts();
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Produto excluído com sucesso!');
      fetchProducts();
    }
  } catch (err) {
    console.error(err);
  }
}

// --- PEDIDOS E FILTROS ---

async function toggleOrdersModal() {
  const modal = document.getElementById('ordersModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    loadOrders();
  }
}

function filterOrders(status) {
  currentOrderFilter = status;
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    btn.classList.remove('bg-brandDark', 'text-white');
    btn.classList.add('bg-white', 'text-slate-700', 'border');
    if (btn.innerText.toLowerCase().includes(status.toLowerCase()) || (status === 'Todos' && btn.innerText === 'Todos')) {
      btn.classList.remove('bg-white', 'text-slate-700', 'border');
      btn.classList.add('bg-brandDark', 'text-white');
    }
  });
  renderOrdersList();
}

async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    orders = await res.json();
    renderOrdersList();
  } catch (err) {
    console.error(err);
  }
}

function renderOrdersList() {
  const list = document.getElementById('ordersList');
  if (!list) return;

  const filtered = orders.filter(o => currentOrderFilter === 'Todos' || o.status === currentOrderFilter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="text-center py-8 text-slate-500">Nenhum pedido encontrado para o filtro "${currentOrderFilter}".</div>`;
    return;
  }

  list.innerHTML = filtered.map(o => `
    <div class="border rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <span class="font-bold text-slate-800">Pedido #${o.id}</span>
        <span class="text-xs text-slate-500 block">Data: ${o.data}</span>
        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 mt-1 inline-block">Status: ${o.status}</span>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <span class="text-base font-bold text-brandDark">R$ ${o.total.toFixed(2).replace('.', ',')}</span>
        <select onchange="updateOrderStatus(${o.id}, this.value)" class="text-xs p-1 border rounded bg-white">
          <option value="Pendente" ${o.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Em Processamento" ${o.status === 'Em Processamento' ? 'selected' : ''}>Em Processamento</option>
          <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
          <option value="Entregue" ${o.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
        </select>
      </div>
    </div>
  `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Status do pedido #${orderId} atualizado para ${newStatus}`);
      loadOrders();
    }
  } catch (err) {
    console.error(err);
  }
}

function toggleCartModal() {
  document.getElementById('cartModal').classList.toggle('hidden');
}