import { initI18n } from './i18n.js';
import { initCart } from './cart.js';
import { initSearch } from './search.js';
import { initForms } from './forms.js';

﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿const hideLoader = () => {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader && !pageLoader.classList.contains('hidden')) {
        pageLoader.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
            pageLoader.classList.add('hidden');
        }, 500);
    }
};

// Ocultar el loader cuando la página haya cargado completamente
window.addEventListener('load', hideLoader);

// Fallback de seguridad (3s): Ocultar el loader si una imagen o script externo tarda demasiado
setTimeout(hideLoader, 3000);

// --- MEJORA: Animación de Transición de Página ---
// Manejar el botón "Atrás" del navegador (BFCache) para asegurar que el loader no se quede atascado
window.addEventListener('pageshow', (event) => {
    if (event.persisted) hideLoader();
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    
    // Ignorar enlaces externos, anclas (#), correos, teléfonos o descargas
    if (
        link.target === '_blank' ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.hasAttribute('download')
    ) return;

    // Ignorar si el enlace lleva a otro dominio o es la misma página exacta
    try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    } catch (err) { return; }

    e.preventDefault();

    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        pageLoader.classList.remove('hidden');
        // requestAnimationFrame asegura que la clase 'hidden' se haya quitado antes de animar
        requestAnimationFrame(() => pageLoader.classList.remove('opacity-0', 'pointer-events-none'));
        setTimeout(() => window.location.href = href, 400); // 400ms para que la animación termine fluidamente
    } else {
        window.location.href = href;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- SISTEMA DINÁMICO DE COMPONENTES (Modo Desarrollo) ---
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        try {
            const res = await fetch('header.html');
            if(res.ok) headerPlaceholder.outerHTML = await res.text();
        } catch (e) { console.error('Error al cargar la cabecera:', e); }
    }

    if (footerPlaceholder) {
        try {
            const res = await fetch('footer.html');
            if(res.ok) footerPlaceholder.outerHTML = await res.text();
        } catch (e) { console.error('Error al cargar el pie de página:', e); }
    }

    initI18n();

    // Auto-Resaltar el enlace de la página activa en la cabecera
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');
    
    [...navLinks, ...mobileNavLinks].forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('text-accent', 'font-medium');
            link.classList.remove('text-gray-800', 'dark:text-gray-200');
        } else {
            link.classList.remove('text-accent', 'font-medium');
            link.classList.add('text-gray-800', 'dark:text-gray-200'); // Estilo inactivo
        }
    });

    // --- MEJORA: Custom Scrollbar Global ---
    const scrollbarStyle = document.createElement('style');
    scrollbarStyle.innerHTML = `
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: #f02e8540; /* Color accent con transparencia */
            border-radius: 20px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: #f02e85; /* Color accent puro */
        }
    `;
    document.head.appendChild(scrollbarStyle);

    // Selección de elementos
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleBtn = document.getElementById('theme-toggle');

    if (themeToggleBtn) {
        // Mostrar el icono correcto al cargar la página según el tema actual
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeToggleLightIcon?.classList.remove('hidden');
        } else {
            themeToggleDarkIcon?.classList.remove('hidden');
        }

        // Evento de clic en el botón para alternar el tema
        themeToggleBtn.addEventListener('click', function() {
            // Alternar la visibilidad de los iconos
            themeToggleDarkIcon?.classList.toggle('hidden');
            themeToggleLightIcon?.classList.toggle('hidden');

            // Lógica de cambio de tema
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        });
    }

    // Lógica del Banner Promocional
    const promoBanner = document.getElementById('promo-banner');
    const closePromoBtn = document.getElementById('close-promo-btn');

    if (promoBanner && closePromoBtn) {
        if (sessionStorage.getItem('promo-banner-closed')) {
            promoBanner.style.display = 'none';
        }

        closePromoBtn.addEventListener('click', () => {
            promoBanner.style.height = promoBanner.offsetHeight + 'px';
            promoBanner.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                promoBanner.style.transition = 'height 0.3s ease, padding 0.3s ease, opacity 0.3s ease';
                promoBanner.style.height = '0px';
                promoBanner.style.paddingTop = '0px';
                promoBanner.style.paddingBottom = '0px';
                promoBanner.style.opacity = '0';
            });

            setTimeout(() => {
                promoBanner.style.display = 'none';
            }, 300);
            
            sessionStorage.setItem('promo-banner-closed', 'true');
        });
    }

    // Actualizar el año dinámico en el footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    initCart();

    initSearch();

    // Lógica del menú móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.toggle('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('flex');
            } else {
                mobileMenu.classList.add('flex');
            }
            
            // Actualizar ARIA para accesibilidad
            mobileMenuBtn.setAttribute('aria-expanded', !isHidden);
            
            // Cambiar el icono (barras <-> cruz)
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
        });

        // MEJORA UX: Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.click();
            }
        });
    }

    // MEJORA UX: Soporte para tecla Escape global (Menús, Popups, Carrito)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenuBtn.click();
            
            const cartModal = document.getElementById('cart-modal');
            const closeCartBtn = document.getElementById('close-cart-modal');
            if (cartModal && !cartModal.classList.contains('hidden') && closeCartBtn) closeCartBtn.click();
            
            const exitModal = document.getElementById('exit-intent-modal');
            const closeExitBtn = document.getElementById('close-exit-modal');
            if (exitModal && !exitModal.classList.contains('hidden') && closeExitBtn) closeExitBtn.click();
            
            const newsletterPopup = document.getElementById('newsletter-popup-modal');
            const closeNewsletterBtn = document.getElementById('close-newsletter-popup');
            if (newsletterPopup && !newsletterPopup.classList.contains('hidden') && closeNewsletterBtn) closeNewsletterBtn.click();
        }
    });

    // Lógica del Acordeón (Preguntas Frecuentes)
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('i');

            // Cerrar todos los demás acordeones abiertos
            faqBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherBtn.nextElementSibling.classList.add('hidden');
                    otherBtn.querySelector('i').classList.remove('rotate-180');
                }
            });

            // Alternar el estado del acordeón clickeado
            const isHidden = content.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', !isHidden);

            icon.classList.toggle('rotate-180');
        });
    });

    // Lógica del Tooltip de WhatsApp
    const waTooltip = document.getElementById('wa-tooltip');
    const closeWaTooltipBtn = document.getElementById('close-wa-tooltip');

    if (waTooltip && closeWaTooltipBtn) {
        let waAutoCloseTimeout;
        // Si el usuario no lo ha cerrado en esta sesión, lo mostramos
        if (!sessionStorage.getItem('wa-tooltip-closed')) {
            setTimeout(() => {
                waTooltip.classList.remove('hidden');
                // Pequeño retraso para permitir que CSS renderice antes de iniciar la animación de escala
                setTimeout(() => {
                    waTooltip.classList.remove('scale-0', 'opacity-0');
                    waTooltip.classList.add('scale-100', 'opacity-100');
                    
                    // UX: Auto-ocultar el tooltip después de 8 segundos para no bloquear la pantalla
                    waAutoCloseTimeout = setTimeout(() => {
                        closeWaTooltipBtn.click();
                    }, 8000);
                }, 50);
            }, 1000); // Aparece 1 segundo después de cargar la página
        }

        // Ocultar el tooltip y guardar en sessionStorage
        closeWaTooltipBtn.addEventListener('click', () => {
            if (waAutoCloseTimeout) clearTimeout(waAutoCloseTimeout);
            waTooltip.classList.remove('scale-100', 'opacity-100');
            waTooltip.classList.add('scale-0', 'opacity-0');
            setTimeout(() => {
                waTooltip.classList.add('hidden');
            }, 300); // Esperamos que termine la transición CSS antes de ocultarlo del todo
            sessionStorage.setItem('wa-tooltip-closed', 'true');
        });
    }

    initForms();

    // --- MEJORAS DE EXPERIENCIA (UX) ---

    // 1. Animaciones fluidas al hacer Scroll (Reveal)
    const revealElements = document.querySelectorAll('.reveal');
    let staggerDelay = 0;
    let staggerTimeout = null;

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, staggerDelay);
                
                staggerDelay += 150; // Incrementar el retraso escalonado
                observer.unobserve(entry.target); // Solo animamos la primera vez que entra en pantalla
            }
        });
        
        // Reiniciar el contador tras procesar el grupo actual
        clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
            staggerDelay = 0;
        }, 100);
    }, {
        root: null,
        threshold: 0.10, // Se activa cuando el 10% del elemento es visible
        rootMargin: "0px 0px -50px 0px" // Pequeño margen para un efecto más natural
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Efecto de Sombra Dinámica en el Navbar al hacer scroll
    const header = document.querySelector('header');

    // 3. Efecto Parallax en la cabecera (Hero)
    const heroContent = document.getElementById('hero-content');
    const parallaxBg1 = document.getElementById('parallax-bg-1');
    const parallaxBg2 = document.getElementById('parallax-bg-2');

    // --- Efecto de Máquina de Escribir (Typewriter) ---
    const typewriterEl = document.getElementById('typewriter-text');
    if (typewriterEl) {
        const textToType = "siguiente nivel.";
        let typeIndex = 0;
        
        const typeWriter = () => {
            if (typeIndex < textToType.length) {
                typewriterEl.textContent += textToType.charAt(typeIndex);
                typeIndex++;
                setTimeout(typeWriter, 120); // Velocidad de escritura en milisegundos
            } else {
                // Ocultar el cursor 4 segundos después de terminar de escribir
                const cursor = document.getElementById('typewriter-cursor');
                if (cursor) setTimeout(() => cursor.style.display = 'none', 4000);
            }
        };
        
        // Esperar 800ms para que termine la animación de entrada inicial (fade-in-up)
        setTimeout(typeWriter, 800);
    }

    // 4. Botón "Subir arriba"
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 5. Efecto Ripple (Onda expansiva) en botones

    document.addEventListener('click', function(e) {
        // Buscar si el elemento clickeado es un botón o enlace con forma de botón
        const target = e.target.closest('button, .bg-accent, .add-to-cart-btn, a.rounded-full');
        if (!target) return;

        // Asegurarnos de que el botón recorta la onda y permite el posicionamiento absoluto
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.position === 'static') {
            target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        // Calcular el diámetro necesario para cubrir todo el botón
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${e.clientX - rect.left - radius}px`;
        ripple.style.top = `${e.clientY - rect.top - radius}px`;
        ripple.classList.add('ripple-effect');

        // Si el botón NO es de color principal (Rosa o el verde de WhatsApp), usamos onda oscura
        if (!target.classList.contains('bg-accent') && !target.classList.contains('bg-[#25D366]')) {
            ripple.classList.add('ripple-dark');
        }

        // Limpiar animaciones previas en caso de clics muy rápidos
        const existingRipple = target.querySelector('.ripple-effect');
        if (existingRipple) existingRipple.remove();

        target.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600); // Coincide con la duración de la animación en CSS
    });

    // 6. Barra de progreso de lectura (Scroll) - Solo para artículos del blog
    const isBlogPost = document.querySelector('.enable-reading-mode') !== null;
    let progressBar = null;
    
    if (isBlogPost) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress-bar';
        progressBar.className = 'fixed top-0 left-0 h-1.5 bg-gradient-to-r from-accent to-magenta-500 z-[60] transition-all duration-150 origin-left pointer-events-none shadow-sm';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);
    }

    // Variables para el Smart Header y Caché de Layout (Prevención de Layout Thrashing)
    let lastScrollY = window.scrollY;
    let cachedWindowHeight = window.innerHeight;
    let cachedScrollHeight = document.documentElement.scrollHeight - cachedWindowHeight;

    // Actualizamos la caché solo cuando la ventana cambia de tamaño
    window.addEventListener('resize', () => {
        cachedWindowHeight = window.innerHeight;
        cachedScrollHeight = document.documentElement.scrollHeight - cachedWindowHeight;
    }, { passive: true });

    if (header) {
        header.style.transition = 'transform 0.3s ease-in-out, background-color 0.3s, border-color 0.3s';
    }

    // Gestor Unificado de Eventos Scroll (Rendimiento optimizado con requestAnimationFrame)
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY || document.documentElement.scrollTop;
                
                // --- MEJORA: Smart Header ---
                if (header) {
                    // Evitar ocultar el header en la parte más alta de la página (efecto rebote en Mac)
                    if (scrollY > 150) {
                        if (scrollY > lastScrollY) {
                            // Scroll hacia abajo: Ocultar
                            header.style.transform = 'translateY(-100%)';
                        } else {
                            // Scroll hacia arriba: Mostrar
                            header.style.transform = 'translateY(0)';
                        }
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                    lastScrollY = scrollY;
                }

                // Sombra del Navbar
                if (header) {
                    const navContainer = document.getElementById('navbar-container');
                    const navBg = document.getElementById('navbar-bg');
                    
                    if (scrollY > 20) {
                        header.classList.add('shadow-md', 'dark:shadow-brand-dark/50');
                        if (navContainer) { navContainer.classList.replace('h-20', 'h-16'); }
                        if (navBg) { 
                            navBg.classList.replace('bg-brand-light/60', 'bg-brand-light/95');
                            navBg.classList.replace('dark:bg-black/60', 'dark:bg-black/95');
                            navBg.classList.replace('border-transparent', 'border-gray-200');
                            if(!navBg.classList.contains('dark:border-brand-dark')) navBg.classList.add('dark:border-brand-dark');
                        }
                    } else {
                        header.classList.remove('shadow-md', 'dark:shadow-brand-dark/50');
                        if (navContainer) { navContainer.classList.replace('h-16', 'h-20'); }
                        if (navBg) {
                            navBg.classList.replace('bg-brand-light/95', 'bg-brand-light/60');
                            navBg.classList.replace('dark:bg-black/95', 'dark:bg-black/60');
                            navBg.classList.replace('border-gray-200', 'border-transparent');
                            navBg.classList.remove('dark:border-brand-dark');
                        }
                    }
                }

                // Parallax Hero
                if (heroContent && scrollY < cachedWindowHeight) {
                    heroContent.style.transform = `translateY(${scrollY * 0.4}px)`;
                    heroContent.style.opacity = Math.max(1 - (scrollY / 600), 0);
                    if (parallaxBg1) parallaxBg1.style.transform = `translateY(${scrollY * 0.6}px) translateX(${scrollY * 0.1}px)`;
                    if (parallaxBg2) parallaxBg2.style.transform = `translateY(${scrollY * 0.2}px) translateX(${scrollY * -0.1}px)`;
                }

                // Botón Subir arriba
                if (scrollToTopBtn) {
                    if (scrollY > 500) {
                        scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
                        scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
                    } else {
                        scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
                        scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
                    }
                }

                // Barra de progreso de lectura
                if (progressBar) {
                    const scrollPercentage = cachedScrollHeight > 0 ? (scrollY / cachedScrollHeight) * 100 : 0;
                    progressBar.style.width = `${scrollPercentage}%`;
                }

                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // 7. Modo de Lectura (Preparación para futuros artículos del blog)
    const readingModeStyle = document.createElement('style');
    readingModeStyle.innerHTML = `
        body.reading-mode header,
        body.reading-mode footer,
        body.reading-mode .hide-in-reading-mode {
            display: none !important;
        }
        body.reading-mode main {
            padding-top: 4rem !important;
            max-width: 800px;
            margin: 0 auto;
            transition: max-width 0.5s ease, padding 0.5s ease;
        }
        body.reading-mode article {
            grid-column: 1 / -1 !important;
        }
        #exit-reading-mode-btn {
            display: none;
        }
        body.reading-mode #exit-reading-mode-btn {
            display: flex;
            animation: fadeInUp 0.4s ease-out forwards;
        }
    `;
    document.head.appendChild(readingModeStyle);

    // Crear el botón de "Salir del modo lectura" dinámicamente
    const exitReadingBtn = document.createElement('button');
    exitReadingBtn.id = 'exit-reading-mode-btn';
    exitReadingBtn.className = 'fixed top-6 right-6 z-[100] bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-5 py-2.5 rounded-full shadow-2xl items-center gap-2 font-poppins text-sm font-medium hover:scale-105 transition-transform active:scale-95 cursor-pointer';
    exitReadingBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Salir de lectura';
    document.body.appendChild(exitReadingBtn);

    // Escuchar cualquier clic futuro en elementos que activen el modo lectura
    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.enable-reading-mode');
        if (toggleBtn) {
            e.preventDefault();
            document.body.classList.add('reading-mode');
            
            // Ocultar WhatsApp durante la lectura de forma limpia
            const waWidget = document.querySelector('.fa-whatsapp')?.closest('.fixed');
            if (waWidget) waWidget.style.display = 'none';
        }
    });

    // Restaurar el diseño web normal al salir
    exitReadingBtn.addEventListener('click', () => {
        document.body.classList.remove('reading-mode');
        const waWidget = document.querySelector('.fa-whatsapp')?.closest('.fixed');
        if (waWidget) waWidget.style.display = '';
    });

    // --- MEJORA: Exit Intent Popup ---
    const exitIntentModal = document.getElementById('exit-intent-modal');
    const closeExitModalBtn = document.getElementById('close-exit-modal');
    
    if (exitIntentModal) {
        // Evento que detecta cuando el ratón sale del viewport por arriba
        const mouseOutHandler = (e) => {
            if (e.clientY < 20 && !sessionStorage.getItem('exit-intent-shown')) {
                exitIntentModal.classList.remove('hidden');
                exitIntentModal.classList.add('flex');
                // Pequeño delay para la animación
                setTimeout(() => {
                    exitIntentModal.classList.remove('opacity-0');
                    const modalInner = exitIntentModal.querySelector('div');
                    if (modalInner) {
                        modalInner.classList.remove('scale-95');
                        modalInner.classList.add('scale-100');
                    }
                }, 10);
                
                sessionStorage.setItem('exit-intent-shown', 'true'); // No molestar más en esta sesión
                document.removeEventListener('mouseout', mouseOutHandler); // Eliminar el listener
            }
        };

        document.addEventListener('mouseout', mouseOutHandler);

        // Cerrar modal
        if (closeExitModalBtn) {
            closeExitModalBtn.addEventListener('click', () => {
                exitIntentModal.classList.add('opacity-0');
                setTimeout(() => { exitIntentModal.classList.remove('flex'); exitIntentModal.classList.add('hidden'); }, 300);
            });
        }
    }

    // --- MEJORA: Pop-up de Bienvenida (Newsletter) ---
    const newsletterPopupModal = document.getElementById('newsletter-popup-modal');
    const closeNewsletterPopupBtn = document.getElementById('close-newsletter-popup');

    if (newsletterPopupModal && closeNewsletterPopupBtn) {
        // Mostrar solo si no existe la marca en el navegador
        if (!localStorage.getItem('newsletter-popup-shown')) {
            setTimeout(() => {
                newsletterPopupModal.classList.remove('hidden');
                newsletterPopupModal.classList.add('flex');
                setTimeout(() => {
                    newsletterPopupModal.classList.remove('opacity-0');
                    const modalInner = newsletterPopupModal.querySelector('div');
                    if (modalInner) {
                        modalInner.classList.remove('scale-95');
                        modalInner.classList.add('scale-100');
                    }
                }, 10);
                localStorage.setItem('newsletter-popup-shown', 'true');
            }, 5000); // 5000ms = 5 segundos de retraso
        }

        const closeNewsletterPopup = () => {
            newsletterPopupModal.classList.add('opacity-0');
            const modalInner = newsletterPopupModal.querySelector('div');
            if (modalInner) {
                modalInner.classList.remove('scale-100');
                modalInner.classList.add('scale-95');
            }
            setTimeout(() => { newsletterPopupModal.classList.remove('flex'); newsletterPopupModal.classList.add('hidden'); }, 300);
        };

        closeNewsletterPopupBtn.addEventListener('click', closeNewsletterPopup);
        newsletterPopupModal.addEventListener('click', (e) => {
            if (e.target === newsletterPopupModal) closeNewsletterPopup();
        });
    }

    // --- 8. Tabla de Contenidos Automática (ToC) para el Blog ---
    const tocContainers = document.querySelectorAll('.toc-container');
    const articleBody = document.querySelector('article .text-lg.leading-relaxed');
    
    if (tocContainers.length > 0 && articleBody) {
        const headings = articleBody.querySelectorAll('h2, h3');
        
        if (headings.length > 0) {
            tocContainers.forEach(container => {
                container.classList.remove('hidden'); // Mostrar el contenedor
                const nav = container.querySelector('.toc-nav');
                if (!nav) return;
                
                const ul = document.createElement('ul');
                ul.className = 'space-y-3';
                
                headings.forEach((heading, index) => {
                    if (!heading.id) {
                        const baseId = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        heading.id = `${baseId}-${index}`;
                    }
                    
                    // Añadimos margen superior para que el navbar fijo no tape el título
                    heading.classList.add('scroll-mt-28');
                    
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `#${heading.id}`;
                    a.className = 'text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors flex items-start';
                    
                    if (heading.tagName.toLowerCase() === 'h3') {
                        li.classList.add('ml-6');
                        a.innerHTML = `<span class="text-accent/50 mr-2">-</span> <span>${heading.textContent}</span>`;
                        a.classList.add('text-sm');
                    } else {
                        a.innerHTML = `<i class="fa-solid fa-angle-right text-accent/50 mt-1.5 mr-2 text-xs"></i> <span class="font-medium">${heading.textContent}</span>`;
                    }
                    
                    li.appendChild(a);
                    ul.appendChild(li);
                });
                
                nav.appendChild(ul);
            });
        }
    }
});