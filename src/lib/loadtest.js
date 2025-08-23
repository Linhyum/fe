/**
 * Load Test Script (rev7-fix) — Fix triệt để /cart/select-items
 * - Bắt đúng cartItemId từ /cart/add (nếu fail thì fetch cart để map)
 * - PUT /cart/select-items?userId=... với body là mảng [cartItemId,...]
 * - HTTP Keep-Alive, Global concurrency, Endpoint-level limiter, Adaptive backoff
 * - Log lỗi chi tiết + latency per-endpoint
 */

const http = require('http')
const https = require('https')
const axiosBase = require('axios')

// ================== CONFIG ==================
const BASE_URL = 'https://api.bedeploy.online/api/v1'

const TOTAL_USERS = 500
const TEST_DURATION = 5 * 60 * 1000
const LOGIN_BATCH_SIZE = 25
const LOGIN_DELAY = 3000
const PASSWORD = '123123'

// Concurrency & timeout
const MAX_CONCURRENCY = 80
const REQ_TIMEOUT = 15000

// Adaptive Backoff
const DEGRADED_WINDOW_MS = 30_000
const DEGRADED_THRESHOLD = 60
const BACKOFF_MS = 5_000
// =============================================

// ===== HTTP keep-alive =====
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: MAX_CONCURRENCY })
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: MAX_CONCURRENCY })

const axios = axiosBase.create({
   httpAgent,
   httpsAgent,
   timeout: REQ_TIMEOUT,
   validateStatus: () => true,
   headers: { 'Content-Type': 'application/json' }
})

// ================== SEMAPHORE ==================
class Semaphore {
   constructor(max) {
      this.max = max
      this.current = 0
      this.queue = []
   }
   async acquire() {
      if (this.current < this.max) {
         this.current++
         return
      }
      await new Promise((res) => this.queue.push(res))
      this.current++
   }
   release() {
      this.current--
      if (this.queue.length) {
         const next = this.queue.shift()
         next()
      }
   }
   async withLock(fn) {
      await this.acquire()
      try {
         return await fn()
      } finally {
         this.release()
      }
   }
}
const globalSem = new Semaphore(MAX_CONCURRENCY)

// ===== Endpoint-level limiters cho các truy vấn nặng DB =====
const endpointLimiters = [
   { name: 'SEARCH', pattern: /\/products\?keyword=/, limiter: new Semaphore(10) },
   { name: 'NEW_ARRIVALS', pattern: /\/products\?filterType=NEW_ARRIVALS/, limiter: new Semaphore(10) },
   { name: 'BRAND_SORT', pattern: /\/products\?brand=.*sortBy=price.*sortDir=/, limiter: new Semaphore(10) }
]
function getEndpointLimiter(url) {
   for (const e of endpointLimiters) if (e.pattern.test(url)) return e.limiter
   return null
}

// ================== STATS ==================
let totalRequests = 0
let successCount = 0
let errorCount = 0
const allResponseTimes = []
const successResponseTimes = []

const errorByType = new Map()
const endpointStats = new Map()
const errorSamplesByEndpoint = new Map()
const latencyByEndpointOk = new Map()

function bump(map, key, delta = 1) {
   map.set(key, (map.get(key) || 0) + delta)
}
function recordEndpoint(endpointKey, ok) {
   const cur = endpointStats.get(endpointKey) || { ok: 0, fail: 0 }
   ok ? cur.ok++ : cur.fail++
   endpointStats.set(endpointKey, cur)
}
function pushErrorSample(endpointKey, sample) {
   const set = errorSamplesByEndpoint.get(endpointKey) || new Set()
   if (set.size < 5) set.add(sample)
   errorSamplesByEndpoint.set(endpointKey, set)
}
function recordLatencyOk(ep, dur) {
   const arr = latencyByEndpointOk.get(ep) || []
   arr.push(dur)
   if (arr.length > 5000) arr.splice(0, arr.length - 5000)
   latencyByEndpointOk.set(ep, arr)
}

// ================== HEALTH / BACKOFF ==================
const health = { backoffUntil: 0, degradeEvents: [] }
function noteDegradedSignal() {
   const now = Date.now()
   health.degradeEvents.push(now)
   const cutoff = now - DEGRADED_WINDOW_MS
   while (health.degradeEvents.length && health.degradeEvents[0] < cutoff) {
      health.degradeEvents.shift()
   }
   if (health.degradeEvents.length >= DEGRADED_THRESHOLD) {
      health.backoffUntil = Math.max(health.backoffUntil, now + BACKOFF_MS)
      health.degradeEvents.length = 0
   }
}
function inBackoff() {
   return Date.now() < health.backoffUntil
}

// ================== USERS ==================
const USERS = Array.from({ length: TOTAL_USERS }, (_, i) => {
   const num = String(i + 1).padStart(4, '0')
   return {
      userId: i + 1,
      userName: `user${num}`,
      password: PASSWORD,
      cartProductIds: new Set(), // productId đã add
      cartItemIds: new Set(), // cartItemId (ID bản ghi trong cart)
      wishSet: new Set()
   }
})

function sleep(ms) {
   return new Promise((res) => setTimeout(res, ms))
}

// ================== RANDOM HELPERS ==================
function randomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomProductId() {
   return Math.floor(Math.random() * 7824) + 1
}
function randomKeyword() {
   const keywords = ['camera', 'laptop', 'phone', 'watch', 'mouse']
   return keywords[Math.floor(Math.random() * keywords.length)]
}
function randomBrand() {
   const brands = [
      'VideoSecu',
      'Barnes & Noble',
      'LASUS',
      'Sony',
      'RCA',
      'Belkin',
      'Brother',
      'Kensington',
      'Koss',
      'Olympus',
      'Sangean',
      'Seagate',
      'NETGEAR',
      'Linksys',
      'Monster',
      'MMUSC',
      'Viking',
      'Garmin',
      'Bushnell',
      'Sennheiser',
      'Panasonic'
   ]
   return brands[randomInt(0, brands.length - 1)]
}
function randomPhone() {
   return '09' + Math.floor(10000000 + Math.random() * 89999999)
}
function randomAddress() {
   const streets = ['Nguyen Van A', 'Le Loi', 'Tran Hung Dao', 'Vo Thi Sau', 'Pham Ngu Lao']
   const districts = ['Q1', 'Q3', 'Q5', 'Q7', 'Binh Thanh']
   return `${randomInt(1, 999)} ${streets[randomInt(0, streets.length - 1)]}, ${
      districts[randomInt(0, districts.length - 1)]
   }, TP.HCM`
}
function pickWeighted(items) {
   const sum = items.reduce((s, it) => s + it.weight, 0)
   let r = Math.random() * sum
   for (const it of items) {
      r -= it.weight
      if (r < 0) return it.fn
   }
   return items[items.length - 1].fn
}

// ================== LOGIN ==================
async function loginUser(user) {
   try {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
         userName: user.userName,
         password: user.password
      })
      const token = res?.data?.data?.token
      if (!token) {
         console.error(`⚠️ Login fail (no token) cho ${user.userName} - HTTP_${res.status}`)
         return null
      }
      return { ...user, token }
   } catch (err) {
      const status = err.response?.status
      const code = err.code
      console.error(`❌ Login fail cho ${user.userName} - ${status ? 'HTTP_' + status : code || 'UNKNOWN'}`)
      return null
   }
}

async function loginAllUsersInBatches(users, batchSize, delayMs) {
   const loggedInUsers = []
   for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const results = await Promise.all(batch.map(loginUser))
      loggedInUsers.push(...results.filter(Boolean))
      await sleep(delayMs)
   }
   return loggedInUsers
}

// ================== MEASURE (with optional response capture) ==================
function endpointKeyFromUrl(url) {
   try {
      const u = new URL(url)
      return u.pathname
   } catch {
      return url
   }
}

async function doAxiosCall(method, url, data, headers, timeoutMs) {
   if (method === 'GET') return axios.get(url, { headers, timeout: timeoutMs })
   if (method === 'POST') return axios.post(url, data ?? {}, { headers, timeout: timeoutMs })
   if (method === 'PUT') return axios.put(url, data ?? {}, { headers, timeout: timeoutMs })
   if (method === 'DELETE') return axios.delete(url, { headers, timeout: timeoutMs })
   throw new Error(`Unsupported method: ${method}`)
}

async function measureRequest(method, url, data = null, token = null, opts = {}) {
   const { timeoutMs, retryOnTimeout = 0, captureResponse = false } = opts
   const endpointKey = endpointKeyFromUrl(url)
   const headers = {}
   if (token) headers['Authorization'] = `Bearer ${token}`

   let attempt = 0
   let ok = false
   let errType = 'ok'
   let status = 0
   let duration = 0
   let respData = undefined

   while (true) {
      const start = Date.now()

      const runCall = async () => {
         try {
            const res = await doAxiosCall(method, url, data, headers, timeoutMs)
            status = res?.status ?? 0
            if (captureResponse) respData = res?.data
            ok = status >= 200 && status < 400
            if (!ok) {
               errType = `HTTP_${status}`
               const msg = res?.data?.message || res?.data?.error || JSON.stringify(res?.data || {})
               pushErrorSample(endpointKey, `${errType}: ${msg}`.slice(0, 300))
               if (msg && /JPA EntityManager|rollback|Out of sort memory|Out of memory/i.test(String(msg))) {
                  noteDegradedSignal()
               }
            }
         } catch (e) {
            if (e.code) {
               errType = e.code
            } else if (e.response) {
               status = e.response.status
               errType = `HTTP_${status}`
               const msg =
                  e.response?.data?.message || e.response?.data?.error || JSON.stringify(e.response?.data || {})
               pushErrorSample(endpointKey, `${errType}: ${msg}`.slice(0, 300))
               if (msg && /JPA EntityManager|rollback|Out of sort memory|Out of memory/i.test(String(msg))) {
                  noteDegradedSignal()
               }
            } else {
               errType = 'UNKNOWN'
               pushErrorSample(endpointKey, `ERR: ${e?.message || String(e)}`.slice(0, 300))
            }
         }
      }

      const epLimiter = getEndpointLimiter(url)
      await globalSem.withLock(() => (epLimiter ? epLimiter.withLock(runCall) : runCall()))
      duration = Date.now() - start

      if (ok) break
      if (errType === 'ECONNABORTED' && attempt < retryOnTimeout) {
         attempt++
         noteDegradedSignal()
         await sleep(200 + attempt * 200)
         continue
      }
      break
   }

   allResponseTimes.push(duration)
   totalRequests++
   recordEndpoint(endpointKey, ok)
   if (ok) {
      successCount++
      successResponseTimes.push(duration)
      recordLatencyOk(endpointKey, duration)
   } else {
      errorCount++
      bump(errorByType, errType)
   }

   return { ok, status, errType, duration, endpointKey, data: respData }
}

// ================== CART HELPERS ==================
// Cố gắng trích cartItemId từ response /cart/add theo các cấu trúc thường gặp
function extractCartItemIdFromAddResponse(respData, pid) {
   const d = respData?.data ?? respData
   if (!d) return null
   if (typeof d?.id === 'number' && (d.productId === undefined || d.productId === pid)) return d.id
   if (typeof d?.cartItemId === 'number') return d.cartItemId
   if (typeof d?.cartItem?.id === 'number') return d.cartItem.id
   const items = d.items || d.cartItems || d.cart || d.data || []
   if (Array.isArray(items)) {
      const found = items.find((it) => it?.productId === pid || it?.product?.id === pid)
      if (found && typeof found.id === 'number') return found.id
   }
   if (d.cart && Array.isArray(d.cart.items)) {
      const found = d.cart.items.find((it) => it?.productId === pid || it?.product?.id === pid)
      if (found && typeof found.id === 'number') return found.id
   }
   return null
}

// Thử fetch cart để map productId -> cartItemId và biết item nào đang selected
async function tryFetchCartSnapshot(user) {
   const endpoints = [`${BASE_URL}/cart?userId=${user.userId}`, `${BASE_URL}/carts?userId=${user.userId}`]
   for (const url of endpoints) {
      const res = await measureRequest('GET', url, null, user.token, { captureResponse: true })
      if (!res.ok) continue
      const d = res.data?.data ?? res.data
      const items = d?.items || d?.cartItems || d || []
      const list = Array.isArray(items) ? items : Array.isArray(d) ? d : []
      const result = []
      for (const it of list) {
         const cid = it?.id
         const pid = it?.productId ?? it?.product?.id
         const sel = Boolean(it?.selected ?? it?.isSelected ?? it?.checked)
         if (typeof cid === 'number' && typeof pid === 'number') {
            result.push({ cartItemId: cid, productId: pid, selected: sel })
         }
      }
      if (result.length) return result
   }
   return []
}

// ================== USER SCENARIO ==================
async function userScenario(user) {
   const startTime = Date.now()

   async function addToCart() {
      const pid = randomProductId()
      const res = await measureRequest(
         'POST',
         `${BASE_URL}/cart/add?productId=${pid}&quantity=1&userId=${user.userId}`,
         null,
         user.token,
         { captureResponse: true }
      )
      if (res.ok) {
         user.cartProductIds.add(pid)
         const cartItemId = extractCartItemIdFromAddResponse(res.data, pid)
         if (typeof cartItemId === 'number') user.cartItemIds.add(cartItemId)
      }
   }

   async function syncCartFromServer() {
      const rows = await tryFetchCartSnapshot(user)
      for (const r of rows) {
         if (typeof r.productId === 'number') user.cartProductIds.add(r.productId)
         if (typeof r.cartItemId === 'number') user.cartItemIds.add(r.cartItemId)
      }
   }

   async function addToWishlist() {
      let pid = randomProductId()
      for (let i = 0; i < 5 && user.wishSet.has(pid); i++) pid = randomProductId()
      const res = await measureRequest(
         'POST',
         `${BASE_URL}/wishlist/add?productId=${pid}&userId=${user.userId}`,
         null,
         user.token
      )
      if (res.ok) user.wishSet.add(pid)
   }

   // ✅ Chọn item theo cartItemId (đúng spec) + VERIFY sau khi chọn
   async function selectCartItems(user) {
      // Bảo đảm có item trong cart
      if (user.cartItemIds.size === 0) {
         // thêm một item để chắc chắn có dữ liệu
         await addToCart()
      }

      // Luôn dùng snapshot từ server để lấy cartItemId CHÍNH CHỦ
      let rows = await tryFetchCartSnapshot(user)
      if (!rows.length) return { ok: false }

      // Lấy random 1–3 cartItemId theo snapshot
      const ids = rows.map((r) => r.cartItemId)
      for (let i = ids.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1))
         ;[ids[i], ids[j]] = [ids[j], ids[i]]
      }
      const pickCount = Math.max(1, Math.min(3, ids.length))
      const selectedIds = ids.slice(0, pickCount)

      // PUT body là mảng cartItemId
      const res = await measureRequest(
         'PUT',
         `${BASE_URL}/cart/select-items?userId=${user.userId}`,
         selectedIds,
         user.token,
         { retryOnTimeout: 1 }
      )
      if (!res.ok) return res

      // 🚦 chờ một nhịp để transaction/commit thực sự “đến nơi”
      await sleep(250)

      // VERIFY: gọi lại cart, xem có item nào selected chưa
      rows = await tryFetchCartSnapshot(user)
      const selectedCount = rows.filter((r) => r.selected).length
      if (selectedCount > 0) {
         // đồng bộ vào state local (optional)
         user.cartItemIds.clear()
         rows.forEach((r) => user.cartItemIds.add(r.cartItemId))
         return { ok: true, selectedCount }
      }

      // Fallback lần 2: thử chọn lại toàn bộ ids (không random)
      const res2 = await measureRequest(
         'PUT',
         `${BASE_URL}/cart/select-items?userId=${user.userId}`,
         rows.map((r) => r.cartItemId),
         user.token,
         { retryOnTimeout: 1 }
      )
      if (!res2.ok) return res2

      await sleep(250)
      rows = await tryFetchCartSnapshot(user)
      const selectedCount2 = rows.filter((r) => r.selected).length
      return { ok: selectedCount2 > 0, selectedCount: selectedCount2 }
   }

   // ✅ Tạo đơn hàng SAU KHI đã verify có selected items
   async function placeOrderFlow(user) {
      const sel = await selectCartItems(user)
      if (!sel.ok || !sel.selectedCount) return

      await measureRequest(
         'POST',
         `${BASE_URL}/orders?userId=${user.userId}`,
         {
            // nhiều backend Spring dùng 'shippingAddress'
            address: randomAddress(),
            phoneNumber: randomPhone(),
            paymentMethodId: randomInt(1, 5),
            shippingMethodId: randomInt(1, 4)
         },
         user.token,
         { retryOnTimeout: 1 }
      )
   }

   const heavyActions = [
      {
         weight: 3,
         fn: () => measureRequest('GET', `${BASE_URL}/products?keyword=${encodeURIComponent(randomKeyword())}`)
      },
      {
         weight: 3,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?filterType=NEW_ARRIVALS&page=0&size=10&sortBy=create_at&sortDir=desc`
            )
      },
      {
         weight: 3,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?brand=${encodeURIComponent(randomBrand())}&page=0&size=10&sortBy=price&sortDir=asc`
            )
      }
   ]
   const lightActions = [
      { weight: 16, fn: () => measureRequest('GET', `${BASE_URL}/products/${randomProductId()}`) },
      { weight: 10, fn: () => addToCart() },
      { weight: 8, fn: () => addToWishlist() },
      {
         weight: 8,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?categoryId=${randomInt(1, 24)}&page=0&size=10&sortBy=id&sortDir=asc`
            )
      },
      { weight: 6, fn: () => measureRequest('GET', `${BASE_URL}/flash-sales/current`) },
      { weight: 3, fn: () => measureRequest('GET', `${BASE_URL}/orders/user/${user.userId}`, null, user.token) },
      { weight: 3, fn: () => measureRequest('GET', `${BASE_URL}/users/${user.userId}`, null, user.token) },
      {
         weight: 1,
         fn: () =>
            measureRequest('GET', `${BASE_URL}/recommendations/${user.userId}?k=8`, null, user.token, {
               timeoutMs: 20000,
               retryOnTimeout: 1
            })
      },
      { weight: 2, fn: () => placeOrderFlow(user) },
      { weight: 6, fn: () => sleep(inBackoff() ? randomInt(800, 1600) : randomInt(300, 1200)) }
   ]

   function pickAction() {
      const pool = inBackoff() ? lightActions : [...lightActions, ...heavyActions]
      return pickWeighted(pool)
   }

   while (Date.now() - startTime < TEST_DURATION) {
      const act = pickAction()
      await act()
      await sleep(inBackoff() ? randomInt(800, 1600) : randomInt(300, 1200))
   }
}

// ================== PERCENTILE ==================
function getPercentile(arr, percentile) {
   if (arr.length === 0) return 0
   const sorted = [...arr].sort((a, b) => a - b)
   const idx = Math.ceil((percentile / 100) * sorted.length) - 1
   return sorted[Math.max(0, idx)]
}

// ================== MAIN ==================
async function main() {
   console.log(`🚀 Bắt đầu login ${TOTAL_USERS} user...`)
   const activeUsers = await loginAllUsersInBatches(USERS, LOGIN_BATCH_SIZE, LOGIN_DELAY)
   console.log(`✅ Login thành công: ${activeUsers.length}/${TOTAL_USERS} user`)

   if (activeUsers.length === 0) {
      console.error('❌ Không có user nào login thành công, dừng test.')
      return
   }

   console.log(`🏁 Bắt đầu test trong ${TEST_DURATION / 1000}s...`)
   const startTest = Date.now()
   await Promise.all(activeUsers.map(userScenario))

   const testDurationSec = (Date.now() - startTest) / 1000

   const avgResponseAll = allResponseTimes.length
      ? (allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length).toFixed(2)
      : 0
   const p95All = getPercentile(allResponseTimes, 95).toFixed(2)

   const avgResponseSuccess = successResponseTimes.length
      ? (successResponseTimes.reduce((a, b) => a + b, 0) / successResponseTimes.length).toFixed(2)
      : 0
   const p95Success = getPercentile(successResponseTimes, 95).toFixed(2)

   const throughputAll = (totalRequests / testDurationSec).toFixed(2)
   const throughputSuccess = (successCount / testDurationSec).toFixed(2)

   console.log('\n===== 📊 KẾT QUẢ TEST =====')
   console.log(`Tổng request (all): ${totalRequests}`)
   console.log(`Thành công: ${successCount}`)
   console.log(`Thất bại: ${errorCount}`)
   console.log(`Throughput (all): ${throughputAll} req/s`)
   console.log(`Throughput (success): ${throughputSuccess} req/s`)

   console.log(`\n⏱️ Latency (ALL): avg=${avgResponseAll} ms, p95=${p95All} ms`)
   console.log(`✅ Latency (SUCCESS ONLY): avg=${avgResponseSuccess} ms, p95=${p95Success} ms`)

   if (errorByType.size > 0) {
      console.log('\n❗ Lỗi theo loại (top):')
      const sortedErrors = [...errorByType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
      for (const [type, count] of sortedErrors) console.log(`- ${type}: ${count}`)
   }

   if (endpointStats.size > 0) {
      console.log('\n🔎 Endpoint stats (top 15 by total req):')
      const arr = [...endpointStats.entries()]
         .map(([ep, { ok, fail }]) => ({ ep, ok, fail, total: ok + fail }))
         .sort((a, b) => b.total - a.total)
         .slice(0, 15)
      for (const it of arr) {
         const rate = it.total ? ((it.ok * 100) / it.total).toFixed(1) : '0.0'
         console.log(`- ${it.ep}: total=${it.total}, ok=${it.ok}, fail=${it.fail}, successRate=${rate}%`)
      }
   }

   if (endpointStats.size > 0) {
      console.log('\n⏱️ Latency theo endpoint (SUCCESS ONLY, top 10 by total):')
      const arr = [...endpointStats.entries()]
         .map(([ep, { ok, fail }]) => ({ ep, ok, fail, total: ok + fail }))
         .sort((a, b) => b.total - a.total)
         .slice(0, 10)

      for (const it of arr) {
         const lat = latencyByEndpointOk.get(it.ep) || []
         const p = (k) => {
            if (!lat.length) return 0
            const s = [...lat].sort((a, b) => a - b)
            const idx = Math.ceil((k / 100) * s.length) - 1
            return s[Math.max(0, idx)]
         }
         const p50 = p(50).toFixed(0),
            p95 = p(95).toFixed(0),
            p99 = p(99).toFixed(0)
         console.log(
            `- ${it.ep}: total=${it.total}, ok=${it.ok}, fail=${it.fail}, p50=${p50}ms, p95=${p95}ms, p99=${p99}ms`
         )
      }
   }

   if (errorSamplesByEndpoint.size > 0) {
      console.log('\n🧪 Mẫu lỗi theo endpoint (tối đa 5 mẫu mỗi endpoint):')
      for (const [ep, set] of errorSamplesByEndpoint.entries()) {
         console.log(`- ${ep}:`)
         for (const msg of set) console.log(`   • ${msg}`)
      }
   }

   console.log('===========================\n')
}

main().catch((e) => {
   console.error('💥 Uncaught error in main:', e)
})
