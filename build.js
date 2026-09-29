const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const config = require('./site.config');
const { renderIndex } = require('./templates/index');
const { renderPost } = require('./templates/post');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, config.postsDir);
const PUBLIC_DIR = path.join(ROOT, config.publicDir);
const OUTPUT_DIR = path.join(ROOT, config.outputDir);

const DIACRITICS_RE = new RegExp('[̀-ͯ]', 'g');

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    if (!data.title) throw new Error(`Post ${file} sem "title" no frontmatter.`);
    if (!data.date) throw new Error(`Post ${file} sem "date" no frontmatter.`);
    if (!data.description)
      throw new Error(`Post ${file} sem "description" no frontmatter (usada em <meta> e no card do índice).`);

    const slug = data.slug ? slugify(data.slug) : slugify(path.basename(file, '.md'));

    return {
      title: data.title,
      description: data.description,
      date: data.date,
      slug,
      draft: Boolean(data.draft),
      content,
    };
  });

  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function build() {
  rmrf(OUTPUT_DIR);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  if (fs.existsSync(PUBLIC_DIR)) copyDir(PUBLIC_DIR, OUTPUT_DIR);

  const posts = loadPosts();

  // Home do blog: dist/index.html -> vira ecovia.ai/blog/ (via rewrite) ou a raiz do site no Netlify.
  const indexHtml = renderIndex({ config, posts: posts.slice(0, config.postsPerIndex) });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);

  // Cada post: dist/<slug>/index.html -> vira ecovia.ai/blog/<slug>/
  for (const post of posts) {
    const contentHtml = marked.parse(post.content);
    const postHtml = renderPost({ config, post, contentHtml });
    const postDir = path.join(OUTPUT_DIR, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), postHtml);
  }

  writeSitemap(posts);
  writeRobots();

  console.log(`Build ok: ${posts.length} post(s) em ${OUTPUT_DIR}`);
}

function writeSitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [
    { loc: `${config.siteUrl}/`, lastmod: posts[0] ? posts[0].date : today },
    ...posts.map((p) => ({ loc: `${config.siteUrl}/${p.slug}/`, lastmod: p.date })),
  ];
  const body = entries
    .map((e) => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), xml);
}

function writeRobots() {
  const txt = `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), txt);
}

build();
