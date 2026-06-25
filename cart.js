export function initCart() {
    // Lógica del carrito de compras (Solo para la tienda)
    const cartCounter = document.getElementById('cart-counter');
    const emptyCartBtn = document.getElementById('empty-cart-btn');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn');
    const closeCartModalBtn = document.getElementById('close-cart-modal');
    const cartContainer = document.getElementById('cart-items-container');

    if (cartCounter) {
        // Prevenir errores fatales si el JSON de localStorage está corrupto
        let cartItems = [];
        try {
            cartItems = JSON.parse(localStorage.getItem('cart-items')) || [];
        } catch (error) {
            console.error('Error al leer el carrito del localStorage:', error);
            cartItems = [];
        }

        // Función de seguridad para escapar caracteres HTML y prevenir XSS
        const escapeHTML = (str) => {
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag));
        };

        const renderCartModal = () => {
            const totalEl = document.getElementById('cart-total');
            if (!cartContainer || !totalEl) return;

            let total = 0;

            if (cartItems.length === 0) {
                cartContainer.innerHTML = '<div class="text-center py-8"><i class="fa-solid fa-basket-shopping text-4xl text-gray-300 dark:text-brand-dark mb-3"></i><p class="text-gray-500 dark:text-gray-400">Tu carrito está vacío.</p></div>';
            } else {
                const htmlItems = cartItems.map((item, index) => {
                    total += item.price;
                    return `
                        <div class="flex justify-between items-center bg-white dark:bg-brand-darker p-4 rounded-xl border border-gray-100 dark:border-brand-dark shadow-sm">
                            <div class="flex-grow pr-4">
                                <h4 class="font-bold text-sm text-gray-800 dark:text-white line-clamp-1">${escapeHTML(item.title)}</h4>
                                <span class="text-accent font-bold text-sm">$${item.price.toFixed(2)}</span>
                            </div>
                            <button class="remove-item-btn text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" data-index="${index}">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
                }).join('');
                cartContainer.innerHTML = htmlItems;
            }
            totalEl.textContent = `$${total.toFixed(2)}`;
        };

        // Delegación de eventos para eliminar items del carrito
        if (cartContainer) {
            cartContainer.addEventListener('click', (e) => {
                const removeBtn = e.target.closest('.remove-item-btn');
                if (removeBtn) {
                    const idx = removeBtn.getAttribute('data-index');
                    cartItems.splice(idx, 1);
                    updateCartUI();
                }
            });
        }

        const updateCartUI = () => {
            cartCounter.textContent = cartItems.length;
            if (cartItems.length > 0) {
                cartCounter.classList.remove('scale-0');
                cartCounter.classList.add('scale-100');
                if (emptyCartBtn) emptyCartBtn.classList.remove('hidden');
            } else {
                cartCounter.classList.remove('scale-100');
                cartCounter.classList.add('scale-0');
                if (emptyCartBtn) emptyCartBtn.classList.add('hidden');
            }
            localStorage.setItem('cart-items', JSON.stringify(cartItems));
            renderCartModal();
        };

        updateCartUI(); // Inicializar estado visual

        let audioCtx = null;
        const playPopSound = () => {
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
            } catch (e) { console.log('Audio no soportado'); }
        };

        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.product-card');
                const title = card.querySelector('h3').textContent;
                const priceText = card.querySelector('.text-2xl.font-bold').textContent;
                const price = parseFloat(priceText.replace('$', ''));
                cartItems.push({ title, price });
                updateCartUI();
                playPopSound();
                cartCounter.classList.add('scale-125');
                setTimeout(() => cartCounter.classList.remove('scale-125'), 200);
                openCartModal();
            });
        });

        if (emptyCartBtn) emptyCartBtn.addEventListener('click', () => { cartItems = []; updateCartUI(); });

        const openCartModal = () => {
            if (!cartModal) return;
            cartModal.classList.remove('hidden');
            cartModal.classList.add('flex');
            setTimeout(() => {
                cartModal.classList.remove('opacity-0');
                cartModal.querySelector('div').classList.remove('scale-95');
                cartModal.querySelector('div').classList.add('scale-100');
            }, 10);
        };

        const closeCartModal = () => {
            if (!cartModal) return;
            cartModal.classList.add('opacity-0');
            cartModal.querySelector('div').classList.remove('scale-100');
            cartModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => { cartModal.classList.remove('flex'); cartModal.classList.add('hidden'); }, 300);
        };

        if (cartBtn) cartBtn.addEventListener('click', openCartModal);
        if (closeCartModalBtn) closeCartModalBtn.addEventListener('click', closeCartModal);
        if (cartModal) cartModal.addEventListener('click', (e) => { if (e.target === cartModal) closeCartModal(); });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cartItems.length === 0) return;
                const originalText = checkoutBtn.innerHTML;
                checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Conectando con MercadoPago...';
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('opacity-75', 'cursor-not-allowed');
                setTimeout(() => {
                    const total = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);
                    alert(`🛍️ ¡Simulación de Checkout!\n\nEn un entorno real, para cobrar un carrito dinámico ($${total}) debes integrar la API de Preferencias (Checkout Pro) de MercadoPago aquí.`);
                    cartItems = [];
                    updateCartUI();
                    closeCartModal();
                    checkoutBtn.innerHTML = originalText;
                    checkoutBtn.disabled = false;
                    checkoutBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                }, 1500);
            });
        }
    }
}