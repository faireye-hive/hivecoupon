import './style.css'
import { getCupomOperations, parseCupomOperation, getStoredAccount, isSafeHttpUrl, publishOffer, publishReply, signInWithKeychain, signOutFromHive, voteForOffer, CUPOM_CUSTOM_JSON_ID, CUPOM_COMMENTS_CUSTOM_JSON_ID, getOfferCustomJsonId, makeCupomOperation } from './hive.js'

const icon = (name, size = 18) => {
  const paths = {
    search: '<circle cx="11" cy="11" r="7.2"/><path d="m16.5 16.5 4 4"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-8.8 8.4 9.3 9.3 0 0 1-4-.9L3 20l1.1-4.4a8 8 0 0 1-1.1-4.1 8.4 8.4 0 0 1 8.8-8.4 8.4 8.4 0 0 1 9.2 8.4Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    bookmark: '<path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z"/>',
    zap: '<path d="m13 2-3 8h7l-6 12 1-9H5l8-11Z"/>',
    game: '<path d="M6 9h12a4 4 0 0 1 3.8 5l-1 3a2 2 0 0 1-3.2 1l-2.2-2H8.6l-2.2 2a2 2 0 0 1-3.2-1l-1-3A4 4 0 0 1 6 9Z"/><path d="M7 12v4m-2-2h4m7-1h.01M18 15h.01"/>',
    monitor: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
    code: '<path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14"/>',
    shirt: '<path d="m16 4 5 3-3 5-2-1v10H8V11l-2 1-3-5 5-3a4 4 0 0 0 8 0Z"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10Z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    store: '<path d="M3 10h18l-1.5-6h-15L3 10Z"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    trend: '<path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    send: '<path d="m3 3 18 9-18 9 4-9-4-9Zm4 9h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    arrowRight: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M7 7h10v10"/>',
    flame: '<path d="M12 22c4.4 0 7-3.2 7-7.1 0-2.6-1.3-4.7-3.6-6.9-.2 2.1-1.2 3.4-2.1 4.1C13.8 7.4 11.8 3.7 8 2 9 6 6 8.5 5 11.2 3.2 16 6.2 22 12 22Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    whatsapp: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.7a8.5 8.5 0 1 1 16.3-3.8Z"/><path d="M8.5 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.7c-.2.2-.2.4-.1.6.5 1 1.3 1.8 2.3 2.3.2.1.4.1.6-.1l.7-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.1-.6 1.4-.4.4-1.1.7-1.8.6-1.1-.1-2.5-.8-3.9-2-1.2-1.1-2-2.5-2.3-3.5-.3-1 .1-2.2.7-2.8Z"/>',
  }
  return '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || '') + '</svg>'
}

const stores = [
  { name: 'Amazon', tag: 'amazon', cls: 'amazon', mark: 'a' },
  { name: 'Mercado Livre', tag: 'mercadolivre', cls: 'meli', mark: 'ML' },
  { name: 'AliExpress', tag: 'aliexpress', cls: 'ali', mark: 'Ali' },
  { name: 'Shopee', tag: 'shopee', cls: 'shopee', mark: 'S' },
  { name: 'Magalu', tag: 'magalu', cls: 'magalu', mark: 'm' },
]
const categories = [
  { name: 'Jogos', icon: 'game' },
  { name: 'Eletrônicos', icon: 'monitor' },
  { name: 'Software', icon: 'code' },
  { name: 'Moda', icon: 'shirt' },
  { name: 'Casa e Decoração', icon: 'home' },
  { name: 'Outros', icon: 'more' },
]
let offers = []
let rawOperations = []
const operationCursors = { [CUPOM_CUSTOM_JSON_ID]: '', [CUPOM_COMMENTS_CUSTOM_JSON_ID]: '' }
const operationStreamsHaveMore = { [CUPOM_CUSTOM_JSON_ID]: false, [CUPOM_COMMENTS_CUSTOM_JSON_ID]: false }
const operationStreams = [CUPOM_CUSTOM_JSON_ID, CUPOM_COMMENTS_CUSTOM_JSON_ID]
const offerCommentCursors = new Map()
const offerCommentsHaveMore = new Map()
const offerCommentFetchState = new Map()
const offerCommentRequests = new Map()
const OPERATIONS_PAGE_SIZE = 100
let activeTab = 'Destaques'
let searchTerm = ''
let activeCategory = 'Todas'
let activeStore = 'Todas as lojas'
let displayMode = 'list'
let savedOffers = new Set()
try { savedOffers = new Set(JSON.parse(localStorage.getItem('cupom:saved-offers') || '[]')) } catch { /* Ignore malformed browser storage. */ }
let currentAccount = getStoredAccount()
let routeSearchToken = 0

const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const cleanBody = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_\x60>#]/g, '').replace(/\s+/g, ' ').trim()
const timeAgo = (value) => {
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z')
  if (Number.isNaN(date.getTime())) return 'agora'
  const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000))
  if (mins < 1) return 'agora'
  if (mins < 60) return 'há ' + mins + ' min'
  if (mins < 1440) return 'há ' + Math.floor(mins / 60) + ' h'
  return 'há ' + Math.floor(mins / 1440) + ' d'
}
const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function parseBRLPrice(value) {
  const text = String(value ?? '').trim().replace(/^(?:R\$|BRL)\s*/i, '')
  const brazilian = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/
  const decimalPoint = /^\d+\.\d{1,2}$/
  if (brazilian.test(text)) return Number(text.replaceAll('.', '').replace(',', '.'))
  if (decimalPoint.test(text)) return Number(text)
  return NaN
}

function displayPrice(value) {
  const amount = parseBRLPrice(value)
  return Number.isFinite(amount) ? brlFormatter.format(amount) : String(value ?? '').trim()
}

function renderOfferPrice(offer, className = 'price-row') {
  const price = displayPrice(offer.price) || 'Consulte a loja'
  const oldPrice = displayPrice(offer.oldPrice)
  const discount = offerDiscount(offer)
  const flame = discount >= 50
    ? `<span class="price-flame" role="img" aria-label="${discount}% de desconto" title="${discount}% de desconto sobre o preço anterior informado">${icon('flame', 16)}</span>`
    : ''
  return `<div class="${className}">
    <strong>${escapeHTML(price)}${flame}</strong>
    ${oldPrice ? `<del class="old-price">${escapeHTML(oldPrice)}</del>` : ''}
  </div>`
}

function offerDiscount(offer) {
  const price = parseBRLPrice(offer.price)
  const previous = parseBRLPrice(offer.oldPrice)
  if (!Number.isFinite(price) || !Number.isFinite(previous) || previous <= price) return 0
  return Math.floor((previous - price) * 100 / previous)
}
const findStore = (name) => stores.find((store) => store.name === name)
function offerCategory(offer) {
  if (categories.some(({ name }) => name === offer.category)) return offer.category
  const text = `${offer.title || ''} ${offer.description || ''}`.toLowerCase()
  if (/\b(gta|playstation|ps[345]|xbox|nintendo|videogame|video game|jogo|game)\b/.test(text)) return 'Jogos'
  if (/\b(tv|televis[aã]o|monitor|fone|headphone|celular|smartphone|notebook|tablet)\b/.test(text)) return 'Eletrônicos'
  if (/\b(software|licen[cç]a|antiv[ií]rus|windows|office)\b/.test(text)) return 'Software'
  if (/\b(camiseta|vestido|cal[cç]a|tenis|t[eê]nis|moda)\b/.test(text)) return 'Moda'
  if (/\b(m[eó]vel|sof[aá]|cozinha|decora[cç][aã]o|casa)\b/.test(text)) return 'Casa e Decoração'
  return 'Outros'
}
const offerHref = (id) => '#offer/' + encodeURIComponent(id)
const getRouteOfferId = () => {
  const match = location.hash.match(/^#offer\/(.+)$/) || location.hash.match(/^#offer-(.+)$/)
  if (!match) return ''
  try { return decodeURIComponent(match[1]) } catch { return match[1] }
}

document.querySelector('#app').innerHTML = [
  `<header class="site-header">
    <div class="nav-wrap">
      <a class="brand" href="#top" aria-label="CUpom início">
        <span class="brand-icon">${icon('tag', 23)}</span><span>CUpom<span class="brand-dot">.</span></span>
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Navegação principal">
        <a class="nav-link nav-link-active" href="#deal-list">${icon('tag', 16)} Ofertas</a>
        <a class="nav-link" href="#deal-list" data-quick-filter="Cupons">${icon('tag', 16)} Cupons</a>
        <button class="nav-link nav-action" type="button" data-focus-store>${icon('store', 16)} Lojas</button>
        <a class="nav-link" href="#deal-categories">${icon('grid', 16)} Categorias</a>
      </nav>
      <label class="search-box">${icon('search', 19)}
        <input id="search-input" type="search" aria-label="Buscar ofertas, cupons e lojas" placeholder="Buscar ofertas, cupons e lojas" autocomplete="off">
      </label>
      <button type="button" class="post-button" id="post-button" aria-label="Publicar oferta">${icon('plus', 18)}<span>Publicar oferta</span></button>
      <button type="button" class="profile-button" id="profile-button" aria-label="Entrar com Hive Keychain">${icon('user', 18)}<span class="account-label">Entrar</span></button>
      <button type="button" class="mobile-menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav">${icon('menu', 20)}</button>
    </div>
  </header>`,
  `<main id="top" class="page-shell">
    <section class="welcome-row">
      <div class="welcome-content">
        <h1>Achou, <em>economizou.</em></h1>
        <p class="welcome-copy">Ofertas e cupons compartilhados pela comunidade na Hive.</p>
        <div class="hero-actions"><a class="hero-cta" href="#deal-list">${icon('search', 17)} Explorar ofertas</a><button class="hero-store-cta" type="button" data-focus-store>${icon('store', 17)} Ver lojas</button></div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="hero-orbit orbit-outer"></div><div class="hero-orbit orbit-inner"></div>
        <span class="hero-spark spark-top">✦</span><span class="hero-spark spark-bottom">✧</span>
        <div class="hero-ticket hero-ticket-back"></div>
        <div class="hero-ticket hero-ticket-front"><span class="ticket-percent">%</span><span class="ticket-stub">${icon('tag', 25)}</span></div>
      </div>
      <div class="hero-benefits">
        <div><span class="benefit-icon">${icon('zap', 19)}</span><p><b>Ofertas reais</b><small>Economize de verdade</small></p></div>
        <div><span class="benefit-icon">${icon('user', 19)}</span><p><b>Comunidade ativa</b><small>Ofertas compartilhadas</small></p></div>
        <div><span class="benefit-icon">${icon('check', 19)}</span><p><b>Seguro e confiável</b><small>Compartilhado na Hive</small></p></div>
      </div>
    </section>`,
  `<section class="feed-layout" id="deal-list">
    <div class="feed-column">
      <div class="feed-heading"><h2>${icon('tag', 22)} Explore as ofertas</h2><button type="button" class="refresh-button" id="refresh-button">${icon('refresh', 17)} Atualizar</button></div>
      <div class="feed-head"><div class="tabs" role="tablist" aria-label="Ordenar ofertas">
        ${['Destaques', 'Recentes', 'Cupons', 'Mais baratos', 'Em alta'].map((tab, i) => `<button type="button" role="tab" aria-selected="${i === 0}" class="feed-tab ${i === 0 ? 'active' : ''}" data-tab="${tab}">${tab === 'Destaques' ? icon('flame', 15) : tab === 'Recentes' ? icon('clock', 15) : tab === 'Cupons' ? icon('tag', 15) : tab === 'Mais baratos' ? '↓' : icon('trend', 15)} ${tab}</button>`).join('')}
      </div><div class="feed-tools"><label class="store-filter-wrap">${icon('store', 15)}<select id="store-filter" aria-label="Filtrar por loja"><option>Todas as lojas</option>${stores.map((store) => `<option>${store.name}</option>`).join('')}</select></label><div class="view-toggle" role="group" aria-label="Modo de visualização"><button type="button" data-view="list" aria-pressed="true" aria-label="Visualização em lista">${icon('list', 17)}</button><button type="button" data-view="grid" aria-pressed="false" aria-label="Visualização em grade">${icon('grid', 17)}</button></div></div></div>
      <div id="feed-status" class="feed-status" role="status">Buscando ofertas na Hive…</div>
      <div id="offer-list" class="deal-list"></div>
      <button type="button" id="load-more" class="load-more-button" hidden>Carregar mais ofertas</button>
    </div>
    <aside class="sidebar" aria-label="Categorias e cupons">
      <section class="side-card category-card" id="deal-categories">
        <h2>${icon('grid', 19)} Categorias</h2>
        <div class="category-list">${categories.map((category) => `<button type="button" class="category-link" data-category="${category.name}"><span>${icon(category.icon, 17)} ${category.name}</span><span class="category-count" data-category-count="${category.name}">0</span></button>`).join('')}</div>
      </section>
      <section class="side-card coupon-promo-card">
        <div class="coupon-promo-art">${icon('tag', 47)}<b>%</b></div><div><h2>Cupons exclusivos</h2><p>Ative cupons e economize em suas compras.</p><button type="button" class="coupon-promo-button" data-quick-filter="Cupons">Ver cupons ${icon('arrowRight', 16)}</button></div>
      </section>
      <section class="side-card join-card">
        <span class="side-icon">${icon('user', 20)}</span><h2>Achou uma boa oferta?</h2><p>Entre com Hive Keychain para publicar e participar da conversa.</p><button type="button" class="primary-button" id="join-button">Conectar Keychain ${icon('arrow', 16)}</button><button type="button" class="share-site-button" id="share-site">Compartilhar CUpom ${icon('whatsapp', 16)}</button>
      </section>
    </aside>
  </section>`,
  '<section id="offer-page" class="offer-page" hidden aria-live="polite"></section><footer class="site-footer"><span>© 2026 CUpom</span><span>Ofertas armazenadas na blockchain Hive. Links de afiliados podem gerar comissão, sem custo extra.</span><a href="https://peakd.com" target="_blank" rel="noopener noreferrer">Explorar Hive ↗</a></footer></main><div class="toast" id="toast" role="status"></div>',
  '<dialog id="login-dialog" class="publish-dialog"><form id="login-form"><button type="button" class="dialog-close" data-close="login-dialog" aria-label="Fechar">×</button><span class="dialog-mark">' + icon('user', 22) + '</span><p class="eyebrow">AUTENTICAÇÃO SEGURA</p><h2>Entrar com Hive Keychain</h2><p class="dialog-copy">Digite sua conta Hive. O Keychain pedirá para assinar um desafio de login com a chave Posting.</p><label>Conta Hive<input name="username" placeholder="seu-usuario" autocomplete="username" required minlength="3" maxlength="16"></label><p class="form-error" id="login-error"></p><button class="primary-button" type="submit">Conectar conta ' + icon('arrow', 16) + '</button><small class="security-note">Nunca cole sua chave privada neste site.</small></form></dialog>',
  '<dialog id="publish-dialog" class="publish-dialog wide-dialog"><form id="offer-form"><button type="button" class="dialog-close" data-close="publish-dialog" aria-label="Fechar">×</button><span class="dialog-mark">' + icon('tag', 22) + '</span><p class="eyebrow">CUSTOM_JSON · ' + CUPOM_CUSTOM_JSON_ID + '</p><h2>Compartilhar uma oferta</h2><p class="dialog-copy">A oferta será gravada como custom_json na blockchain. Revise os dados antes de confirmar no Keychain.</p><label>Título<input name="title" required maxlength="120" placeholder="Ex.: Fone Bluetooth com 40% OFF"></label><div class="form-row"><label>Loja<select name="store" required>' + stores.map((store) => '<option value="' + store.name + '">' + store.name + '</option>').join('') + '</select></label><label>Tipo<select name="kind"><option value="Oferta">Oferta</option><option value="Cupom">Cupom</option></select></label></div><div class="form-row"><label>Categoria<select name="category">' + categories.map((category) => '<option value="' + category.name + '">' + category.name + '</option>').join('') + '</select></label><label>Tags<input name="tags" maxlength="100" placeholder="Ex.: Ação, Aventura, Mundo aberto"></label></div><div class="form-row"><label>Preço atual (R$)<input name="price" required maxlength="30" placeholder="179,90"></label><label>Preço anterior (R$)<input name="oldPrice" maxlength="30" placeholder="Opcional"></label></div><div class="form-row"><label>Código do cupom<input name="coupon" maxlength="40" placeholder="Opcional"></label><label>Imagem (URL)<input name="image" type="url" placeholder="https://… (opcional)"></label></div><label>Link da oferta / afiliado<input name="affiliateUrl" type="url" required placeholder="https://sua-loja.com/produto"></label><label>Detalhes<textarea name="description" rows="3" maxlength="600" placeholder="Explique as condições, validade ou como ativar o cupom."></textarea></label><p class="form-error" id="offer-error"></p><button class="primary-button" type="submit">Publicar na Hive ' + icon('arrow', 16) + '</button></form></dialog>',
].join('')

function showToast(message) {
  const toast = document.querySelector('#toast')
  toast.textContent = message
  toast.classList.add('show')
  window.setTimeout(() => toast.classList.remove('show'), 3000)
}

function setAccountUI() {
  document.querySelector('.account-label').textContent = currentAccount ? '@' + currentAccount : 'Entrar'
  document.querySelector('#profile-button').setAttribute('aria-label', currentAccount ? 'Sair de @' + currentAccount : 'Entrar com Hive Keychain')
  document.querySelector('#join-button').innerHTML = (currentAccount ? '@' + escapeHTML(currentAccount) : 'Conectar Keychain') + ' ' + icon('arrow', 16)
}
function openLogin() {
  const error = document.querySelector('#login-error')
  error.textContent = window.hive_keychain
    ? ''
    : 'Hive Keychain não foi detectado neste navegador. Abra o site no Chrome, Brave ou Firefox com a extensão ativada; o navegador interno do ChatGPT não carrega extensões.'
  document.querySelector('#login-dialog').showModal()
}
function requireAccount() {
  if (currentAccount) return true
  openLogin()
  return false
}

function renderOfferThumbnail(offer) {
  if (isSafeHttpUrl(offer.image)) {
    return `<img class="real-offer-image" src="${escapeHTML(offer.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
  }
  const store = findStore(offer.store)
  return `<div class="deal-art ${store?.cls || ''}" aria-hidden="true"><span class="art-symbol">${escapeHTML(store?.mark || '%')}</span></div>`
}

function renderOfferMedia(offer) {
  const discount = offerDiscount(offer)
  let sticker = ''
  if (discount) {
    sticker = `<span class="promo-sticker" aria-label="${discount}% de desconto">
      <span class="promo-sticker-icon">${icon('tag', 13)}</span><span>${discount}% OFF</span>
    </span>`
  } else if (offer.coupon) {
    sticker = `<span class="promo-sticker promo-sticker-coupon">
      <span class="promo-sticker-icon">${icon('tag', 13)}</span><span>Cupom</span>
    </span>`
  }
  return `<div class="deal-media">${renderOfferThumbnail(offer)}${sticker}</div>`
}

function renderOffers() {
  const root = document.querySelector('#offer-list')
  let list = [...offers]
  document.querySelectorAll('[data-category-count]').forEach((node) => {
    node.textContent = String(offers.filter(({ offer }) => offerCategory(offer) === node.dataset.categoryCount).length)
  })
  if (activeTab === 'Cupons') list = list.filter(({ offer }) => offer.kind === 'Cupom' || offer.coupon)
  if (activeStore !== 'Todas as lojas') list = list.filter(({ offer }) => offer.store === activeStore)
  if (activeCategory !== 'Todas') list = list.filter(({ offer }) => offerCategory(offer) === activeCategory)
  if (activeTab === 'Mais baratos') {
    const sortablePrice = ({ offer }) => {
      const amount = parseBRLPrice(offer.price)
      return Number.isFinite(amount) ? amount : Infinity
    }
    list.sort((a, b) => sortablePrice(a) - sortablePrice(b))
  }
  if (activeTab === 'Destaques') list.sort((a, b) => voteCount(b) - voteCount(a))
  if (activeTab === 'Em alta') list.sort((a, b) => (voteCount(b) + b.comments.length * 2) - (voteCount(a) + a.comments.length * 2))
  if (searchTerm) list = list.filter((item) => (item.offer.title + ' ' + item.author + ' ' + item.offer.store + ' ' + offerCategory(item.offer) + ' ' + (item.offer.tags || []).join(' ') + ' ' + (item.offer.coupon || '') + ' ' + (item.offer.description || '')).toLowerCase().includes(searchTerm))
  if (!list.length) {
    const empty = offers.length ? 'Nenhuma oferta com esses filtros' : 'Ainda não há ofertas do CUpom'
    const detail = offers.length ? 'Tente outro termo ou ajuste os filtros.' : 'Seja a primeira pessoa a publicar uma oferta na blockchain Hive.'
    root.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('search', 24) + '</div><strong>' + empty + '</strong><span>' + detail + '</span><button class="clear-filter">' + (offers.length ? 'Limpar filtros' : 'Publicar a primeira oferta') + '</button></div>'
    root.querySelector('.clear-filter').addEventListener('click', () => {
      if (!offers.length) { if (requireAccount()) document.querySelector('#publish-dialog').showModal(); return }
      searchTerm = ''; activeCategory = 'Todas'; activeStore = 'Todas as lojas'; document.querySelector('#search-input').value = ''; document.querySelector('#store-filter').value = activeStore; document.querySelectorAll('[data-category]').forEach((button) => button.classList.remove('is-active')); renderOffers()
    })
    return
  }
  root.innerHTML = list.map((discussion) => {
    const item = discussion.offer
    const title = escapeHTML(item.title || 'Oferta da comunidade')
    const description = escapeHTML(cleanBody(String(item.description || '')))
    const author = escapeHTML(discussion.author)
    const voted = currentAccount && discussion.votes[currentAccount] === 1
    const category = offerCategory(item)
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : []
    const tagChips = tags.map((tag) => `<span class="deal-tag">${escapeHTML(tag)}</span>`).join('')
    const saved = savedOffers.has(discussion.id)
    const coupon = item.coupon ? '<button class="coupon-code" data-copy="' + escapeHTML(item.coupon) + '" aria-label="Copiar cupom">' + icon('tag', 15) + ' <b>' + escapeHTML(item.coupon) + '</b><span>Copiar</span></button>' : ''
    const href = offerHref(discussion.id)
    return `<article class="deal-card" id="offer-${escapeHTML(discussion.id)}" data-offerid="${escapeHTML(discussion.id)}">
      <div class="deal-content">
        ${renderOfferMedia(item)}
        <div class="deal-info">
          <span class="deal-category">${escapeHTML(category)}</span>
          <h3>${title}</h3>
          <p class="deal-store">${icon('tag', 14)} ${escapeHTML(item.store || 'Loja')}</p>
          ${description ? `<p class="deal-description">${description}</p>` : ''}
          ${tagChips ? `<div class="deal-tags">${tagChips}</div>` : ''}
          ${coupon}
        </div>
        <div class="deal-promotion">
          <span class="deal-promo-label">${icon(offerDiscount(item) >= 50 ? 'flame' : 'tag', 15)} ${offerDiscount(item) >= 50 ? 'Oferta imperdível' : item.coupon ? 'Cupom disponível' : 'Oferta da comunidade'}</span>
          ${renderOfferPrice(item, 'price-row deal-price')}
          <a class="deal-cta" href="${href}" aria-label="Ver oferta: ${title}">Ver oferta ${icon('arrowRight', 17)}</a>
        </div>
      </div>
      <div class="deal-card-bottom">
        <div class="deal-byline">
          <a class="username" href="https://peakd.com/@${encodeURIComponent(discussion.author)}" target="_blank" rel="noopener noreferrer" aria-label="Ver perfil de @${author} no PeakD (abre em outra aba)">
            <span class="avatar" aria-hidden="true">${escapeHTML(discussion.author.slice(0, 1).toUpperCase())}</span>
            <span class="username-handle">@${author}</span>${icon('external', 12)}
          </a>
          <span class="time">${timeAgo(discussion.created)}</span>
        </div>
        <div class="deal-actions">
          <button type="button" class="vote-button ${voted ? 'voted' : ''}" data-vote aria-pressed="${Boolean(voted)}" aria-label="${voted ? 'Remover voto' : 'Votar'} nesta oferta">${icon('flame', 17)} <b>${voteCount(discussion)}</b></button>
          <a class="comment-button" href="${href}" aria-label="Abrir comentários da oferta">${icon('message', 16)} <span>${discussion.comments.length}</span></a>
          <button type="button" class="share-button" data-share aria-label="Compartilhar no WhatsApp">${icon('whatsapp', 17)}</button>
          <button type="button" class="save-button ${saved ? 'is-saved' : ''}" data-save aria-pressed="${saved}" aria-label="${saved ? 'Remover dos salvos' : 'Salvar oferta'}">${icon('bookmark', 16)}</button>
        </div>
      </div>
    </article>`
  }).join('')
  root.classList.toggle('grid-view', displayMode === 'grid')
  root.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy); button.querySelector('span').textContent = 'Copiado!' }
    catch { showToast('Código do cupom: ' + button.dataset.copy) }
  }))
  root.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', () => {
    const article = button.closest('.deal-card')
    const item = offers.find((entry) => entry.id === article.dataset.offerid)
    const shareUrl = new URL(location.href)
    shareUrl.hash = offerHref(item.id).slice(1)
    const link = shareUrl.toString()
    window.open('https://wa.me/?text=' + encodeURIComponent(item.offer.title + ' — ' + (item.offer.price || '') + ' ' + link), '_blank', 'noopener,noreferrer')
  }))
  root.querySelectorAll('[data-save]').forEach((button) => button.addEventListener('click', () => {
    const id = button.closest('.deal-card').dataset.offerid
    if (savedOffers.has(id)) savedOffers.delete(id)
    else savedOffers.add(id)
    try { localStorage.setItem('cupom:saved-offers', JSON.stringify([...savedOffers])) } catch { showToast('Não foi possível salvar neste navegador.') }
    renderOffers()
    showToast(savedOffers.has(id) ? 'Oferta salva neste navegador.' : 'Oferta removida dos salvos.')
  }))
  root.querySelectorAll('[data-vote]').forEach((button) => button.addEventListener('click', async () => {
    if (!requireAccount()) return
    const article = button.closest('.deal-card')
    const item = offers.find((entry) => entry.id === article.dataset.offerid)
    const voted = item.votes[currentAccount] === 1
    button.disabled = true
    try {
      const value = voted ? 0 : 1
      await voteForOffer(currentAccount, item.id, value)
      addPendingOperation(currentAccount, { type: 'offer.vote', offerId: item.id, value })
      await loadOffers()
      showToast(voted ? 'Voto removido na Hive.' : 'Voto publicado na Hive.')
    }
    catch (error) { showToast(error.message) }
    finally { button.disabled = false }
  }))
}

function voteCount(offer) { return Object.values(offer.votes).filter((value) => value === 1).length }

function addPendingOperation(author, payload) {
  rawOperations.push({
    ...makeCupomOperation(payload),
    id: 'local-' + Date.now() + '-' + Math.random(),
    timestamp: new Date().toISOString(),
    required_posting_auths: [author],
  })
  rebuildOffers()
}

function rebuildOffers() {
  const events = rawOperations.map(parseCupomOperation).filter(Boolean)
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const byId = new Map()
  for (const event of events) {
    const data = event.payload
    if (data.type === 'offer.create' && data.offerId && data.offer && !byId.has(data.offerId)) {
      byId.set(data.offerId, { id: data.offerId, author: event.author, created: event.timestamp, offer: data.offer, votes: {}, comments: [] })
      continue
    }
    const offer = byId.get(data.offerId)
    if (!offer) continue
    if (data.type === 'offer.vote') offer.votes[event.author] = Number(data.value) === 1 ? 1 : 0
    if (data.type === 'offer.comment' && data.commentId && !offer.comments.some((comment) => comment.id === data.commentId)) {
      offer.comments.push({ id: data.commentId, parentId: data.parentId || '', author: event.author, body: data.body || '', created: event.timestamp })
    }
  }
  offers = [...byId.values()].sort((a, b) => new Date(b.created) - new Date(a.created))
}

async function loadOffers() {
  const status = document.querySelector('#feed-status')
  status.textContent = 'Buscando ofertas na Hive…'
  status.classList.remove('error-status')
  try {
    const pages = await Promise.all(operationStreams.map(async (customId) => ({ customId, operations: await getCupomOperations({ limit: OPERATIONS_PAGE_SIZE, customId }) })))
    for (const { customId, operations } of pages) {
      operationCursors[customId] = operations.length ? String(operations[operations.length - 1].id) : ''
      operationStreamsHaveMore[customId] = operations.length === OPERATIONS_PAGE_SIZE
      rawOperations = mergeOperations(rawOperations, operations)
    }
    rebuildOffers()
    renderOffers()
    renderCurrentRoute()
    document.querySelector('#load-more').hidden = !operationStreamsHaveMore[CUPOM_CUSTOM_JSON_ID] && !operationStreamsHaveMore[CUPOM_COMMENTS_CUSTOM_JSON_ID]
    status.textContent = offers.length === 1 ? '1 oferta no feed' : offers.length + ' ofertas no feed'
  } catch (error) {
    renderOffers()
    renderCurrentRoute()
    status.textContent = 'Falha ao carregar HAFSQL: ' + error.message
    status.classList.add('error-status')
  }
}

function mergeOperations(existing, incoming) {
  const byId = new Map(existing.map((operation) => [String(operation.id), operation]))
  incoming.forEach((operation) => byId.set(String(operation.id), operation))
  return [...byId.values()]
}

async function loadOlderOperations() {
  const button = document.querySelector('#load-more')
  if (button.disabled || !operationStreams.some((customId) => operationStreamsHaveMore[customId] && operationCursors[customId])) return
  button.disabled = true
  button.textContent = 'Carregando…'
  try {
    await Promise.all(operationStreams.filter((customId) => operationStreamsHaveMore[customId] && operationCursors[customId]).map(fetchOlderStream))
    rebuildOffers()
    renderOffers()
    renderCurrentRoute()
    button.hidden = !operationStreams.some((customId) => operationStreamsHaveMore[customId])
  } catch (error) {
    showToast('Não foi possível carregar operações anteriores: ' + error.message)
  } finally {
    button.disabled = false
    button.textContent = 'Carregar mais ofertas'
  }
}

async function fetchOlderStream(customId) {
  const cursor = operationCursors[customId]
  const older = await getCupomOperations({ start: cursor, limit: OPERATIONS_PAGE_SIZE, customId })
  if (!older.length || String(older[older.length - 1].id) === cursor) {
    operationStreamsHaveMore[customId] = false
    return older
  }
  rawOperations = mergeOperations(rawOperations, older)
  operationCursors[customId] = String(older[older.length - 1].id)
  operationStreamsHaveMore[customId] = older.length === OPERATIONS_PAGE_SIZE
  return older
}

async function loadOfferComments(offerId, older = false) {
  if (offerCommentRequests.has(offerId)) return offerCommentRequests.get(offerId)
  const state = older ? 'loading-more' : 'loading'
  offerCommentFetchState.set(offerId, state)
  const current = offers.find((entry) => entry.id === offerId)
  if (current && getRouteOfferId() === offerId) renderOfferPage(current)
  const request = (async () => {
    try {
      const cursor = older ? offerCommentCursors.get(offerId) : ''
      const customId = getOfferCustomJsonId(offerId)
      const operations = await getCupomOperations({ customId, start: cursor, limit: OPERATIONS_PAGE_SIZE })
      const validComments = operations.filter((operation) => {
        const parsed = parseCupomOperation(operation)
        return parsed?.payload.type === 'offer.comment' && parsed.payload.offerId === offerId
      })
      rawOperations = mergeOperations(rawOperations, validComments)
      offerCommentCursors.set(offerId, operations.length ? String(operations[operations.length - 1].id) : '')
      offerCommentsHaveMore.set(offerId, operations.length === OPERATIONS_PAGE_SIZE)
      rebuildOffers()
      offerCommentFetchState.set(offerId, 'loaded')
      renderOffers()
      const refreshed = offers.find((entry) => entry.id === offerId)
      if (refreshed && getRouteOfferId() === offerId) renderOfferPage(refreshed)
    } catch (error) {
      offerCommentFetchState.set(offerId, 'error')
      const refreshed = offers.find((entry) => entry.id === offerId)
      if (refreshed && getRouteOfferId() === offerId) renderOfferPage(refreshed, error.message)
    } finally {
      offerCommentRequests.delete(offerId)
    }
  })()
  offerCommentRequests.set(offerId, request)
  return request
}

function renderCurrentRoute() {
  const offerId = getRouteOfferId()
  const page = document.querySelector('#offer-page')
  const homeElements = [document.querySelector('.welcome-row'), document.querySelector('.feed-layout'), document.querySelector('.site-footer')]
  homeElements.forEach((element) => { element.hidden = Boolean(offerId) })
  page.hidden = !offerId
  if (!offerId) return

  const discussion = offers.find((entry) => entry.id === offerId)
  if (discussion) {
    renderOfferPage(discussion)
    if (getOfferCustomJsonId(discussion.id) !== CUPOM_COMMENTS_CUSTOM_JSON_ID && !offerCommentFetchState.has(discussion.id)) loadOfferComments(discussion.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  page.innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Procurando esta oferta na Hive…</strong><span>Consultando o histórico de operações custom_json.</span></div></div>'
  findOfferInHistory(offerId)
}

async function findOfferInHistory(offerId) {
  const token = ++routeSearchToken
  try {
    while (operationStreamsHaveMore[CUPOM_CUSTOM_JSON_ID] && operationCursors[CUPOM_CUSTOM_JSON_ID] && token === routeSearchToken && getRouteOfferId() === offerId) {
      await fetchOlderStream(CUPOM_CUSTOM_JSON_ID)
      rebuildOffers()
      const discussion = offers.find((entry) => entry.id === offerId)
      if (discussion) {
        while (operationStreamsHaveMore[CUPOM_COMMENTS_CUSTOM_JSON_ID] && operationCursors[CUPOM_COMMENTS_CUSTOM_JSON_ID] && token === routeSearchToken && getRouteOfferId() === offerId) {
          const commentsLoaded = rawOperations.map(parseCupomOperation).filter((event) => event?.payload.type === 'offer.comment')
          if (!operationStreamsHaveMore[CUPOM_COMMENTS_CUSTOM_JSON_ID]) break
          if (commentsLoaded.length) {
            const oldestLoaded = commentsLoaded.reduce((oldest, event) => new Date(event.timestamp) < new Date(oldest.timestamp) ? event : oldest)
            if (new Date(oldestLoaded.timestamp) <= new Date(discussion.created)) break
          }
          await fetchOlderStream(CUPOM_COMMENTS_CUSTOM_JSON_ID)
          rebuildOffers()
        }
        renderOffers()
        renderCurrentRoute()
        return
      }
    }
    if (token === routeSearchToken && getRouteOfferId() === offerId) {
      document.querySelector('#offer-page').innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Não encontramos esta oferta</strong><span>Ela pode não estar no histórico consultado ou o link pode estar incorreto.</span></div></div>'
    }
  } catch (error) {
    if (token === routeSearchToken) document.querySelector('#offer-page').innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Não foi possível abrir a oferta</strong><span>' + escapeHTML(error.message) + '</span></div></div>'
  }
}

function renderOfferComment(reply, parent) {
  const author = escapeHTML(reply.author)
  const replyContext = reply.parentId
    ? `<div class="offer-comment-context">${parent ? 'Em resposta a @' + escapeHTML(parent.author) : 'Em resposta a outro comentário'}</div>`
    : ''
  return `<article class="offer-comment">
    <div class="comment-avatar">${escapeHTML(reply.author.slice(0, 1).toUpperCase())}</div>
    <div class="offer-comment-content">
      <header><a href="https://peakd.com/@${author}" target="_blank" rel="noopener noreferrer">@${author}</a><time>${timeAgo(reply.created)}</time></header>
      ${replyContext}
      <p>${escapeHTML(reply.body)}</p>
      <button type="button" class="comment-reply-button" data-reply-to="${escapeHTML(reply.id)}" aria-label="Responder a @${author}">Responder</button>
    </div>
  </article>`
}

function setReplyTarget(form, reply) {
  form.dataset.parentId = reply?.id || ''
  form.querySelector('.reply-target').hidden = !reply
  form.querySelector('.reply-target-name').textContent = reply ? '@' + reply.author : ''
  form.elements.reply.placeholder = reply ? 'Escreva sua resposta' : 'Participe da conversa'
  form.querySelector('[type="submit"]').setAttribute('aria-label', reply ? 'Publicar resposta' : 'Publicar comentário')
}

function createReplyForm(offerId) {
  const form = document.createElement('form')
  form.id = 'reply-form'
  form.className = 'offer-reply-form'
  form.dataset.offerId = offerId
  form.innerHTML = `<div class="reply-target" hidden>
    <span>Respondendo a <strong class="reply-target-name"></strong></span>
    <button type="button" class="comment-reply-button" data-cancel-reply>Cancelar resposta</button>
  </div>
  <span class="comment-avatar current-comment-avatar" aria-hidden="true"></span>
  <textarea name="reply" rows="2" maxlength="1000" aria-label="Escreva seu comentário" placeholder="Participe da conversa" required></textarea>
  <button type="submit" aria-label="Publicar comentário">${icon('send', 17)}</button>
  <p class="form-error" id="reply-error" role="alert"></p>`
  form.addEventListener('submit', submitOfferReply)
  form.querySelector('[data-cancel-reply]').addEventListener('click', () => {
    setReplyTarget(form, null)
    form.elements.reply.focus()
  })
  return form
}

function renderRelatedOffers(discussion) {
  const store = discussion.offer.store
  const fromSameStore = (entry) => Number(Boolean(store && entry.offer.store === store))
  const related = offers
    .filter((entry) => entry.id !== discussion.id)
    .sort((a, b) => fromSameStore(b) - fromSameStore(a))
    .slice(0, 4)
  if (!related.length) return ''

  return `<section class="related-offers" aria-labelledby="related-offers-title">
    <div class="related-offers-heading">
      <h2 id="related-offers-title">Outras ofertas</h2>
      <a class="related-offers-feed" href="#deal-list">Ver feed ${icon('arrow', 16)}</a>
    </div>
    <ul class="related-offers-grid">
      ${related.map(({ id, offer }) => `<li>
        <a class="related-offer-card" href="${offerHref(id)}">
          ${renderOfferMedia(offer)}
          <div class="related-offer-info">
            <span class="store-mark">${escapeHTML(offer.store || 'Loja')}</span>
            <h3>${escapeHTML(offer.title || 'Oferta da comunidade')}</h3>
            ${renderOfferPrice(offer)}
          </div>
        </a>
      </li>`).join('')}
    </ul>
  </section>`
}

function renderOfferPage(discussion, commentError = '') {
  const page = document.querySelector('#offer-page')
  const existingForm = page.querySelector('#reply-form')
  const form = existingForm?.dataset.offerId === discussion.id ? existingForm : createReplyForm(discussion.id)
  const focusedField = form.contains(document.activeElement) ? document.activeElement : null
  const commentScrollTop = form === existingForm ? page.querySelector('.offer-comments-list').scrollTop : 0
  const commentsById = new Map(discussion.comments.map((reply) => [reply.id, reply]))
  const item = discussion.offer
  const store = findStore(item.store)
  const safeUrl = isSafeHttpUrl(item.affiliateUrl) ? escapeHTML(item.affiliateUrl) : ''
  const title = escapeHTML(item.title || 'Oferta da comunidade')
  const image = isSafeHttpUrl(item.image)
    ? '<img class="offer-hero-image" src="' + escapeHTML(item.image) + '" alt="Imagem da oferta: ' + title + '" referrerpolicy="no-referrer">'
    : '<div class="offer-hero-art ' + (store?.cls || '') + '" aria-hidden="true"><span class="art-symbol">' + escapeHTML(store?.mark || '%') + '</span><span class="art-label">' + escapeHTML(item.store || 'CUpom') + '</span></div>'
  const coupon = item.coupon ? '<button class="coupon-code detail-coupon" data-copy="' + escapeHTML(item.coupon) + '">' + icon('tag', 15) + ' <b>' + escapeHTML(item.coupon) + '</b><span>Copiar</span></button>' : ''
  const comments = discussion.comments.length
    ? discussion.comments.map((reply) => renderOfferComment(reply, commentsById.get(reply.parentId))).join('')
    : '<div class="comments-empty"><span class="empty-comment-icon">' + icon('message', 19) + '</span><b>A conversa começa aqui</b><p>Compartilhe uma dúvida ou conte se encontrou a oferta.</p></div>'
  const commentState = offerCommentFetchState.get(discussion.id)
  const commentStatus = commentState === 'loading' || commentState === 'loading-more'
    ? '<small class="comment-chain-note">Carregando comentários…</small>'
    : commentState === 'error'
      ? '<button class="load-comments-button" data-retry-comments>' + (commentError ? 'Falha ao buscar comentários. Tentar novamente' : 'Tentar carregar comentários novamente') + '</button>'
      : offerCommentsHaveMore.get(discussion.id)
        ? '<button class="load-comments-button" data-more-comments>Carregar comentários anteriores</button>'
        : ''
  document.querySelector('#offer-page').innerHTML = '<div class="offer-page-top"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Todas as ofertas</a><span class="chain-live">' + icon('check', 13) + ' Publicada na Hive</span></div><article class="offer-detail-card"><h1>' + title + '</h1><div class="offer-detail-grid"><section class="offer-product"><div class="offer-hero-media">' + image + '</div><div class="offer-product-meta"><div><span class="offer-kind-pill">' + escapeHTML(item.kind || 'Oferta') + '</span><span class="offer-time">' + icon('clock', 14) + ' ' + timeAgo(discussion.created) + '</span></div><p class="offer-seller">Vendido por <b class="store-mark ' + (store ? store.cls : '') + '">' + escapeHTML(item.store || 'Loja') + '</b><span class="seller-check">' + icon('check', 12) + '</span><span class="seller-by">· publicado por <a href="https://peakd.com/@' + escapeHTML(discussion.author) + '" target="_blank" rel="noopener noreferrer">@' + escapeHTML(discussion.author) + '</a></span></p>' + renderOfferPrice(item, 'offer-detail-price') + coupon + '<p class="offer-detail-description">' + escapeHTML(item.description || 'Sem detalhes adicionais.') + '</p><div class="offer-product-actions"><button class="vote-button ' + (currentAccount && discussion.votes[currentAccount] === 1 ? 'voted' : '') + '" data-detail-vote>' + icon('flame', 16) + ' ' + voteCount(discussion) + '</button><button class="share-button" data-detail-share aria-label="Compartilhar no WhatsApp">' + icon('whatsapp', 17) + ' Compartilhar</button>' + (safeUrl ? '<a class="store-cta" href="' + safeUrl + '" target="_blank" rel="sponsored nofollow noopener noreferrer">Ir à loja ' + icon('arrow', 16) + '</a>' : '') + '</div></section><section class="offer-discussion"><div class="comments-heading"><div><h2>Comentários <span>(' + discussion.comments.length + ')</span></h2></div><span class="comments-chain">' + icon('check', 13) + ' Hive</span></div><div class="offer-comments-list">' + comments + '</div>' + commentStatus + '<div data-reply-form-slot></div></section></div></article>' + renderRelatedOffers(discussion) + '<section class="offer-whatsapp-strip"><span class="whatsapp-symbol">' + icon('whatsapp', 23) + '</span><div><b>Compartilhe boas ofertas</b><p>Ajude mais pessoas a economizar.</p></div><button class="whatsapp-cta" data-detail-share>Compartilhar ' + icon('arrow', 15) + '</button></section>'

  page.querySelector('[data-reply-form-slot]').replaceWith(form)
  page.querySelector('.offer-comments-list').scrollTop = commentScrollTop
  form.querySelector('.current-comment-avatar').innerHTML = currentAccount
    ? escapeHTML(currentAccount.slice(0, 1).toUpperCase())
    : icon('user', 16)
  focusedField?.focus({ preventScroll: true })
  page.querySelectorAll('[data-reply-to]').forEach((button) => button.addEventListener('click', () => {
    if (form.querySelector('[type="submit"]').disabled) return
    setReplyTarget(form, commentsById.get(button.dataset.replyTo))
    form.elements.reply.focus()
  }))
  document.querySelector('[data-more-comments]')?.addEventListener('click', () => loadOfferComments(discussion.id, true))
  document.querySelector('[data-retry-comments]')?.addEventListener('click', () => { offerCommentFetchState.delete(discussion.id); loadOfferComments(discussion.id) })
  document.querySelector('[data-detail-vote]').addEventListener('click', async (event) => {
    if (!requireAccount()) return
    const button = event.currentTarget
    const value = discussion.votes[currentAccount] === 1 ? 0 : 1
    button.disabled = true
    try {
      await voteForOffer(currentAccount, discussion.id, value)
      addPendingOperation(currentAccount, { type: 'offer.vote', offerId: discussion.id, value })
      await loadOffers()
      showToast(value ? 'Voto publicado na Hive.' : 'Voto removido na Hive.')
    } catch (error) { showToast(error.message) }
    finally { button.disabled = false }
  })
  document.querySelectorAll('[data-detail-share]').forEach((button) => button.addEventListener('click', () => {
    const url = new URL(location.href)
    url.hash = offerHref(discussion.id).slice(1)
    window.open('https://wa.me/?text=' + encodeURIComponent(item.title + ' — ' + (item.price || '') + ' ' + url), '_blank', 'noopener,noreferrer')
  }))
  document.querySelectorAll('#offer-page [data-copy]').forEach((button) => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy); button.querySelector('span').textContent = 'Copiado!' }
    catch { showToast('Código do cupom: ' + button.dataset.copy) }
  }))
}

async function submitOfferReply(event) {
  event.preventDefault()
  if (!requireAccount()) return
  const form = event.currentTarget
  const submit = form.querySelector('button[type="submit"]')
  if (submit.disabled) return
  const error = form.querySelector('#reply-error')
  const body = form.elements.reply.value.trim()
  if (!body) {
    error.textContent = 'Escreva uma mensagem antes de publicar.'
    return
  }
  error.textContent = ''
  submit.disabled = true
  form.elements.reply.readOnly = true
  const cancel = form.querySelector('[data-cancel-reply]')
  cancel.disabled = true
  try {
    const { offerId, parentId = '' } = form.dataset
    const published = await publishReply(currentAccount, offerId, body, parentId)
    const { author, result, ...payload } = published
    addPendingOperation(author, payload)
    form.reset()
    setReplyTarget(form, null)
    renderOffers()
    const discussion = offers.find((entry) => entry.id === offerId)
    if (discussion && getRouteOfferId() === offerId) {
      renderOfferPage(discussion)
      const list = document.querySelector('.offer-comments-list')
      list.scrollTop = list.scrollHeight
    }
    showToast(parentId ? 'Resposta enviada para a Hive.' : 'Comentário enviado para a Hive.')
  } catch (replyError) { error.textContent = replyError.message }
  finally {
    submit.disabled = false
    form.elements.reply.readOnly = false
    cancel.disabled = false
  }
}

document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
  activeTab = button.dataset.tab
  document.querySelectorAll('[data-tab]').forEach((tab) => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)) })
  if (activeTab === 'Destaques' || activeTab === 'Recentes' || activeTab === 'Em alta') await loadOffers()
  else renderOffers()
}))
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  activeCategory = activeCategory === button.dataset.category ? 'Todas' : button.dataset.category
  document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item.dataset.category === activeCategory))
  renderOffers()
}))
document.querySelector('#store-filter').addEventListener('change', (event) => {
  activeStore = event.target.value
  renderOffers()
})
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
  displayMode = button.dataset.view
  document.querySelectorAll('[data-view]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
  document.querySelector('#offer-list').classList.toggle('grid-view', displayMode === 'grid')
}))
document.querySelectorAll('[data-quick-filter="Cupons"]').forEach((button) => button.addEventListener('click', () => {
  activeTab = 'Cupons'
  document.querySelectorAll('[data-tab]').forEach((tab) => { const selected = tab.dataset.tab === activeTab; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)) })
  if (location.hash !== '#deal-list') location.hash = 'deal-list'
  renderOffers()
}))
document.querySelectorAll('[data-focus-store]').forEach((button) => button.addEventListener('click', () => {
  if (mainNav.classList.contains('menu-open')) mobileMenu.click()
  if (location.hash !== '#deal-list') location.hash = 'deal-list'
  document.querySelector('#store-filter').focus({ preventScroll: true })
  document.querySelector('#store-filter').scrollIntoView({ block: 'center', behavior: 'smooth' })
}))
document.querySelector('#search-input').addEventListener('input', (event) => {
  searchTerm = event.target.value.trim().toLowerCase()
  renderOffers()
  if (getRouteOfferId()) location.hash = 'deal-list'
})
document.querySelector('#refresh-button').addEventListener('click', loadOffers)
document.querySelector('#load-more').addEventListener('click', loadOlderOperations)
document.querySelector('#post-button').addEventListener('click', () => { if (requireAccount()) document.querySelector('#publish-dialog').showModal() })
document.querySelector('#join-button').addEventListener('click', () => currentAccount ? (signOutFromHive(), currentAccount = '', setAccountUI(), renderCurrentRoute(), showToast('Sessão desconectada.')) : openLogin())
document.querySelector('#profile-button').addEventListener('click', () => currentAccount ? (signOutFromHive(), currentAccount = '', setAccountUI(), renderCurrentRoute(), showToast('Sessão desconectada.')) : openLogin())
const mobileMenu = document.querySelector('.mobile-menu')
const mainNav = document.querySelector('.main-nav')
mobileMenu.addEventListener('click', () => {
  const expanded = mainNav.classList.toggle('menu-open')
  mobileMenu.setAttribute('aria-expanded', String(expanded))
  mobileMenu.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu')
})
mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  if (mainNav.classList.contains('menu-open')) mobileMenu.click()
}))
document.querySelector('#share-site').addEventListener('click', () => window.open('https://wa.me/?text=' + encodeURIComponent('Encontre ofertas da comunidade no CUpom: ' + location.href), '_blank', 'noopener,noreferrer'))
document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => document.querySelector('#' + button.dataset.close).close()))

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const form = event.currentTarget
  const submit = form.querySelector('button[type="submit"]')
  const error = document.querySelector('#login-error')
  error.textContent = ''
  if (!window.hive_keychain) {
    error.textContent = 'Extensão Hive Keychain indisponível. Abra http://localhost:5175 no Chrome/Brave/Firefox com a extensão ativa e atualize a página.'
    return
  }
  submit.disabled = true
  submit.textContent = 'Aguardando Hive Keychain…'
  try {
    currentAccount = await signInWithKeychain(new FormData(form).get('username'))
    setAccountUI()
    document.querySelector('#login-dialog').close()
    renderCurrentRoute()
    showToast('Conectado como @' + currentAccount)
  } catch (loginError) { error.textContent = loginError.message }
  finally { submit.disabled = false; submit.innerHTML = 'Conectar conta ' + icon('arrow', 16) }
})

document.querySelector('#offer-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!requireAccount()) return
  const form = event.currentTarget
  const submit = form.querySelector('button[type="submit"]')
  const error = document.querySelector('#offer-error')
  error.textContent = ''
  const data = Object.fromEntries(new FormData(form).entries())
  if (!isSafeHttpUrl(data.affiliateUrl) || (data.image && !isSafeHttpUrl(data.image))) { error.textContent = 'Use links começando com http:// ou https://.'; return }
  data.storeTag = findStore(data.store).tag
  data.category = categories.some(({ name }) => name === data.category) ? data.category : 'Outros'
  data.tags = String(data.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5)
  submit.disabled = true
  submit.textContent = 'Confirme a publicação no Keychain…'
  try {
    const published = await publishOffer(currentAccount, data)
    addPendingOperation(currentAccount, { type: published.type, offerId: published.offerId, offer: published.offer })
    document.querySelector('#publish-dialog').close()
    form.reset()
    showToast('custom_json enviado para a Hive.')
    await loadOffers()
  } catch (publishError) { error.textContent = publishError.message }
  finally { submit.disabled = false; submit.innerHTML = 'Publicar na Hive ' + icon('arrow', 16) }
})

window.addEventListener('hashchange', () => {
  renderCurrentRoute()
  if (location.hash === '#top') window.scrollTo(0, 0)
  if (location.hash === '#deal-list') {
    document.getElementById(location.hash.slice(1)).scrollIntoView()
  }
})
window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    document.querySelector('#search-input').focus()
  }
})
setAccountUI()
loadOffers()
