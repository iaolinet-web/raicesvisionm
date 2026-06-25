const fs = require('fs');
const path = require('path');
const { minify: minifyHtml } = require('html-minifier-terser');
const { minify: minifyJs } = require('terser');

// 1. Configuración SEO Centralizada (Single Source of Truth)
const seoConfig = {
    'index.html': {
        title: 'Linet Coaching | Estrategia y Claridad',
        description: 'Estrategias directas, resultados reales. Potencia tu visión con un enfoque ejecutivo y un acompañamiento diseñado para destacar.'
    },
    'sobre-mi.html': {
        title: 'Sobre Mí | Linet Coaching',
        description: 'Conoce a Linet, coach ejecutiva y mentora de liderazgo. Descubre su historia y metodología para ayudarte a alcanzar tu máximo potencial.'
    },
    'cursos.html': {
        title: 'Cursos Intensivos | Linet Coaching',
        description: 'Fórmate en 2 meses: Reiki, Tarot, Registros Akáshicos, Astrología y Liderazgo con herramientas prácticas y transformadoras.'
    },
    'shop.html': {
        title: 'Tienda | Linet Coaching',
        description: 'Descubre la tienda oficial de Linet Coaching. Encuentra recursos, herramientas, ebooks y cursos digitales diseñados para tu crecimiento.'
    },
    'blog.html': {
        title: 'Blog | Linet Coaching',
        description: 'Artículos, recursos y reflexiones sobre liderazgo femenino, mentalidad y crecimiento corporativo.'
    },
    'contacto.html': {
        title: 'Contacto | Linet Coaching',
        description: '¿Tienes dudas o quieres empezar tu proceso de transformación? Contacta con Linet Coaching y da el primer paso hacia tu crecimiento.'
    },
    'membresias.html': {
        title: 'Membresías | Linet Coaching',
        description: 'Descubre al detalle nuestros planes de membresía. Compara opciones y elige la ruta que mejor se adapte a tus metas profesionales.'
    }
};

// 1. Crear directorio de salida (dist) donde irá la web final
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 2. Leer los componentes comunes
const header = fs.readFileSync(path.join(__dirname, 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(__dirname, 'footer.html'), 'utf8');

// 3. Buscar todos los archivos HTML (excepto los componentes)
const files = fs.readdirSync(__dirname).filter(file => 
    file.endsWith('.html') && 
    !['header.html', 'footer.html'].includes(file) && 
    !file.startsWith('dist')
);

// 4. Inyectar el HTML y guardar en la carpeta /dist
(async () => {
    for (const file of files) {
        let content = fs.readFileSync(path.join(__dirname, file), 'utf8');
        
        // Inyectar SEO dinámicamente si la página está en la configuración
        if (seoConfig[file]) {
            const { title, description } = seoConfig[file];
            
            // Actualizar <title>
            content = content.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            
            // Actualizar Meta Description
            content = content.replace(/<meta\s+name="description"\s+content="[^"]*">/, `<meta name="description" content="${description}">`);
            
            // Actualizar Open Graph (OG) para cuando se comparta en WhatsApp/LinkedIn
            content = content.replace(/<meta\s+property="og:title"\s+content="[^"]*">/, `<meta property="og:title" content="${title}">`);
            content = content.replace(/<meta\s+property="og:description"\s+content="[^"]*">/, `<meta property="og:description" content="${description}">`);
        }

        // Reemplazar los divs contenedores por el contenido real
        content = content.replace('<div id="header-placeholder"></div>', header);
        content = content.replace('<div id="footer-placeholder"></div>', footer);
        
        // Convertir dinámicamente referencias de imágenes locales a WebP en el HTML
        content = content.replace(/(["'])(?!http:\/\/|https:\/\/|data:)([^"']+\.)(jpg|jpeg|png)\1/gi, '$1$2webp$1');

        // Minificar el HTML resultante
        content = await minifyHtml(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
            removeRedundantAttributes: true
        });

        fs.writeFileSync(path.join(distDir, file), content);
        console.log(`✅ Construido y Minificado: ${file}`);
    }
})();

// 5. Copiar imágenes, íconos y scripts necesarios
const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.webp', '.js'];
const assets = fs.readdirSync(__dirname).filter(file => 
    assetExtensions.includes(path.extname(file).toLowerCase()) &&
    file !== 'build.js' && 
    file !== 'tailwind.config.js'
);

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// Usamos una función asíncrona para procesar las imágenes sin bloquear el hilo principal
(async () => {
    for (const asset of assets) {
        const ext = path.extname(asset).toLowerCase();
        const srcPath = path.join(__dirname, asset);
        const destPath = path.join(distDir, asset);

        if (asset.includes('apple-touch-icon') || asset.includes('favicon')) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`📦 Copiado (Icono Nativo): ${asset}`);
        } else if (imageExtensions.includes(ext)) {
            const baseName = path.basename(asset, ext);
            const webpDestPath = path.join(distDir, `${baseName}.webp`);
            
            await sharp(srcPath).webp({ quality: 80 }).toFile(webpDestPath);
            console.log(`🖼️  Convertido a WebP: ${asset} -> ${baseName}.webp`);
        } else if (ext === '.js') {
            const jsContent = fs.readFileSync(srcPath, 'utf8');
            const minifiedJs = await minifyJs(jsContent);
            fs.writeFileSync(destPath, minifiedJs.code);
            console.log(`📦 Minificado y Copiado (JS): ${asset}`);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`📦 Copiado: ${asset}`);
        }
    }
})();

// 6. Generar Sitemap.xml automáticamente para mejorar la indexación en Google
const baseUrl = 'https://www.linetcoaching.com';
let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

files.forEach(file => {
    // Ignorar páginas que no aportan al SEO
    if (['404.html', 'privacidad.html', 'cookies.html', 'aviso-legal.html'].includes(file)) return;
    
    // La página principal apunta a la raíz '/'
    const urlPath = file === 'index.html' ? '' : file;
    const priority = file === 'index.html' ? '1.0' : (file === 'membresias.html' || file === 'shop.html' ? '0.9' : '0.8');
    
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${baseUrl}/${urlPath}</loc>\n`;
    sitemapContent += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    sitemapContent += `    <changefreq>monthly</changefreq>\n`;
    sitemapContent += `    <priority>${priority}</priority>\n`;
    sitemapContent += `  </url>\n`;
});

sitemapContent += `</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
console.log(`🗺️  Generado: sitemap.xml (SEO Automático)`);