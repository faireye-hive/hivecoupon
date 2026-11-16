const HIVE_NODES = ['https://api.hive.blog', 'https://api.openhive.network']
export const CUPOM_CUSTOM_JSON_ID = 'cupom_offers'
export const CUPOM_COMMENTS_CUSTOM_JSON_ID = 'cupom_comments'
const HAFSQL_ENDPOINT = 'https://rpc.mahdiyari.info/hafsql/operations/custom_json/'
const APP_VERSION = 1
let rpcId = 1
let nodeIndex = 0

async function hiveRpc(method, params = []) {
  let lastError
  for (let attempt = 0; attempt < HIVE_NODES.length; attempt += 1) {
    const node = HIVE_NODES[(nodeIndex + attempt) % HIVE_NODES.length]
    try {
      const response = await fetch(node, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'condenser_api.' + method, params, id: rpcId++ }),
      })
      if (!response.ok) throw new Error('Nó Hive respondeu HTTP ' + response.status)
      const payload = await response.json()
      if (payload.error) throw new Error(payload.error.message || 'Erro retornado pela API Hive')
      nodeIndex = (nodeIndex + attempt) % HIVE_NODES.length
      return payload.result
    } catch (error) { lastError = error }
  }
  throw new Error(lastError?.message || 'Não foi possível acessar um nó Hive.')
}

export async function accountExists(username) {
  const result = await hiveRpc('get_accounts', [[username]])
  return Array.isArray(result) && result.length > 0
}

export async function getCupomOperations({ start, limit = 1000, customId = CUPOM_CUSTOM_JSON_ID } = {}) {
  const query = new URLSearchParams({ limit: String(Math.min(Math.max(limit, 1), 1000)) })
  if (start) query.set('start', String(start))
  const response = await fetch(HAFSQL_ENDPOINT + encodeURIComponent(customId) + '?' + query, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('HAFSQL respondeu HTTP ' + response.status)
  const payload = await response.json()
  const operations = Array.isArray(payload) ? payload
    : Array.isArray(payload.result) ? payload.result
      : Array.isArray(payload.data) ? payload.data : null
  if (!operations) throw new Error(payload.error || 'Resposta do HAFSQL em formato inesperado.')
  return operations
}

export function parseCupomOperation(operation) {
  if (![CUPOM_CUSTOM_JSON_ID, CUPOM_COMMENTS_CUSTOM_JSON_ID].includes(operation.custom_id)) return null
  let value
  try { value = typeof operation.json === 'string' ? JSON.parse(operation.json) : operation.json }
  catch { return null }
  if (Array.isArray(value)) value = value.length > 1 ? value[1] : value[0]
  if (!value || ![CUPOM_CUSTOM_JSON_ID, CUPOM_COMMENTS_CUSTOM_JSON_ID].includes(value.app) || value.app !== operation.custom_id || value.version !== APP_VERSION || typeof value.type !== 'string') return null
  if (operation.custom_id === CUPOM_COMMENTS_CUSTOM_JSON_ID && value.type !== 'offer.comment') return null
  const author = (operation.required_posting_auths || operation.required_auths || [])[0]
  if (!author) return null
  return { operationId: String(operation.id), timestamp: operation.timestamp, author, payload: value }
}

function keychainRequest(run) {
  return new Promise((resolve, reject) => {
    if (!window.hive_keychain) return reject(new Error('Hive Keychain não foi encontrado. Ative a extensão no navegador.'))
    try {
      run(window.hive_keychain, (response) => {
        if (response?.success) resolve(response)
        else reject(new Error(response?.message || response?.error || 'A solicitação foi cancelada ou rejeitada no Keychain.'))
      })
    } catch (error) { reject(error) }
  })
}

export async function signInWithKeychain(username) {
  const normalized = username.trim().toLowerCase().replace(/^@/, '')
  if (!/^[a-z0-9][a-z0-9.-]{1,14}[a-z0-9]$/.test(normalized)) throw new Error('Digite um nome de conta Hive válido.')
  if (!await accountExists(normalized)) throw new Error('A conta @' + normalized + ' não foi encontrada na Hive.')
  const challenge = 'Login no CUpom | ' + crypto.randomUUID() + ' | ' + new Date().toISOString()
  await keychainRequest((keychain, callback) => keychain.requestSignBuffer(normalized, challenge, 'Posting', callback, null, 'Entrar no CUpom'))
  sessionStorage.setItem('cupom-hive-account', normalized)
  return normalized
}

export function signOutFromHive() {
  sessionStorage.removeItem('cupom-hive-account')
}

function makeId(prefix) {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
  let shortId = ''
  while (shortId.length < 12) {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    for (const byte of bytes) {
      if (byte < 248) shortId += alphabet[byte % alphabet.length]
      if (shortId.length === 12) break
    }
  }
  return prefix + '-' + shortId
}

function broadcastCupom(account, payload, label, customJsonId = CUPOM_CUSTOM_JSON_ID) {
  const json = JSON.stringify({ app: customJsonId, version: APP_VERSION, ...payload })
  return keychainRequest((keychain, callback) => {
    keychain.requestCustomJson(account, customJsonId, 'Posting', json, label, callback)
  })
}

export function publishOffer(account, offer) {
  const offerId = makeId('of')
  const payload = {
    type: 'offer.create',
    offerId,
    offer: {
      title: offer.title.trim(),
      store: offer.store,
      kind: offer.kind,
      price: offer.price.trim(),
      oldPrice: offer.oldPrice.trim(),
      coupon: offer.coupon.trim(),
      affiliateUrl: offer.affiliateUrl.trim(),
      image: offer.image.trim(),
      description: offer.description.trim(),
    },
  }
  return broadcastCupom(account, payload, 'Publicar oferta no CUpom').then((result) => ({ ...payload, author: account, result }))
}

export function publishReply(account, offerId, body, parentId = '') {
  const payload = { type: 'offer.comment', offerId, commentId: makeId('cm'), parentId, body: body.trim() }
  return broadcastCupom(account, payload, 'Comentar em oferta do CUpom', CUPOM_COMMENTS_CUSTOM_JSON_ID).then((result) => ({ ...payload, author: account, result }))
}

export function voteForOffer(account, offerId, value) {
  const payload = { type: 'offer.vote', offerId, value: value ? 1 : 0 }
  return broadcastCupom(account, payload, 'Votar em oferta do CUpom')
}

export function getStoredAccount() {
  return sessionStorage.getItem('cupom-hive-account') || ''
}

export function isSafeHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch { return false }
}
