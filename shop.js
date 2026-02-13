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
    } catch (e) { /* fall through */ }
  }

  try {
    const response = await fetch('products.json');
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (err) {
    productsGrid.innerHTML = '<p style="text-align:center;color:var(--text-light);grid-column:1/-1;">Unable to load products. Please try again later.</p>';
  }
}

function getProductImages(product) {
  // Support both "images" array and legacy "image" string
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  if (product.image) {
    return [product.image];
  }
  return [];
}

function getCategoryIcon(category) {
  const icons = {
    'Laptops': '&#128187;',
    'Desktops': '&#128421;',
    'Phones': '&#128241;',
    'Tablets': '&#128203;',
    'Gaming': '&#127918;',
    'Accessories': '&#128268;'
  };
  return icons[category] || '&#128187;';
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
    const images = getProductImages(product);
    const hasImage = images.length > 0;
    const imageCount = images.length;

    const imageHTML = hasImage
      ? `<img src="${images[0]}" alt="${product.name}">`
      : `<span class="placeholder-img">${getCategoryIcon(product.category)}</span>`;

    return `
      <div class="product-card ${isSold ? 'sold-out' : ''}" data-category="${product.category}" data-id="${product.id}">
        ${isSold ? '<div class="sold-badge">SOLD</div>' : ''}
        <div class="product-image">
          ${imageHTML}
          ${imageCount > 1 ? `<span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.75rem;">${imageCount} photos</span>` : ''}
        </div>
        <div class="product-body">
          <span class="product-category">${product.category || 'Other'}</span>
          <h3>${product.name}</h3>
          <p class="description">${product.description}</p>
          <div class="product-meta">
            <span class="product-price">$${product.price.toFixed(2)}</span>
            ${product.condition ? `<span class="product-condition ${conditionClass}">${product.condition}</span>` : ''}
          </div>
          ${isSold
            ? '<p style="text-align:center;font-weight:600;color:#ef4444;">Sold Out</p>'
            : '<button class="btn btn-primary btn-full view-details-btn" style="font-size:0.9rem;padding:10px 20px;">View Details</button>'
          }
        </div>
      </div>
    `;
  }).join('');

  // Add click listeners to all product cards
  document.querySelectorAll('.product-card:not(.sold-out)').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const product = allProducts.find(p => p.id === id);
      if (product) openProductModal(product);
    });
  });
}

// ===== Product Detail Modal =====
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const galleryMainImg = document.getElementById('galleryMainImg');
const galleryThumbs = document.getElementById('galleryThumbs');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

let currentImages = [];
let currentImageIndex = 0;
let currentModalProduct = null;

function openProductModal(product) {
  currentModalProduct = product;
  currentImages = getProductImages(product);
  currentImageIndex = 0;

  // Set details
  document.getElementById('modalCategory').textContent = product.category || 'Other';
  document.getElementById('modalName').textContent = product.name;
  document.getElementById('modalPrice').textContent = '$' + product.price.toFixed(2);

  const conditionEl = document.getElementById('modalCondition');
  conditionEl.textContent = product.condition || '';
  conditionEl.className = 'product-condition' + (product.condition?.toLowerCase() === 'fair' ? ' fair' : '');

  document.getElementById('modalDescription').textContent = product.description;

  // Gallery
  const galleryMain = document.querySelector('.gallery-main');
  if (currentImages.length > 0) {
    galleryMainImg.src = currentImages[0];
    galleryMainImg.alt = product.name;
    galleryMainImg.style.display = 'block';
    // Remove any existing placeholder
    const existingPlaceholder = galleryMain.querySelector('.placeholder-gallery');
    if (existingPlaceholder) existingPlaceholder.remove();
  } else {
    galleryMainImg.style.display = 'none';
    // Add placeholder if not already there
    if (!galleryMain.querySelector('.placeholder-gallery')) {
      const placeholder = document.createElement('span');
      placeholder.className = 'placeholder-gallery';
      placeholder.innerHTML = getCategoryIcon(product.category);
      galleryMain.appendChild(placeholder);
    }
  }

  // Arrows
  if (currentImages.length > 1) {
    galleryPrev.classList.add('visible');
    galleryNext.classList.add('visible');
  } else {
    galleryPrev.classList.remove('visible');
    galleryNext.classList.remove('visible');
  }

  // Thumbnails
  if (currentImages.length > 1) {
    galleryThumbs.innerHTML = currentImages.map((img, i) => `
      <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${img}" alt="${product.name} photo ${i + 1}">
      </div>
    `).join('');

    galleryThumbs.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(thumb.dataset.index);
        setGalleryImage(index);
      });
    });
  } else {
    galleryThumbs.innerHTML = '';
  }

  // PayPal button
  const paypalContainer = document.getElementById('modalPaypalBtn');
  paypalContainer.innerHTML = '';
  renderModalPayPalButton(product, paypalContainer);

  // Show modal
  productModal.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function setGalleryImage(index) {
  if (index < 0 || index >= currentImages.length) return;
  currentImageIndex = index;
  galleryMainImg.src = currentImages[index];
  galleryMainImg.style.display = 'block';

  galleryThumbs.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

galleryPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
  setGalleryImage(newIndex);
});

galleryNext.addEventListener('click', (e) => {
  e.stopPropagation();
  const newIndex = currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
  setGalleryImage(newIndex);
});

function closeModal() {
  productModal.classList.remove('visible');
  document.body.style.overflow = '';
  currentModalProduct = null;
}

modalClose.addEventListener('click', closeModal);
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (productModal.classList.contains('visible') && currentImages.length > 1) {
    if (e.key === 'ArrowLeft') setGalleryImage(currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1);
    if (e.key === 'ArrowRight') setGalleryImage(currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0);
  }
});

// ===== PayPal Button =====
function renderModalPayPalButton(product, container) {
  if (typeof paypal === 'undefined') {
    // PayPal SDK not loaded — show only the contact button
    return;
  }

  try {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'buynow',
        height: 45,
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
          closeModal();
        });
      },
      onError: function(err) {
        console.error('PayPal error:', err);
      }
    }).render(container);
  } catch (e) {
    // PayPal render failed, contact button still available
  }
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
