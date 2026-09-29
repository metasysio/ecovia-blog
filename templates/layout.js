function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// `cssHref`/`homeHref` são caminhos relativos (sem barra inicial) para que o
// site funcione tanto em https://ecovia.ai/blog/... (via rewrite do Netlify)
// quanto no domínio netlify.app usado para preview/deploy.
function layout({
  title,
  description,
  canonical,
  bodyHtml,
  cssHref,
  homeHref,
  ogImage,
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">\n` : ''}<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${escapeHtml(cssHref)}">
</head>
<body>
<header class="site-header">
  <a class="brand" href="${escapeHtml(homeHref)}">Blog do <span>Ecovia</span></a>
  <nav class="site-nav">
    <a href="https://ecovia.ai/">Site do Ecovia</a>
  </nav>
</header>
<main>
${bodyHtml}
</main>
<footer class="site-footer">
  <p>Ecovia — software de gestão de caçambas com IA para locadoras.</p>
</footer>
</body>
</html>
`;
}

module.exports = { layout, escapeHtml };
