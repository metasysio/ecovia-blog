/*
 * Consentimento de cookies (LGPD) e carregamento do Google Analytics.
 *
 * Copia do script já usado em ecovia.ai (mesma propriedade GA4, mesmo padrão
 * de consentimento) para que o /blog meça tráfego sem criar conta nova nem
 * custo novo. O GA so' e' BAIXADO depois do "Aceitar". Nao usamos o Consent
 * Mode do Google ("negado por padrao") de proposito: nele o gtag.js carrega
 * mesmo sem consentimento e manda pings sem cookie ao Google — IP e navegador
 * saem da pagina antes de a pessoa escolher. Aqui, sem aceite, nenhuma
 * requisicao vai ao Google.
 *
 * A escolha fica no localStorage (nao e' cookie) e vale 12 meses; depois o
 * banner volta a perguntar. Como o blog e' servido no mesmo dominio
 * (ecovia.ai/blog via rewrite do Netlify), a escolha feita no site principal
 * vale aqui tambem (localStorage e' por origem, nao por caminho).
 *
 * Arquivo versionado no nome (consent-1.js) porque /js/* tem cache de um ano:
 * mudou o conteudo, suba para consent-2.js e troque nas paginas.
 */
(function () {
  var GA_ID = "G-751FZNQ2FK";
  var CHAVE = "ecovia-cookies";
  var VALIDADE_MS = 365 * 24 * 60 * 60 * 1000;

  function lerEscolha() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (!salvo || Date.now() - salvo.em > VALIDADE_MS) return null;
      return salvo.escolha;
    } catch (e) {
      return null;
    }
  }

  function gravarEscolha(escolha) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ escolha: escolha, em: Date.now() }));
    } catch (e) {
      // Navegador sem storage: a escolha vale so' para esta pagina.
    }
  }

  var gaCarregado = false;

  function carregarGA() {
    window["ga-disable-" + GA_ID] = false;
    if (gaCarregado) return;
    gaCarregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  // Revogar: para o GA nesta pagina e apaga os cookies que ele ja' gravou.
  // O GA grava no dominio raiz (.ecovia.ai), por isso as duas variantes.
  function desligarGA() {
    window["ga-disable-" + GA_ID] = true;
    var nomes = ["_ga", "_ga_" + GA_ID.replace(/^G-/, "")];
    var host = location.hostname;
    var raiz = host.split(".").slice(-2).join(".");
    nomes.forEach(function (nome) {
      [host, "." + raiz].forEach(function (dominio) {
        document.cookie = nome + "=; Max-Age=0; path=/; domain=" + dominio;
      });
      document.cookie = nome + "=; Max-Age=0; path=/";
    });
  }

  var CSS =
    ".cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:720px;margin:0 auto;" +
    "background:#fff;color:#3C4D44;border:1px solid rgba(16,32,26,.14);border-radius:18px;" +
    "box-shadow:0 18px 40px -12px rgba(16,32,26,.28);padding:18px 20px;display:flex;gap:16px;align-items:center;" +
    "font:15px/1.5 'Hanken Grotesk',system-ui,-apple-system,sans-serif}" +
    ".cookie-banner[hidden]{display:none}" +
    ".cookie-banner p{margin:0;flex:1}" +
    ".cookie-banner a{color:#15784A;text-decoration:underline;text-underline-offset:2px}" +
    ".cookie-banner .cookie-acoes{display:flex;gap:10px;flex:none}" +
    ".cookie-banner button{font:600 15px/1 'Hanken Grotesk',system-ui,sans-serif;padding:12px 20px;border-radius:999px;" +
    "cursor:pointer;min-width:104px;border:1px solid #15784A;background:#15784A;color:#fff}" +
    ".cookie-banner button:hover{background:#0C3D2A;border-color:#0C3D2A}" +
    ".cookie-banner button:focus-visible{outline:3px solid #1FAE6A;outline-offset:2px}" +
    "@media (max-width:600px){.cookie-banner{flex-direction:column;align-items:stretch}" +
    ".cookie-banner .cookie-acoes button{flex:1}}";

  var banner = null;

  // Os dois botoes tem o MESMO estilo de proposito: recusar tem de ser tao
  // facil e visivel quanto aceitar (guia de cookies da ANPD).
  function montarBanner() {
    var estilo = document.createElement("style");
    estilo.textContent = CSS;
    document.head.appendChild(estilo);

    banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Consentimento de cookies");
    banner.hidden = true;
    banner.innerHTML =
      "<p>Usamos cookies de análise (Google Analytics) para entender como o site é usado. " +
      "Eles só são ativados se você aceitar. <a href=\"/cookies\">Saiba mais</a></p>" +
      "<div class=\"cookie-acoes\">" +
      "<button type=\"button\" data-escolha=\"recusado\">Recusar</button>" +
      "<button type=\"button\" data-escolha=\"aceito\">Aceitar</button>" +
      "</div>";
    banner.addEventListener("click", function (ev) {
      var escolha = ev.target.getAttribute && ev.target.getAttribute("data-escolha");
      if (!escolha) return;
      gravarEscolha(escolha);
      if (escolha === "aceito") carregarGA(); else desligarGA();
      banner.hidden = true;
    });
    document.body.appendChild(banner);
  }

  function abrirBanner() {
    if (!banner) montarBanner();
    banner.hidden = false;
    var primeiro = banner.querySelector("button");
    if (primeiro) primeiro.focus();
  }

  function iniciar() {
    var escolha = lerEscolha();
    if (escolha === "aceito") carregarGA();
    if (!escolha) {
      if (!banner) montarBanner();
      banner.hidden = false;
    }
    document.addEventListener("click", function (ev) {
      var gatilho = ev.target.closest && ev.target.closest("[data-cookie-prefs]");
      if (!gatilho) return;
      ev.preventDefault();
      abrirBanner();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
