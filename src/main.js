import './style.css'
import { getCupomOperations, parseCupomOperation, getStoredAccount, isSafeHttpUrl, publishOffer, publishReply, signInWithKeychain, signOutFromHive, voteForOffer, CUPOM_CUSTOM_JSON_ID } from './hive.js'

const icon = (name, size = 18) => {
  const paths = {
    search: '<circle cx="11" cy="11" r="7.2"/><path d="m16.5 16.5 4 4"/>',
    message: '<path d="M21 11.5a8.4 8.4 0 0 1-8.8 8.4 9.3 9.3 0 0 1-4-.9L3 20l1.1-4.4a8 8 0 0 1-1.1-4.1 8.4 8.4 0 0 1 8.8-8.4 8.4 8.4 0 0 1 9.2 8.4Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
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
  { name: 'Amazon', tag: 'amazon', cls: 'amazon', mark: 'amazon', caption: 'Tudo para você' },
  { name: 'Mercado Livre', tag: 'mercadolivre', cls: 'meli', mark: 'mercado\nlivre', caption: 'Frete grátis' },
  { name: 'AliExpress', tag: 'aliexpress', cls: 'ali', mark: 'AliExpress', caption: 'Achadinhos' },
  { name: 'Shopee', tag: 'shopee', cls: 'shopee', mark: 'S Shopee', caption: 'Cupons extras' },
  { name: 'Magalu', tag: 'magalu', cls: 'magalu', mark: 'magalu', caption: 'Ofertas do dia' },
]
let offers = []
let rawOperations = []
let operationsCursor = ''
const OPERATIONS_PAGE_SIZE = 100
let activeTab = 'Destaques'
let activeStore = ''
let searchTerm = ''
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
const plainPrice = (value = '') => value.replace(/[^\d,.]/g, '').replace(',', '.')
const findStore = (name) => stores.find((store) => store.name === name)
const offerHref = (id) => '#offer/' + encodeURIComponent(id)
const getRouteOfferId = () => {
  const match = location.hash.match(/^#offer\/(.+)$/) || location.hash.match(/^#offer-(.+)$/)
  if (!match) return ''
  try { return decodeURIComponent(match[1]) } catch { return match[1] }
}

document.querySelector('#app').innerHTML = [
  '<div class="announcement"><div class="announcement-inner"><span class="live-dot"></span><span>Ofertas publicadas diretamente na blockchain Hive.</span><a href="https://hive.io" target="_blank" rel="noopener noreferrer">Conheça a Hive ' + icon('arrow', 14) + '</a></div></div>',
  '<header class="site-header"><div class="nav-wrap"><a class="brand" href="#top" aria-label="CUpom início"><span class="brand-icon">' + icon('tag', 22) + '</span><span>CUpom<span class="brand-dot">.</span></span></a><a class="nav-link discussions" href="#deal-list">' + icon('message', 17) + ' <span>Comunidade Hive</span></a><label class="search-box">' + icon('search', 19) + '<input id="search-input" type="search" placeholder="Busque ofertas, cupons e lojas" autocomplete="off"><kbd>⌘ K</kbd></label><nav class="main-nav"><a class="nav-link" href="#stores">Lojas</a><a class="nav-link" href="#deal-list">Ofertas</a><a class="nav-link" href="#whatsapp">Compartilhar</a></nav><button class="post-button" id="post-button">' + icon('plus', 17) + '<span>Publicar</span></button><button class="profile-button" id="profile-button" aria-label="Entrar com Hive Keychain">' + icon('user', 18) + '<span class="account-label">Entrar</span></button><button class="mobile-menu" aria-label="Abrir menu">☰</button></div></header>',
  '<main id="top" class="page-shell"><section class="welcome-row"><div><p class="eyebrow">COMUNIDADE DE OFERTAS NA HIVE</p><h1>Economize e compartilhe boas ofertas<span>.</span></h1><p class="welcome-copy">Ofertas e interações são custom_json assinados por você e gravados na blockchain.</p></div><div class="welcome-stat"><span class="stat-icon">' + icon('flame', 20) + '</span><div><b>Dados atualizados</b><small>via HAFSQL</small></div></div></section>',
  '<section class="stores-section" id="stores"><div class="section-title"><div><h2>Filtrar por loja</h2><p>Veja ofertas publicadas pela comunidade.</p></div><button class="refresh-button" id="refresh-button">Atualizar ' + icon('arrow', 14) + '</button></div><div class="store-grid">' + stores.map((store) => '<button class="store-chip ' + store.cls + '" data-store="' + store.name + '"><span class="store-logo">' + store.mark.split('\n').map((line) => '<span>' + line + '</span>').join('') + '</span><span class="store-caption">' + store.caption + '</span></button>').join('') + '</div></section>',
  '<section class="feed-layout"><div class="feed-column"><div class="feed-head"><div class="tabs" role="tablist" aria-label="Ordenar ofertas">' + ['Destaques', 'Recentes', 'Cupons', 'Mais baratos'].map((tab, i) => '<button role="tab" aria-selected="' + (i === 0) + '" class="feed-tab ' + (i === 0 ? 'active' : '') + '" data-tab="' + tab + '">' + tab + '</button>').join('') + '</div><span class="chain-live">' + icon('check', 13) + ' Hive</span></div><div id="feed-status" class="feed-status">Carregando operações custom_json via HAFSQL…</div><div id="deal-list" class="deal-list"></div><button id="load-more" class="load-more-button" hidden>Carregar operações anteriores</button></div>',
  '<aside class="sidebar"><section class="side-card join-card"><div class="side-icon">' + icon('user', 20) + '</div><p class="side-kicker">SUA CONTA HIVE</p><h2>Publique ofertas com sua conta.</h2><p>Entre com Hive Keychain. A extensão assina cada custom_json; o site nunca recebe sua chave.</p><button class="primary-button" id="join-button">Conectar Keychain ' + icon('arrow', 16) + '</button><div class="member-note"><span>Permissão Posting solicitada em cada ação</span></div></section><section class="side-card whatsapp-card" id="whatsapp"><div class="whatsapp-symbol">' + icon('whatsapp', 23) + '</div><div><p class="side-kicker">ESPALHE A OFERTA</p><h3>Ajude mais pessoas a economizar.</h3><p>Compartilhe o CUpom pelo WhatsApp.</p></div><button class="whatsapp-cta" id="share-site">Compartilhar site ' + icon('arrow', 15) + '</button><small>Links de afiliados podem gerar comissão.</small></section><section class="side-card tip-card"><span class="tip-icon">✦</span><div><b>Transparência</b><p>Ofertas e interações são publicadas por contas Hive em <code>' + CUPOM_CUSTOM_JSON_ID + '</code>.</p></div></section></aside></section>',
  '<section id="offer-page" class="offer-page" hidden aria-live="polite"></section><footer class="site-footer"><span>© 2026 CUpom</span><span>Ofertas armazenadas na blockchain Hive. Links de afiliados podem gerar comissão, sem custo extra.</span><a href="https://peakd.com" target="_blank" rel="noopener noreferrer">Explorar Hive ↗</a></footer></main><div class="toast" id="toast" role="status"></div>',
  '<dialog id="login-dialog" class="publish-dialog"><form id="login-form"><button type="button" class="dialog-close" data-close="login-dialog" aria-label="Fechar">×</button><span class="dialog-mark">' + icon('user', 22) + '</span><p class="eyebrow">AUTENTICAÇÃO SEGURA</p><h2>Entrar com Hive Keychain</h2><p class="dialog-copy">Digite sua conta Hive. O Keychain pedirá para assinar um desafio de login com a chave Posting.</p><label>Conta Hive<input name="username" placeholder="seu-usuario" autocomplete="username" required minlength="3" maxlength="16"></label><p class="form-error" id="login-error"></p><button class="primary-button" type="submit">Conectar conta ' + icon('arrow', 16) + '</button><small class="security-note">Nunca cole sua chave privada neste site.</small></form></dialog>',
  '<dialog id="publish-dialog" class="publish-dialog wide-dialog"><form id="offer-form"><button type="button" class="dialog-close" data-close="publish-dialog" aria-label="Fechar">×</button><span class="dialog-mark">' + icon('tag', 22) + '</span><p class="eyebrow">CUSTOM_JSON · ' + CUPOM_CUSTOM_JSON_ID + '</p><h2>Compartilhar uma oferta</h2><p class="dialog-copy">A oferta será gravada como custom_json na blockchain. Revise os dados antes de confirmar no Keychain.</p><label>Título<input name="title" required maxlength="120" placeholder="Ex.: Fone Bluetooth com 40% OFF"></label><div class="form-row"><label>Loja<select name="store" required>' + stores.map((store) => '<option value="' + store.name + '">' + store.name + '</option>').join('') + '</select></label><label>Tipo<select name="kind"><option value="Oferta">Oferta</option><option value="Cupom">Cupom</option></select></label></div><div class="form-row"><label>Preço atual<input name="price" required maxlength="30" placeholder="R$ 179,90"></label><label>Preço anterior<input name="oldPrice" maxlength="30" placeholder="Opcional"></label></div><div class="form-row"><label>Código do cupom<input name="coupon" maxlength="40" placeholder="Opcional"></label><label>Imagem (URL)<input name="image" type="url" placeholder="https://… (opcional)"></label></div><label>Link da oferta / afiliado<input name="affiliateUrl" type="url" required placeholder="https://sua-loja.com/produto"></label><label>Detalhes<textarea name="description" rows="3" maxlength="600" placeholder="Explique as condições, validade ou como ativar o cupom."></textarea></label><p class="form-error" id="offer-error"></p><button class="primary-button" type="submit">Publicar na Hive ' + icon('arrow', 16) + '</button></form></dialog>',
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

function renderOffers() {
  const root = document.querySelector('#deal-list')
  let list = [...offers]
  if (activeStore) list = list.filter(({ offer }) => offer.store === activeStore)
  if (activeTab === 'Cupons') list = list.filter(({ offer }) => offer.kind === 'Cupom' || offer.coupon)
  if (activeTab === 'Mais baratos') list.sort((a, b) => Number(plainPrice(a.offer.price)) - Number(plainPrice(b.offer.price)))
  if (activeTab === 'Destaques') list.sort((a, b) => voteCount(b) - voteCount(a))
  if (searchTerm) list = list.filter((item) => (item.offer.title + ' ' + item.author + ' ' + item.offer.store + ' ' + (item.offer.coupon || '') + ' ' + item.offer.description).toLowerCase().includes(searchTerm))
  if (!list.length) {
    const empty = offers.length ? 'Nenhuma oferta com esses filtros' : 'Ainda não há ofertas do CUpom'
    const detail = offers.length ? 'Tente outro termo ou loja.' : 'Seja a primeira pessoa a publicar uma oferta na blockchain Hive.'
    root.innerHTML = '<div class="empty-state"><div class="empty-icon">' + icon('search', 24) + '</div><strong>' + empty + '</strong><span>' + detail + '</span><button class="clear-filter">' + (offers.length ? 'Limpar filtros' : 'Publicar a primeira oferta') + '</button></div>'
    root.querySelector('.clear-filter').addEventListener('click', () => {
      if (!offers.length) { if (requireAccount()) document.querySelector('#publish-dialog').showModal(); return }
      activeStore = ''; searchTerm = ''; document.querySelector('#search-input').value = ''; document.querySelectorAll('.store-chip').forEach((chip) => chip.classList.remove('selected')); renderOffers()
    })
    return
  }
  root.innerHTML = list.map((discussion) => {
    const item = discussion.offer
    const store = findStore(item.store)
    const url = isSafeHttpUrl(item.affiliateUrl) ? escapeHTML(item.affiliateUrl) : ''
    const title = escapeHTML(item.title || 'Oferta da comunidade')
    const author = escapeHTML(discussion.author)
    const preview = escapeHTML(item.description || '')
    const image = isSafeHttpUrl(item.image)
      ? '<img class="real-offer-image" src="' + escapeHTML(item.image) + '" alt="Imagem da oferta: ' + title + '" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="deal-art art-' + (store ? store.cls : 'coupon') + '"><span class="art-badge">' + escapeHTML(item.kind || 'Oferta') + '</span><span class="art-symbol">' + (item.kind === 'Cupom' ? '🏷️' : '🛍️') + '</span><span class="art-label">' + escapeHTML(item.store || 'Hive') + '</span></div>'
    const voted = currentAccount && discussion.votes[currentAccount] === 1
    const oldPrice = item.oldPrice ? '<span class="old-price">' + escapeHTML(item.oldPrice) + '</span>' : ''
    const coupon = item.coupon ? '<button class="coupon-code" data-copy="' + escapeHTML(item.coupon) + '" aria-label="Copiar cupom">' + icon('tag', 15) + ' <b>' + escapeHTML(item.coupon) + '</b><span>Copiar</span></button>' : ''
    return '<article class="deal-card" id="offer-' + escapeHTML(discussion.id) + '" data-offerid="' + escapeHTML(discussion.id) + '"><div class="deal-topline"><div class="avatar">' + author.slice(0, 1).toUpperCase() + '</div><a class="username" href="https://peakd.com/@' + author + '" target="_blank" rel="noopener noreferrer">@' + author + '</a><span class="trusted" title="Operação carregada do HAFSQL">' + icon('check', 12) + '</span><span class="time">' + icon('clock', 14) + ' ' + timeAgo(discussion.created) + '</span></div><div class="deal-content deal-open-link" data-open-offer>' + image + '<div class="deal-info"><div class="deal-heading"><span class="deal-type">' + escapeHTML(item.kind || 'Oferta') + '</span><h2><a class="deal-title-link" href="' + offerHref(discussion.id) + '">' + title + '</a></h2></div><p class="offer-description">' + preview + '</p><div class="price-row">' + oldPrice + '<strong>' + escapeHTML(item.price || 'Consulte a loja') + '</strong><span class="sold-by">em <span class="store-mark ' + (store ? store.cls : '') + '">' + escapeHTML(item.store || 'Loja') + '</span></span></div>' + coupon + '</div></div><div class="deal-card-bottom"><div class="deal-actions"><button class="vote-button ' + (voted ? 'voted' : '') + '" data-vote aria-label="' + (voted ? 'Remover voto' : 'Votar') + ' nesta oferta">' + icon('flame', 16) + ' <b>' + voteCount(discussion) + '</b></button><a class="comment-button" href="' + offerHref(discussion.id) + '" aria-label="Abrir comentários">' + icon('message', 16) + ' <span>' + discussion.comments.length + '</span></a><button class="share-button" data-share aria-label="Compartilhar no WhatsApp">' + icon('whatsapp', 17) + '</button></div><a class="deal-cta" href="' + offerHref(discussion.id) + '">Ver oferta ' + icon('arrow', 16) + '</a></div></article>'
  }).join('')
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
  root.querySelectorAll('[data-open-offer]').forEach((surface) => surface.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) return
    location.hash = offerHref(surface.closest('.deal-card').dataset.offerid).slice(1)
  }))
}

function voteCount(offer) { return Object.values(offer.votes).filter((value) => value === 1).length }

function addPendingOperation(author, payload) {
  rawOperations.push({ custom_id: CUPOM_CUSTOM_JSON_ID, id: 'local-' + Date.now() + '-' + Math.random(), timestamp: new Date().toISOString(), required_posting_auths: [author], json: JSON.stringify({ app: CUPOM_CUSTOM_JSON_ID, version: 1, ...payload }) })
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
  status.textContent = 'Consultando custom_json no HAFSQL…'
  status.classList.remove('error-status')
  try {
    const chainOperations = await getCupomOperations({ limit: OPERATIONS_PAGE_SIZE })
    if (chainOperations.length) operationsCursor = String(chainOperations[chainOperations.length - 1].id)
    rawOperations = mergeOperations(rawOperations, chainOperations)
    rebuildOffers()
    renderOffers()
    renderCurrentRoute()
    document.querySelector('#load-more').hidden = chainOperations.length < OPERATIONS_PAGE_SIZE
    status.textContent = offers.length + ' ofertas · operações recentes do custom_id ' + CUPOM_CUSTOM_JSON_ID
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
  if (!operationsCursor || button.disabled) return
  button.disabled = true
  button.textContent = 'Carregando…'
  try {
    const older = await getCupomOperations({ start: operationsCursor, limit: OPERATIONS_PAGE_SIZE })
    if (older.length) {
      rawOperations = mergeOperations(rawOperations, older)
      operationsCursor = String(older[older.length - 1].id)
      rebuildOffers()
      renderOffers()
      renderCurrentRoute()
    }
    button.hidden = older.length < OPERATIONS_PAGE_SIZE
  } catch (error) {
    showToast('Não foi possível carregar operações anteriores: ' + error.message)
  } finally {
    button.disabled = false
    button.textContent = 'Carregar operações anteriores'
  }
}

function renderCurrentRoute() {
  const offerId = getRouteOfferId()
  const page = document.querySelector('#offer-page')
  const homeElements = [document.querySelector('.welcome-row'), document.querySelector('#stores'), document.querySelector('.feed-layout'), document.querySelector('.site-footer')]
  homeElements.forEach((element) => { element.hidden = Boolean(offerId) })
  page.hidden = !offerId
  if (!offerId) return

  const discussion = offers.find((entry) => entry.id === offerId)
  if (discussion) {
    renderOfferPage(discussion)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  page.innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Procurando esta oferta na Hive…</strong><span>Consultando o histórico de operações custom_json.</span></div></div>'
  findOfferInHistory(offerId)
}

async function findOfferInHistory(offerId) {
  const token = ++routeSearchToken
  let cursor = operationsCursor
  try {
    while (cursor && token === routeSearchToken && getRouteOfferId() === offerId) {
      const older = await getCupomOperations({ start: cursor, limit: OPERATIONS_PAGE_SIZE })
      if (!older.length || String(older[older.length - 1].id) === cursor) break
      rawOperations = mergeOperations(rawOperations, older)
      cursor = String(older[older.length - 1].id)
      operationsCursor = cursor
      rebuildOffers()
      if (offers.some((entry) => entry.id === offerId)) {
        renderOffers()
        renderCurrentRoute()
        return
      }
      if (older.length < OPERATIONS_PAGE_SIZE) break
    }
    if (token === routeSearchToken && getRouteOfferId() === offerId) {
      document.querySelector('#offer-page').innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Não encontramos esta oferta</strong><span>Ela pode não estar no histórico consultado ou o link pode estar incorreto.</span></div></div>'
    }
  } catch (error) {
    if (token === routeSearchToken) document.querySelector('#offer-page').innerHTML = '<div class="offer-not-found"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Voltar às ofertas</a><div class="empty-state"><strong>Não foi possível abrir a oferta</strong><span>' + escapeHTML(error.message) + '</span></div></div>'
  }
}

function renderOfferPage(discussion) {
  const item = discussion.offer
  const store = findStore(item.store)
  const safeUrl = isSafeHttpUrl(item.affiliateUrl) ? escapeHTML(item.affiliateUrl) : ''
  const title = escapeHTML(item.title || 'Oferta da comunidade')
  const image = isSafeHttpUrl(item.image)
    ? '<img class="offer-hero-image" src="' + escapeHTML(item.image) + '" alt="Imagem da oferta: ' + title + '" referrerpolicy="no-referrer">'
    : '<div class="offer-hero-art art-' + (store ? store.cls : 'coupon') + '"><span class="art-symbol">' + (item.kind === 'Cupom' ? '🏷️' : '🛍️') + '</span><span class="art-label">' + escapeHTML(item.store || 'CUpom') + '</span></div>'
  const coupon = item.coupon ? '<button class="coupon-code detail-coupon" data-copy="' + escapeHTML(item.coupon) + '">' + icon('tag', 15) + ' <b>' + escapeHTML(item.coupon) + '</b><span>Copiar</span></button>' : ''
  const comments = discussion.comments.length
    ? discussion.comments.map((reply) => '<article class="offer-comment"><div class="comment-avatar">' + escapeHTML(reply.author.slice(0, 1).toUpperCase()) + '</div><div class="offer-comment-content"><header><a href="https://peakd.com/@' + escapeHTML(reply.author) + '" target="_blank" rel="noopener noreferrer">@' + escapeHTML(reply.author) + '</a><time>' + timeAgo(reply.created) + '</time></header><p>' + escapeHTML(reply.body) + '</p></div></article>').join('')
    : '<div class="comments-empty"><span class="empty-comment-icon">' + icon('message', 19) + '</span><b>A conversa começa aqui</b><p>Compartilhe uma dúvida ou conte se encontrou a oferta.</p></div>'
  document.querySelector('#offer-page').innerHTML = '<div class="offer-page-top"><a href="#top" class="offer-back">' + icon('arrow', 15) + ' Todas as ofertas</a><span class="chain-live">' + icon('check', 13) + ' Publicada na Hive</span></div><article class="offer-detail-card"><h1>' + title + '</h1><div class="offer-detail-grid"><section class="offer-product"><div class="offer-hero-media">' + image + '</div><div class="offer-product-meta"><div><span class="offer-kind-pill">' + escapeHTML(item.kind || 'Oferta') + '</span><span class="offer-time">' + icon('clock', 14) + ' ' + timeAgo(discussion.created) + '</span></div><p class="offer-seller">Vendido por <b class="store-mark ' + (store ? store.cls : '') + '">' + escapeHTML(item.store || 'Loja') + '</b><span class="seller-check">' + icon('check', 12) + '</span><span class="seller-by">· publicado por <a href="https://peakd.com/@' + escapeHTML(discussion.author) + '" target="_blank" rel="noopener noreferrer">@' + escapeHTML(discussion.author) + '</a></span></p><div class="offer-detail-price"><strong>' + escapeHTML(item.price || 'Consulte a loja') + '</strong>' + (item.oldPrice ? '<del>' + escapeHTML(item.oldPrice) + '</del>' : '') + '</div>' + coupon + '<p class="offer-detail-description">' + escapeHTML(item.description || 'Sem detalhes adicionais.') + '</p><div class="offer-product-actions"><button class="vote-button ' + (currentAccount && discussion.votes[currentAccount] === 1 ? 'voted' : '') + '" data-detail-vote>' + icon('flame', 16) + ' ' + voteCount(discussion) + '</button><button class="share-button" data-detail-share aria-label="Compartilhar no WhatsApp">' + icon('whatsapp', 17) + ' Compartilhar</button>' + (safeUrl ? '<a class="store-cta" href="' + safeUrl + '" target="_blank" rel="sponsored nofollow noopener noreferrer">Ir à loja ' + icon('arrow', 16) + '</a>' : '') + '</div></section><section class="offer-discussion"><div class="comments-heading"><div><p class="eyebrow">CONVERSA DA COMUNIDADE</p><h2>Comentários <span>(' + discussion.comments.length + ')</span></h2></div><span class="comments-chain">' + icon('check', 13) + ' Hive</span></div><div class="offer-comments-list">' + comments + '</div><form id="reply-form" class="offer-reply-form"><label class="comment-avatar current-comment-avatar">' + (currentAccount ? escapeHTML(currentAccount.slice(0, 1).toUpperCase()) : icon('user', 16)) + '</label><textarea name="reply" rows="2" maxlength="1000" placeholder="Participe da conversa" required></textarea><button type="submit" aria-label="Publicar comentário" title="Publicar comentário">➤</button><p class="form-error" id="reply-error"></p></form><small class="comment-chain-note">Seu comentário será publicado na blockchain Hive via Keychain.</small></section></div></article><div class="offer-lower-grid"><section class="offer-whatsapp-strip"><span class="whatsapp-symbol">' + icon('whatsapp', 23) + '</span><div><b>Compartilhe boas ofertas</b><p>Ajude mais pessoas a economizar.</p></div><button class="whatsapp-cta" data-detail-share>Compartilhar ' + icon('arrow', 15) + '</button></section><aside class="offer-side-card"><p class="side-kicker">CUPOM · ' + escapeHTML(item.store || 'LOJAS') + '</p><h3>Outras ofertas que você pode gostar</h3><p>Explore cupons e oportunidades publicados pela comunidade Hive.</p><a href="#top">Ver todas as ofertas ' + icon('arrow', 15) + '</a></aside></div>'

  document.querySelector('#reply-form').addEventListener('submit', submitOfferReply)
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
  const error = document.querySelector('#reply-error')
  error.textContent = ''
  submit.disabled = true
  try {
    const offerId = getRouteOfferId()
    const published = await publishReply(currentAccount, offerId, new FormData(form).get('reply'))
    addPendingOperation(currentAccount, { type: published.type, offerId: published.offerId, commentId: published.commentId, parentId: published.parentId, body: published.body })
    await loadOffers()
    showToast('Comentário enviado para a Hive.')
  } catch (replyError) { error.textContent = replyError.message }
  finally { submit.disabled = false }
}

document.querySelectorAll('[data-store]').forEach((button) => button.addEventListener('click', () => {
  activeStore = activeStore === button.dataset.store ? '' : button.dataset.store
  document.querySelectorAll('[data-store]').forEach((chip) => chip.classList.toggle('selected', chip.dataset.store === activeStore))
  renderOffers()
}))
document.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', async () => {
  activeTab = button.dataset.tab
  document.querySelectorAll('[data-tab]').forEach((tab) => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)) })
  if (activeTab === 'Destaques' || activeTab === 'Recentes') await loadOffers()
  else renderOffers()
}))
document.querySelector('#search-input').addEventListener('input', (event) => { searchTerm = event.target.value.trim().toLowerCase(); renderOffers() })
document.querySelector('#refresh-button').addEventListener('click', loadOffers)
document.querySelector('#load-more').addEventListener('click', loadOlderOperations)
document.querySelector('#post-button').addEventListener('click', () => { if (requireAccount()) document.querySelector('#publish-dialog').showModal() })
document.querySelector('#join-button').addEventListener('click', () => currentAccount ? (signOutFromHive(), currentAccount = '', setAccountUI(), renderCurrentRoute(), showToast('Sessão desconectada.')) : openLogin())
document.querySelector('#profile-button').addEventListener('click', () => currentAccount ? (signOutFromHive(), currentAccount = '', setAccountUI(), renderCurrentRoute(), showToast('Sessão desconectada.')) : openLogin())
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.main-nav').classList.toggle('menu-open'))
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

window.addEventListener('hashchange', renderCurrentRoute)
setAccountUI()
loadOffers()
