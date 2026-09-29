const { layout, escapeHtml } = require('./layout');

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// Evita o Date(string) padrão: ele interpreta "AAAA-MM-DD" como UTC meia-noite
// e, em fusos negativos, exibe o dia anterior. Aqui o dia sempre bate com o
// frontmatter, independente do fuso do ambiente de build.
function formatDate(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return `${String(day).padStart(2, '0')} de ${MONTHS_PT[month - 1]} de ${year}`;
}

function renderIndex({ config, posts }) {
  const items = posts
    .map(
      (post) => `  <article class="post-card">
    <h2><a href="${escapeHtml(post.slug)}/">${escapeHtml(post.title)}</a></h2>
    <p class="post-meta">${formatDate(post.date)}</p>
    <p class="post-excerpt">${escapeHtml(post.description)}</p>
    <a class="read-more" href="${escapeHtml(post.slug)}/">Ler post &rarr;</a>
  </article>`
    )
    .join('\n');

  const bodyHtml = `<section class="hero">
  <h1>${escapeHtml(config.siteName)}</h1>
  <p>${escapeHtml(config.siteDescription)}</p>
</section>
<section class="post-list">
${items || '  <p>Ainda não há posts publicados.</p>'}
</section>`;

  return layout({
    title: `${config.siteName} | Ecovia`,
    description: config.siteDescription,
    canonical: `${config.siteUrl}/`,
    bodyHtml,
    cssHref: 'css/style.css',
    jsHref: 'js/consent-1.js',
    homeHref: './',
  });
}

module.exports = { renderIndex, formatDate };
