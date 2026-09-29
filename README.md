# Blog do Ecovia

Site estático (sem CMS) que gera `https://ecovia.ai/blog` a partir de arquivos
Markdown. Build com Node puro + `marked` (Markdown → HTML) e `gray-matter`
(frontmatter). Publicado como um segundo site no Netlify, servido em `/blog`
por uma regra de rewrite no site principal (ver "Como isso chega a
ecovia.ai/blog" abaixo).

## Como publicar um post novo (para a Marina, sem precisar do Rafael)

1. Crie um arquivo `.md` em `content/posts/`, com um nome de arquivo simples
   (ele vira a URL do post). Exemplo: `content/posts/como-reduzir-cacamba-parada.md`.
2. No topo do arquivo, preencha o frontmatter (os três campos são obrigatórios):

   ```md
   ---
   title: "Como reduzir caçamba parada com dados de giro"
   date: "2026-10-05"
   description: "Resumo de 1-2 frases para o card do blog e para o Google."
   ---

   Texto do post em Markdown normal a partir daqui.
   ```

   - `date` sempre no formato `AAAA-MM-DD`.
   - Para guardar um rascunho sem publicar, adicione `draft: true` no
     frontmatter — o post fica fora do build até você remover essa linha.
3. Abra um Pull Request com o novo arquivo (ou peça para alguém abrir, se você
   não usa git direto). Ao mergear na branch principal, o Netlify builda e
   publica sozinho — não existe passo manual de deploy.
4. A URL final do post é `https://ecovia.ai/blog/<nome-do-arquivo>/` (sem
   `.md`, sem maiúsculas/acentos — o build normaliza isso automaticamente).

Não é preciso mexer em HTML, CSS ou em nenhum outro arquivo do repositório
para publicar um post.

## Build e preview local

```bash
npm install
npm run build   # gera ./dist
npm run serve   # builda e sobe um preview em http://localhost:8080
```

## Estrutura

```
content/posts/*.md   -> um arquivo por post (o que a Marina edita)
templates/*.js        -> layout HTML (home e post)
public/               -> CSS e assets estáticos, copiados como estão
build.js              -> gera ./dist a partir de content/ + public/
site.config.js        -> nome do site, descrição, URL de produção
dist/                 -> saída do build (não versionado; é o que o Netlify publica)
```

## SEO e medição

- Cada página (home e posts) sai do build com `<title>`, `<meta description>`,
  `<link rel="canonical">` e Open Graph próprios — ver `templates/layout.js`.
  Nenhuma página tem `noindex`.
- `sitemap.xml` e `robots.txt` são gerados a cada build (`build.js`) e ficam
  em `https://ecovia.ai/blog/sitemap.xml` e `https://ecovia.ai/blog/robots.txt`.
  Atenção: crawlers só leem `robots.txt` na raiz do domínio
  (`https://ecovia.ai/robots.txt`, do site principal) — o sitemap do blog
  precisa ser referenciado lá também ou submetido manualmente no Search
  Console.
- Tráfego: `public/js/consent-1.js` reaproveita a mesma propriedade GA4
  (`G-751FZNQ2FK`) e o mesmo banner de consentimento LGPD já usados em
  `ecovia.ai` — zero custo, zero conta nova. Como o blog é servido no mesmo
  domínio (via rewrite do Netlify), o consentimento dado no site principal
  vale aqui também. Sem aceite, nenhuma request vai ao Google.
- Verificação de propriedade no Google Search Console depende de acesso à
  conta Google que já verificou `ecovia.ai` (propriedade de domínio via TXT,
  ver [MET-7](/MET/issues/MET-7)) — não é algo que este repositório resolve
  sozinho.

## URLs (definidas antes do primeiro post, não mudam depois)

- Home do blog: `https://ecovia.ai/blog/`
- Post: `https://ecovia.ai/blog/<slug>/`
- Sitemap: `https://ecovia.ai/blog/sitemap.xml`

## Como isso chega a ecovia.ai/blog (deploy repetível)

Este repositório é um **site Netlify próprio e independente** do site
institucional do Ecovia. Ele nunca é publicado sozinho em `ecovia.ai` — a rota
pública depende de uma regra de rewrite no repositório do site **principal**.

Passo a passo (uma única vez, feito por quem tiver acesso ao Netlify):

1. **Criar o site no Netlify:**
   - Novo site a partir deste repositório Git.
   - Build command: `npm run build`. Publish directory: `dist`.
   - Isso já está configurado em `netlify.toml` — o Netlify detecta sozinho.
   - Depois do primeiro deploy, anote a URL gerada, ex.:
     `https://ecovia-blog-xxxx.netlify.app`.
2. **Adicionar a regra de rewrite no repositório do site principal** (o que já
   está no ar em `ecovia.ai`), em `_redirects` (ou `netlify.toml`):

   ```
   /blog/*  https://ecovia-blog-xxxx.netlify.app/:splat  200
   /blog    https://ecovia-blog-xxxx.netlify.app/:splat  200
   ```

   Troque `ecovia-blog-xxxx.netlify.app` pela URL real do site criado no passo 1.
3. Fazer deploy do site principal com essa mudança. Nenhuma alteração de DNS é
   necessária — a Cloudflare e o domínio `ecovia.ai` continuam exatamente como
   estão hoje.

### Rollback

Reverter é remover as duas linhas do `_redirects`/`netlify.toml` do site
principal e reimplantar (ou usar o rollback de um clique do Netlify para o
deploy anterior). O site do blog em si pode ser apagado sem afetar o site
principal — ele é um site separado.

### Deploy contínuo

Qualquer merge na branch principal deste repositório dispara um novo build no
Netlify automaticamente. Não há passo manual: quem tem acesso de push ao
repositório consegue publicar sozinho.

<!-- deploy-test: MET-12, 2026-09-29 -->
