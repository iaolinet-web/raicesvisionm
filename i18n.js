export function initI18n() {
    // --- SISTEMA DE MULTILENGUAJE (i18n) ---
    const translations = {
        es: {
            "nav.home": "Inicio",
            "nav.about": "Sobre Mí",
            "nav.courses": "Cursos",
            "nav.blog": "Blog",
            "nav.shop": "Tienda",
            "nav.memberships": "Membresías",
            "nav.contact": "Contacto"
        },
        en: {
            "nav.home": "Home",
            "nav.about": "About Me",
            "nav.courses": "Courses",
            "nav.blog": "Blog",
            "nav.shop": "Shop",
            "nav.memberships": "Memberships",
            "nav.contact": "Contact"
        }
    };

    let currentLang = localStorage.getItem('app-lang') || 'es';

    const applyTranslations = (lang) => {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        document.documentElement.lang = lang; // Para SEO y lectores de pantalla
        const langText = document.getElementById('current-lang-text');
        if (langText) langText.textContent = lang.toUpperCase();
    };

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('app-lang', currentLang);
            applyTranslations(currentLang);
        });
    }
    
    applyTranslations(currentLang); // Ejecutar al cargar la página
}