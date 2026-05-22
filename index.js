/**
 * Attack Shark X3 - Premium Landing Page Logic
 * Implements smooth scroll scrubbing (LERP), custom e-commerce cart,
 * aim trainer precision DPI simulator, and mobile-friendly draggable WhatsApp widget.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. HERO SCROLL-PINNED VIDEO SCRUBBING (LERP CONTROLLED)
     ========================================================================== */
  const heroSection = document.getElementById('hero-section');
  const video = document.getElementById('hero-video');
  const scrollIndicator = document.getElementById('scroll-indicator');

  if (heroSection && video) {
    let targetTime = 0;
    let easedTime = 0;
    const ease = 0.08; // Buttery LERP smoothing factor (lower = smoother, higher = faster)
    let duration = 6.0; // Default keyframe video length fallback

    // Attach listeners BEFORE playing/loading to avoid missing cached loads
    video.addEventListener('loadedmetadata', () => {
      duration = video.duration || 6.0;
    });

    // Force direct configuration for scroll scrubbing
    video.muted = true;
    video.playsInline = true;
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    video.preload = 'auto';

    let loopStarted = false;
    
    // Main animation frame tick
    function updateScrub() {
      const rect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight;
      const scrollTrack = heroHeight - window.innerHeight;

      if (scrollTrack > 0) {
        // Amount of pixels hero has scrolled off the top
        const scrolled = -rect.top;
        
        // Normalize progress between 0.0 and 1.0
        const progress = Math.max(0, Math.min(1, scrolled / scrollTrack));
        
        // Limit the scrubbing to exactly 180 degrees of rotation (half-way through the full 360-degree video)
        targetTime = progress * (duration * 0.5);

        // Fade scroll indicator based on progress
        if (scrollIndicator) {
          if (progress > 0.05) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
          } else {
            scrollIndicator.style.opacity = '1';
            scrollIndicator.style.pointerEvents = 'auto';
          }
        }
      }

      // Smooth Linear Interpolation (LERP) for buttery responsiveness
      easedTime += (targetTime - easedTime) * ease;

      // Only seek if difference is meaningful and video is ready to seek (readyState >= 1)
      if (video.readyState >= 1 && Math.abs(easedTime - video.currentTime) > 0.01) {
        try {
          video.currentTime = Math.max(0, Math.min(duration - 0.01, easedTime));
        } catch (err) {
          console.warn("Smooth scroll seek was interrupted:", err);
        }
      }

      requestAnimationFrame(updateScrub);
    }

    function startScrubLoop() {
      if (loopStarted) return;
      loopStarted = true;
      requestAnimationFrame(updateScrub);
    }

    // Bind frame loop when ready
    video.addEventListener('loadeddata', startScrubLoop);

    // Load video source
    video.load();

    // Fallback if video loaded instantly from cache or readyState is already satisfied
    if (video.readyState >= 2) {
      startScrubLoop();
    }
  }


  /* ==========================================================================
     2. NAVBAR SCROLL EFFECT
     ========================================================================== */
  const navbar = document.getElementById('main-navbar');
  
  function checkNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', checkNavbarScroll);
  checkNavbarScroll();


  /* ==========================================================================
     3. INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS & COUNTDOWN
     ========================================================================== */
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        
        // Trigger counter animation once when element enters
        const counterElement = entry.target.querySelector('.counter');
        if (counterElement && !counterElement.classList.contains('counted')) {
          triggerCounter(counterElement);
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollElements.forEach(el => elementObserver.observe(el));

  function triggerCounter(el) {
    el.classList.add('counted');
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200; // ms
    const startTime = performance.now();

    function updateCount(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      el.textContent = currentVal;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(updateCount);
  }


  /* ==========================================================================
     4. E-COMMERCE CONFIGURATOR & CARGO SYSTEM
     ========================================================================== */
  // Product Config State
  const productState = {
    color: 'white',
    colorName: 'Branco',
    basePrice: 199.00,
    gripTape: false,
    ptfeSkates: false,
    qty: 1,
    imageUrl: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0055.jpg?v=1750248723&width=800'
  };

  const colorImages = {
    white: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0055.jpg?v=1750248723&width=800',
    black: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0056.jpg?v=1750248723&width=800',
    red: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0054_c4431c31-394e-434d-847a-f82bb5d61ec7.jpg?v=1776755443&width=800',
    purple: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0053_12460e0a-e72a-4c6d-81eb-0899c287c57d.jpg?v=1776755443&width=800',
    orange: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0052_0e99dddc-bb9a-47d2-8563-46f132872314.jpg?v=1750248723&width=800',
    berry: 'https://attackshark.com/cdn/shop/files/attackshark_x3_gaming_mouse_0051_678ca850-befd-41a4-b3ef-263ba4e8b452.jpg?v=1750248723&width=800'
  };

  const colorNames = {
    white: 'Branco',
    black: 'Preto',
    red: 'Vermelho',
    purple: 'Roxo',
    orange: 'Laranja',
    berry: 'Rosa Cereja'
  };

  // Cart Array Database
  let cart = [];

  // DOM Swatches color selection
  const colorBtns = document.querySelectorAll('.color-swatch-btn');
  const configSlides = document.querySelectorAll('.config-slide');
  const activeColorNameEl = document.getElementById('active-color-name');

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const colorId = btn.getAttribute('data-color-id');
      productState.color = colorId;
      productState.colorName = colorNames[colorId];
      productState.imageUrl = colorImages[colorId];

      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (activeColorNameEl) {
        activeColorNameEl.textContent = productState.colorName;
      }

      configSlides.forEach(slide => {
        if (slide.getAttribute('data-color') === colorId) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      updateProductSubtotal();
    });
  });

  // Acessories buttons toggles
  const accGripBtn = document.getElementById('acc-grip');
  const accFeetBtn = document.getElementById('acc-feet');

  if (accGripBtn) {
    accGripBtn.addEventListener('click', () => {
      productState.gripTape = !productState.gripTape;
      accGripBtn.classList.toggle('active', productState.gripTape);
      updateProductSubtotal();
    });
  }

  if (accFeetBtn) {
    accFeetBtn.addEventListener('click', () => {
      productState.ptfeSkates = !productState.ptfeSkates;
      accFeetBtn.classList.toggle('active', productState.ptfeSkates);
      updateProductSubtotal();
    });
  }

  // Quantity controllers
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  const qtyValueEl = document.getElementById('qty-value');

  if (qtyMinusBtn && qtyPlusBtn && qtyValueEl) {
    qtyMinusBtn.addEventListener('click', () => {
      if (productState.qty > 1) {
        productState.qty--;
        qtyValueEl.textContent = productState.qty;
        updateProductSubtotal();
      }
    });

    qtyPlusBtn.addEventListener('click', () => {
      productState.qty++;
      qtyValueEl.textContent = productState.qty;
      updateProductSubtotal();
    });
  }

  // Calculate and display configurator total
  const configCalculatedSubtotalEl = document.getElementById('config-calculated-subtotal');

  function getSingleProductPrice() {
    let price = productState.basePrice;
    if (productState.gripTape) price += 49.00;
    if (productState.ptfeSkates) price += 29.00;
    return price;
  }

  function updateProductSubtotal() {
    if (!configCalculatedSubtotalEl) return;
    const singlePrice = getSingleProductPrice();
    const total = singlePrice * productState.qty;
    configCalculatedSubtotalEl.textContent = formatCurrency(total);
  }

  // Shopping Drawer Drawer elements
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartDrawerCloseBtn = document.getElementById('cart-drawer-close');
  const cartBadge = document.getElementById('cart-badge');
  const cartItemsWrapper = document.getElementById('cart-items-wrapper');
  const cartEmptyMessage = document.getElementById('cart-empty-message');
  const cartDrawerFooterPanel = document.getElementById('cart-drawer-footer-panel');
  const cartTotalValueEl = document.getElementById('cart-total-value');
  const btnAddToCart = document.getElementById('btn-add-to-cart');

  function openCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.add('open');
      cartDrawerOverlay.classList.add('open');
    }
  }

  function closeCartDrawer() {
    if (cartDrawer && cartDrawerOverlay) {
      cartDrawer.classList.remove('open');
      cartDrawerOverlay.classList.remove('open');
    }
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCartDrawer);
  if (cartDrawerCloseBtn) cartDrawerCloseBtn.addEventListener('click', closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCartDrawer);

  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => {
      const item = {
        id: `mouse-x3-${productState.color}-${productState.gripTape}-${productState.ptfeSkates}`,
        type: 'mouse',
        name: 'Attack Shark X3 Mouse',
        color: productState.colorName,
        colorId: productState.color,
        gripTape: productState.gripTape,
        ptfeSkates: productState.ptfeSkates,
        price: getSingleProductPrice(),
        qty: productState.qty,
        thumb: productState.imageUrl
      };
      
      addToCartArray(item);
      openCartDrawer();
      
      // Reset config state to defaults
      productState.qty = 1;
      if (qtyValueEl) qtyValueEl.textContent = '1';
      productState.gripTape = false;
      productState.ptfeSkates = false;
      if (accGripBtn) accGripBtn.classList.remove('active');
      if (accFeetBtn) accFeetBtn.classList.remove('active');
      updateProductSubtotal();
    });
  }

  function addToCartArray(item) {
    const existingIndex = cart.findIndex(c => c.id === item.id);
    if (existingIndex > -1) {
      cart[existingIndex].qty += item.qty;
    } else {
      cart.push(item);
    }
    renderCart();
  }

  function renderCart() {
    if (!cartItemsWrapper || !cartBadge) return;
    cartItemsWrapper.innerHTML = '';
    let totalItemsCount = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
      if (cartEmptyMessage) cartEmptyMessage.style.display = 'flex';
      if (cartDrawerFooterPanel) cartDrawerFooterPanel.style.display = 'none';
      cartBadge.textContent = '0';
    } else {
      if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
      if (cartDrawerFooterPanel) cartDrawerFooterPanel.style.display = 'block';

      cart.forEach((item, index) => {
        totalItemsCount += item.qty;
        const subtotal = item.price * item.qty;
        totalPrice += subtotal;

        let metaText = '';
        if (item.type === 'mouse') {
          metaText = `Cor: ${item.color}`;
          const extras = [];
          if (item.gripTape) extras.push('Grip Tape');
          if (item.ptfeSkates) extras.push('Skates PTFE');
          if (extras.length > 0) metaText += ` + ${extras.join(' & ')}`;
        } else {
          metaText = item.meta || '';
        }

        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
          <img src="${item.thumb}" class="cart-item-thumb" alt="${item.name}">
          <div class="cart-item-details">
            <h5>${item.name}</h5>
            <div class="cart-item-meta">${metaText}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
              <span class="cart-item-price">${formatCurrency(item.price)}</span>
              <span class="cart-item-qty-tag">Qtd: ${item.qty}</span>
            </div>
          </div>
          <button class="cart-item-remove" data-index="${index}" title="Remover item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;
        cartItemsWrapper.appendChild(card);
      });

      cartBadge.textContent = totalItemsCount;
      if (cartTotalValueEl) cartTotalValueEl.textContent = formatCurrency(totalPrice);
    }

    // Attach listeners to removal buttons
    const removeBtns = document.querySelectorAll('.cart-item-remove');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  // Cart unified WhatsApp checkout
  const btnCartCheckoutWhatsapp = document.getElementById('btn-cart-checkout-whatsapp');
  if (btnCartCheckoutWhatsapp) {
    btnCartCheckoutWhatsapp.addEventListener('click', () => {
      if (cart.length === 0) return;

      let messageText = "Olá! Gostaria de fazer o pedido dos seguintes itens Attack Shark:\n\n";
      let grandTotal = 0;

      cart.forEach(item => {
        const itemSubtotal = item.price * item.qty;
        grandTotal += itemSubtotal;

        messageText += `*${item.name}*\n`;
        if (item.type === 'mouse') {
          messageText += `  • Cor: ${item.color}\n`;
          const extras = [];
          if (item.gripTape) extras.push("Grip Tape (+R$49,00)");
          if (item.ptfeSkates) extras.push("Skates PTFE (+R$29,00)");
          if (extras.length > 0) {
            messageText += `  • Extras: ${extras.join(' & ')}\n`;
          }
        } else if (item.meta) {
          messageText += `  • Obs: ${item.meta}\n`;
        }
        messageText += `  • Qtd: ${item.qty} | Subtotal: ${formatCurrency(itemSubtotal)}\n\n`;
      });

      messageText += `*Valor Total Unificado: ${formatCurrency(grandTotal)}*\n\n`;
      messageText += "Envio rápido para o meu setup. Por favor, me informe o link Pix para pagamento!";

      const encodedText = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/5517991670962?text=${encodedText}`;

      window.open(whatsappUrl, '_blank');
    });
  }


  /* ==========================================================================
     5. Aim Trainer Precision DPI Simulator (HTML5 Canvas)
     ========================================================================== */
  const canvas = document.getElementById('dpi-canvas');
  const canvasContainer = document.querySelector('.canvas-container');
  const canvasInstruction = document.getElementById('canvas-instruction');

  if (canvas && canvasContainer) {
    const ctx = canvas.getContext('2d');
    let canvasWidth = 0;
    let canvasHeight = 0;

    function resizeCanvas() {
      if (!canvasContainer || !canvas) return;
      canvasWidth = canvasContainer.clientWidth;
      canvasHeight = canvasContainer.clientHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Aim Trainer Game States
    let targets = [];
    let particles = [];
    let score = 0;
    let totalClicks = 0;
    let currentDPI = 1600;
    let sensMultiplier = 1.20; // 1600 DPI default sens

    // Crosshair coordinates
    let virtualMouse = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let isMouseInside = false;

    const dpiConfigs = {
      400: { mult: 0.35, label: '0.35x' },
      800: { mult: 0.75, label: '0.75x' },
      1600: { mult: 1.20, label: '1.20x' },
      3200: { mult: 2.20, label: '2.20x' },
      6400: { mult: 3.80, label: '3.80x' },
      26000: { mult: 9.00, label: '9.00x' }
    };

    // Events for Relative movements
    canvasContainer.addEventListener('mouseenter', () => {
      isMouseInside = true;
      if (canvasInstruction) canvasInstruction.style.opacity = '0';
    });

    canvasContainer.addEventListener('mouseleave', () => {
      isMouseInside = false;
    });

    canvasContainer.addEventListener('mousemove', (e) => {
      if (!isMouseInside) return;

      // Real pointer Lock / Relative Hardware Movement mapping
      if (typeof e.movementX !== 'undefined') {
        virtualMouse.x += e.movementX * sensMultiplier;
        virtualMouse.y += e.movementY * sensMultiplier;
      } else {
        // Absolute fallback
        const rect = canvas.getBoundingClientRect();
        virtualMouse.x = e.clientX - rect.left;
        virtualMouse.y = e.clientY - rect.top;
      }

      // Clamp crosshair coordinates inside sandbox boundary
      virtualMouse.x = Math.max(0, Math.min(canvasWidth, virtualMouse.x));
      virtualMouse.y = Math.max(0, Math.min(canvasHeight, virtualMouse.y));
    });

    // Target Shoot Collision listener
    canvasContainer.addEventListener('click', () => {
      if (!isMouseInside) return;
      totalClicks++;

      let hitAny = false;
      for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        const dist = Math.hypot(virtualMouse.x - t.x, virtualMouse.y - t.y);
        
        // If virtual cursor aligns within target radius
        if (dist <= t.r) {
          hitAny = true;
          score++;
          
          // Explode particles
          createParticles(t.x, t.y, t.color);
          
          // Remove target and spawn new one
          targets.splice(i, 1);
          spawnTarget();
          break;
        }
      }

      updateSimulatorStats();
    });

    function spawnTarget() {
      const r = Math.random() * 10 + 15; // Target size radius 15px - 25px
      const x = Math.random() * (canvasWidth - 2 * r) + r;
      const y = Math.random() * (canvasHeight - 2 * r) + r;
      const colors = ['#00e5ff', '#ff3b30', '#0052ff', '#ff8c00', '#8a2be2'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      targets.push({
        x: x,
        y: y,
        r: r,
        pulse: 0,
        pulseSpeed: Math.random() * 0.05 + 0.03,
        color: color
      });
    }

    function createParticles(x, y, color) {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          r: Math.random() * 3 + 1,
          life: 1.0,
          decay: Math.random() * 0.05 + 0.03,
          color: color
        });
      }
    }

    function drawSimulator() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 1. Grid Background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const grid = 40;
      for (let x = 0; x < canvasWidth; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      // 2. Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 3. Draw Targets
      targets.forEach(t => {
        t.pulse += t.pulseSpeed;
        const radiusGlow = t.r + Math.sin(t.pulse) * 2.5;

        // Aura glow
        ctx.beginPath();
        ctx.arc(t.x, t.y, radiusGlow + 5, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.globalAlpha = 0.15;
        ctx.fill();

        // Outer Ring
        ctx.beginPath();
        ctx.arc(t.x, t.y, radiusGlow + 2, 0, Math.PI * 2);
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.stroke();

        // Solid core
        ctx.beginPath();
        ctx.arc(t.x, t.y, radiusGlow - 2, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // White core dot
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.fill();
      });

      // 4. Draw Custom Cyber Reticle crosshair (if inside box)
      if (isMouseInside) {
        ctx.beginPath();
        ctx.arc(virtualMouse.x, virtualMouse.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(virtualMouse.x, virtualMouse.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--primary)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(virtualMouse.x, virtualMouse.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 1.5;
        const line = 4;
        const gap = 11;

        // Top line
        ctx.beginPath();
        ctx.moveTo(virtualMouse.x, virtualMouse.y - gap);
        ctx.lineTo(virtualMouse.x, virtualMouse.y - gap - line);
        ctx.stroke();

        // Bottom
        ctx.beginPath();
        ctx.moveTo(virtualMouse.x, virtualMouse.y + gap);
        ctx.lineTo(virtualMouse.x, virtualMouse.y + gap + line);
        ctx.stroke();

        // Left
        ctx.beginPath();
        ctx.moveTo(virtualMouse.x - gap, virtualMouse.y);
        ctx.lineTo(virtualMouse.x - gap - line, virtualMouse.y);
        ctx.stroke();

        // Right
        ctx.beginPath();
        ctx.moveTo(virtualMouse.x + gap, virtualMouse.y);
        ctx.lineTo(virtualMouse.x + gap + line, virtualMouse.y);
        ctx.stroke();
      }

      requestAnimationFrame(drawSimulator);
    }

    function initSimulator() {
      targets = [];
      particles = [];
      score = 0;
      totalClicks = 0;
      updateSimulatorStats();
      for (let i = 0; i < 3; i++) {
        spawnTarget();
      }
    }

    function updateSimulatorStats() {
      const clicksLabel = document.getElementById('sim-clicks-label');
      const accuracyLabel = document.getElementById('sim-accuracy-label');
      const acc = totalClicks === 0 ? 100 : Math.round((score / totalClicks) * 100);

      if (clicksLabel) clicksLabel.textContent = `Alvos Atingidos: ${score}`;
      if (accuracyLabel) accuracyLabel.textContent = `Precisão: ${acc}%`;
    }

    // Connect Reset Button
    const btnResetSim = document.getElementById('btn-reset-sim');
    if (btnResetSim) {
      btnResetSim.addEventListener('click', initSimulator);
    }

    // Connect DPI buttons
    const simDpiBtns = document.querySelectorAll('.dpi-btn');
    const dpiSensMultiplierEl = document.getElementById('dpi-sens-multiplier');

    simDpiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const dpi = parseInt(btn.getAttribute('data-dpi'), 10);
        currentDPI = dpi;
        sensMultiplier = dpiConfigs[dpi].mult;

        simDpiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (dpiSensMultiplierEl) {
          dpiSensMultiplierEl.textContent = dpiConfigs[dpi].label;
        }
      });
    });

    // Kickoff the loop
    initSimulator();
    requestAnimationFrame(drawSimulator);
  }


  /* ==========================================================================
     6. Setup bundle calculator (Better Together Combo Selector)
     ========================================================================== */
  const priceCatalog = {
    mouse: 199.00,
    keyboard: 290.00,
    mousepad: 79.00
  };

  const bundleState = {
    mouse: true, 
    keyboard: false,
    mousepad: false
  };

  const itemRows = {
    keyboard: document.getElementById('item-keyboard'),
    mousepad: document.getElementById('item-mousepad')
  };

  const summaryItemsList = document.getElementById('summary-items-list');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const comboDiscountPercent = document.getElementById('combo-discount-percent');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryTotal = document.getElementById('summary-total');

  function calculateBundlePrice() {
    if (!summarySubtotal) return;
    let subtotal = priceCatalog.mouse;
    let selectedCount = 1;

    if (bundleState.keyboard) {
      subtotal += priceCatalog.keyboard;
      selectedCount++;
    }
    if (bundleState.mousepad) {
      subtotal += priceCatalog.mousepad;
      selectedCount++;
    }

    let discountPercent = 0;
    if (selectedCount === 2) {
      discountPercent = 10;
    } else if (selectedCount === 3) {
      discountPercent = 15;
    }

    const discountAmount = subtotal * (discountPercent / 100);
    const finalPrice = subtotal - discountAmount;

    summarySubtotal.textContent = formatCurrency(subtotal);
    if (comboDiscountPercent) comboDiscountPercent.textContent = discountPercent;
    if (summaryDiscount) summaryDiscount.textContent = `- ${formatCurrency(discountAmount)}`;
    if (summaryTotal) summaryTotal.textContent = formatCurrency(finalPrice);

    updateSummaryList();
  }

  function updateSummaryList() {
    if (!summaryItemsList) return;
    summaryItemsList.innerHTML = '';
    
    addSummaryRow('Attack Shark X3 Mouse', priceCatalog.mouse);
    
    if (bundleState.keyboard) {
      addSummaryRow('Teclado Mecânico X68 HE', priceCatalog.keyboard);
    }
    if (bundleState.mousepad) {
      addSummaryRow('Mousepad eSport CM02', priceCatalog.mousepad);
    }
  }

  function addSummaryRow(name, price) {
    if (!summaryItemsList) return;
    const row = document.createElement('div');
    row.className = 'summary-item';
    row.innerHTML = `<span>${name}</span><span>${formatCurrency(price)}</span>`;
    summaryItemsList.appendChild(row);
  }

  if (itemRows.keyboard) {
    itemRows.keyboard.addEventListener('click', () => {
      bundleState.keyboard = !bundleState.keyboard;
      itemRows.keyboard.classList.toggle('selected', bundleState.keyboard);
      calculateBundlePrice();
    });
  }

  if (itemRows.mousepad) {
    itemRows.mousepad.addEventListener('click', () => {
      bundleState.mousepad = !bundleState.mousepad;
      itemRows.mousepad.classList.toggle('selected', bundleState.mousepad);
      calculateBundlePrice();
    });
  }

  calculateBundlePrice();

  // Buy bundle unifies into checkout cart
  const btnBuyCombo = document.getElementById('btn-buy-combo');
  if (btnBuyCombo) {
    btnBuyCombo.addEventListener('click', () => {
      // 1. Add current configured Mouse
      const mouseItem = {
        id: `mouse-x3-${productState.color}-${productState.gripTape}-${productState.ptfeSkates}`,
        type: 'mouse',
        name: 'Attack Shark X3 Mouse',
        color: productState.colorName,
        colorId: productState.color,
        gripTape: productState.gripTape,
        ptfeSkates: productState.ptfeSkates,
        price: getSingleProductPrice(),
        qty: productState.qty,
        thumb: productState.imageUrl
      };
      addToCartArray(mouseItem);

      // 2. Add extra Combo keyboard
      if (bundleState.keyboard) {
        const keyboardItem = {
          id: 'keyboard-x68-he',
          type: 'keyboard',
          name: 'Teclado Mecânico X68 HE',
          meta: 'Rapid Trigger Switch',
          price: priceCatalog.keyboard,
          qty: 1,
          thumb: 'https://attackshark.com/cdn/shop/files/1500_2_61c7f4f8-6a47-43cd-b218-4076475f1b64.jpg?v=1742623189&width=120'
        };
        addToCartArray(keyboardItem);
      }

      // 3. Add extra Combo mousepad
      if (bundleState.mousepad) {
        const mousepadItem = {
          id: 'mousepad-cm02',
          type: 'mousepad',
          name: 'Mousepad eSport CM02',
          meta: 'Superfície Speed (45x40cm)',
          price: priceCatalog.mousepad,
          qty: 1,
          thumb: 'https://attackshark.com/cdn/shop/files/0_1.jpg?v=1714117242&width=120'
        };
        addToCartArray(mousepadItem);
      }

      // 4. Open checkout drawer
      openCartDrawer();
    });
  }


  /* ==========================================================================
     7. Mobile-Friendly Draggable WhatsApp Floating Widget
     ========================================================================== */
  const waWidget = document.getElementById('whatsapp-draggable');
  const waAnchor = document.getElementById('whatsapp-link-anchor');

  if (waWidget && waAnchor) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let widgetX = 0;
    let widgetY = 0;
    let dragDistance = 0;

    // Default right/bottom positions initial setup
    waWidget.style.right = '40px';
    waWidget.style.bottom = '40px';

    function onDragStart(e) {
      isDragging = true;
      
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;
      dragDistance = 0;

      // Absolutize current offsets for smooth relative moves
      const rect = waWidget.getBoundingClientRect();
      widgetX = rect.left;
      widgetY = rect.top;
      
      waWidget.style.right = 'auto';
      waWidget.style.bottom = 'auto';
      waWidget.style.left = `${widgetX}px`;
      waWidget.style.top = `${widgetY}px`;

      waWidget.style.cursor = 'grabbing';
      
      if (e.type === 'mousedown') {
        e.preventDefault();
      }
    }

    function onDragMove(e) {
      if (!isDragging) return;

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      // Euclidean distance of dragging displacement
      dragDistance = Math.hypot(clientX - startX, clientY - startY);

      let newX = widgetX + deltaX;
      let newY = widgetY + deltaY;

      // Boundaries Clamps (ensuring widget never moves off visible page space)
      const widgetWidth = waWidget.offsetWidth;
      const widgetHeight = waWidget.offsetHeight;

      newX = Math.max(10, Math.min(window.innerWidth - widgetWidth - 10, newX));
      newY = Math.max(10, Math.min(window.innerHeight - widgetHeight - 10, newY));

      waWidget.style.left = `${newX}px`;
      waWidget.style.top = `${newY}px`;
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      waWidget.style.cursor = 'pointer';

      // Click vs Drag logic: redirect on WhatsApp only if user clicked instead of dragging
      if (dragDistance < 6) {
        const url = waAnchor.getAttribute('href');
        window.open(url, '_blank');
      }
    }

    // Bind mouse events
    waWidget.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    // Bind tactile events
    waWidget.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd, { passive: true });
  }


  /* ==========================================================================
     8. UTILITIES & NEWSLETTER
     ========================================================================== */
  function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterMsg = document.getElementById('newsletter-msg');

  if (newsletterForm && newsletterEmail && newsletterMsg) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (newsletterEmail.value.trim() !== '') {
        newsletterMsg.style.display = 'block';
        newsletterEmail.value = '';
        setTimeout(() => {
          newsletterMsg.style.display = 'none';
        }, 4000);
      }
    });
  }

});
