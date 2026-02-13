// ===== Mobile Navigation Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// ===== Navbar Shadow on Scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

// ===== Load Products =====
const productsGrid = document.getElementById('productsGrid');
const noProducts = document.getElementById('noProducts');
let allProducts = [];

async function loadProducts() {
  // Check localStorage first (admin updates), then fall back to products.json
  const localData = localStorage.getItem('jemtech_products');
  if (localData) {
    try {
      allProducts = JSON.parse(localData);
      renderProducts(allProducts);
      return;
    } catch (e) {
      // Fall through to fetch
    }
  }

  try {
    const response = await fetch('products.json');
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (err) {
    productsGrid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;">Unable to load products. Please try again later.</p>';
  }
}

function renderProducts(products) {
  const filtered = products.filter(p => p.available !== false);
  const soldOut = products.filter(p => p.available === false);
  const sorted = [...filtered, ...soldOut];

  if (sorted.length === 0) {
    productsGrid.innerHTML = '';
    noProducts.style.display = 'block';
    return;
  }

  noProducts.style.display = 'none';
  productsGrid.innerHTML = sorted.map(product => {
    const isSold = product.available === false;
    const conditionClass = product.condition?.toLowerCase() === 'fair' ? 'fair' : '';
    const imageHTML = product.image
      ? `<img src="${product.image}" alt="${product.name}">`
      : `<span class="placeholder-img">&#128187;</span>`;

    return `
      <div class="product-card ${isSold ? 'sold-out' : ''}" data-category="${product.category}">
        ${isSold ? '<div class="sold-badge">SOLD</div>' : ''}
        <div class="product-image">${imageHTML}</div>
        <div class="product-body">
          <span class="product-category">${product.category || 'Other'}</span>
          <h3>${product.name}</h3>
          <p class="description">${product.description}</p>
          <div class="product-meta">
            <span class="product-price">$${product.price.toFixed(2)}</span>
            ${product.condition ? `<span class="product-condition ${conditionClass}">${product.condition}</span>` : ''}
          </div>
          ${isSold ? '<p style="text-align:center;font-weight:600;color:#ef4444;">Sold Out</p>' : `<div class="paypal-button-container" id="paypal-btn-${product.id}"></div>`}
        </div>
      </div>
    `;
  }).join('');

  // Render PayPal buttons for available products
  filtered.forEach(product => {
    renderPayPalButton(product);
  });
}

function renderPayPalButton(product) {
  const container = document.getElementById(`paypal-btn-${product.id}`);
  if (!container || typeof paypal === 'undefined') return;

  paypal.Buttons({
    style: {
      layout: 'horizontal',
      color: 'gold',
      shape: 'rect',
      label: 'buynow',
      height: 40,
      tagline: false
    },
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          description: product.name,
          amount: {
            value: product.price.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Payment complete! Thank you, ' + details.payer.name.given_name + '. We will contact you about pickup or shipping.');
      });
    },
    onError: function(err) {
      console.error('PayPal error:', err);
    }
  }).render(container);
}

// ===== Category Filters =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;
    if (category === 'all') {
      renderProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => p.category === category);
      renderProducts(filtered);
    }
  });
});

// ===== Init =====
loadProducts();
