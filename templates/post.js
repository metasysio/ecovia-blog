const { layout, escapeHtml } = require('./layout');
const { formatDate } = require('./index');

function renderPost({ config, post, contentHtml }) {
  const bodyHtml = `<article class="post">
  <header class="post-header">
    <h1>${escapeHtml(post.title)}</h1>
    <p class="post-meta">${formatDate(post.date)}</p>
  </header>
  <div class="post-content">
${contentHtml}
  </div>
  <p class="back-link"><a href="../">&larr; Voltar para o blog</a></p>
</article>`;

  return layout({
    title: `${post.title} | ${config.siteName}`,
    description: post.description,
    canonical: `${config.siteUrl}/${post.slug}/`,
    bodyHtml,
    cssHref: '../css/style.css',
    jsHref: '../js/consent-1.js',
    homeHref: '../',
  });
}

module.exports = { renderPost };
