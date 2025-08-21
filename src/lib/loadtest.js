/**
 * Load Test Script (revamped)
 * - Keep-Alive + maxSockets để tái sử dụng kết nối
 * - Giới hạn đồng thời bằng semaphore tự viết (không cần p-limit)
 * - Ramp-up login theo batch "dịu" hơn
 * - Tăng think time trong user scenario
 * - Ghi log lỗi chi tiết (HTTP_xxx, ETIMEDOUT, ECONNRESET, ...)
 * - Phân tách throughput & latency cho request thành công
 */

const http = require('http')
const https = require('https')
const axiosBase = require('axios')

// ================== CONFIG ==================
const BASE_URL = 'http://127.0.0.1:8080/api/v1'

const TOTAL_USERS = 100 // giảm để ramp-up an toàn (có thể tăng dần)
const TEST_DURATION = 5 * 60 * 1000 // 5 phút
const LOGIN_BATCH_SIZE = 20 // login "dịu" hơn
const LOGIN_DELAY = 3000 // ms nghỉ giữa các batch login
const PASSWORD = '123123'

// Giới hạn đồng thời tổng thể cho mọi request (tùy năng lực server)
const MAX_CONCURRENCY = 200

// Timeout đọc dữ liệu (ms). Đặt 15000 để phân biệt timeout vs throttling/chậm
const REQ_TIMEOUT = 15000
// =============================================

// ===== HTTP keep-alive (rất quan trọng khi RPS cao) =====
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: MAX_CONCURRENCY })
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: MAX_CONCURRENCY })

// Axios instance dùng chung
const axios = axiosBase.create({
   httpAgent,
   httpsAgent,
   timeout: REQ_TIMEOUT,
   // Không throw với 4xx/5xx; ta tự phân loại để thống kê
   validateStatus: () => true,
   headers: { 'Content-Type': 'application/json' }
})

// ================== SEMAPHORE (limit concurrency) ==================
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
      if (this.queue.length > 0) {
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

// ================== STATS ==================
let totalRequests = 0
let successCount = 0
let errorCount = 0
const allResponseTimes = [] // tất cả request (kể cả fail/timeout)
const successResponseTimes = [] // chỉ request thành công (2xx/3xx)

const errorByType = new Map() // key: errType (HTTP_429, ETIMEDOUT, ECONNRESET,...), val: count
const endpointStats = new Map() // key: endpointKey, val: { ok, fail }

function bump(map, key, delta = 1) {
   map.set(key, (map.get(key) || 0) + delta)
}
function recordEndpoint(endpointKey, ok) {
   const cur = endpointStats.get(endpointKey) || { ok: 0, fail: 0 }
   ok ? cur.ok++ : cur.fail++
   endpointStats.set(endpointKey, cur)
}

// ================== USERS ==================
const USERS = Array.from({ length: TOTAL_USERS }, (_, i) => {
   const num = String(i + 1).padStart(4, '0')
   return { userId: i + 1, userName: `user${num}`, password: PASSWORD }
})

// Sleep helper
function sleep(ms) {
   return new Promise((res) => setTimeout(res, ms))
}

// ================== HELPERS RANDOM ==================
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
         console.error(`⚠️ Login fail (không có token) cho ${user.userName} - HTTP_${res.status}`)
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

// ================== MEASURE REQUEST ==================
function endpointKeyFromUrl(url) {
   try {
      // rút gọn endpoint để group thống kê (bỏ query)
      const u = new URL(url)
      return u.pathname
   } catch {
      return url
   }
}
// Lưu mẫu lỗi để debug 400
const errorSamplesByEndpoint = new Map() // key: endpointKey -> Set<string>

function pushErrorSample(endpointKey, sample) {
   const set = errorSamplesByEndpoint.get(endpointKey) || new Set()
   if (set.size < 5) {
      set.add(sample)
   }
   errorSamplesByEndpoint.set(endpointKey, set)
}

async function doAxiosCall(method, url, data, headers, timeoutMs) {
   if (method === 'GET') return axios.get(url, { headers, timeout: timeoutMs })
   if (method === 'POST') return axios.post(url, data ?? {}, { headers, timeout: timeoutMs })
   if (method === 'DELETE') return axios.delete(url, { headers, timeout: timeoutMs })
   throw new Error(`Unsupported method: ${method}`)
}
async function measureRequest(method, url, data = null, token = null, opts = {}) {
   const { timeoutMs, retryOnTimeout = 0 } = opts
   const endpointKey = endpointKeyFromUrl(url)
   const headers = {}
   if (token) headers['Authorization'] = `Bearer ${token}`

   let attempt = 0
   let ok = false
   let errType = 'ok'
   let duration = 0

   while (true) {
      const start = Date.now()
      await globalSem.withLock(async () => {
         try {
            const res = await doAxiosCall(method, url, data, headers, timeoutMs)
            const status = res?.status ?? 0
            ok = status >= 200 && status < 400
            if (!ok) {
               errType = `HTTP_${status}`
               // Lưu 1 mẫu lỗi (nếu có body message)
               const msg = res?.data?.message || res?.data?.error || JSON.stringify(res?.data || {})
               pushErrorSample(endpointKey, `${errType}: ${msg}`.slice(0, 300))
            }
         } catch (e) {
            if (e.code) errType = e.code // ETIMEDOUT/ECONNABORTED/ECONNRESET...
            else if (e.response) {
               errType = `HTTP_${e.response.status}`
               const msg =
                  e.response?.data?.message || e.response?.data?.error || JSON.stringify(e.response?.data || {})
               pushErrorSample(endpointKey, `${errType}: ${msg}`.slice(0, 300))
            } else {
               errType = 'UNKNOWN'
            }
         }
      })
      duration = Date.now() - start

      if (ok) break
      // retry nếu timeout (axios timeout => ECONNABORTED)
      if (errType === 'ECONNABORTED' && attempt < retryOnTimeout) {
         attempt++
         await sleep(200 + attempt * 200) // backoff nhẹ
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
   } else {
      errorCount++
      bump(errorByType, errType)
   }
}
// ================== USER SCENARIO ==================
async function userScenario(user) {
   const startTime = Date.now()
   const actions = [
      { weight: 12, fn: () => measureRequest('GET', `${BASE_URL}/products/${randomProductId()}`) },
      {
         weight: 12,
         fn: () => measureRequest('GET', `${BASE_URL}/products?keyword=${encodeURIComponent(randomKeyword())}`)
      },
      {
         weight: 8,
         fn: () =>
            measureRequest(
               'POST',
               `${BASE_URL}/cart/add?productId=${randomProductId()}&quantity=1&userId=${user.userId}`,
               null,
               user.token
            )
      },
      {
         weight: 6,
         fn: () =>
            measureRequest(
               'POST',
               `${BASE_URL}/wishlist/add?productId=${randomProductId()}&userId=${user.userId}`,
               null,
               user.token
            )
      },
      {
         weight: 2,
         fn: () =>
            measureRequest('GET', `${BASE_URL}/recommendations/${user.userId}?k=8`, null, user.token, {
               timeoutMs: 20000,
               retryOnTimeout: 1
            })
      },
      {
         weight: 6,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?filterType=NEW_ARRIVALS&page=0&size=10&sortBy=createdAt&sortDir=desc`
            )
      },
      {
         weight: 6,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?categoryId=${randomInt(1, 24)}&page=0&size=10&sortBy=id&sortDir=asc`
            )
      },
      {
         weight: 6,
         fn: () =>
            measureRequest(
               'GET',
               `${BASE_URL}/products?brand=${encodeURIComponent(randomBrand())}&page=0&size=10&sortBy=price&sortDir=asc`
            )
      },
      { weight: 4, fn: () => measureRequest('GET', `${BASE_URL}/flash-sales/current`) },
      { weight: 3, fn: () => measureRequest('GET', `${BASE_URL}/orders/user/${user.userId}`, null, user.token) },
      { weight: 2, fn: () => measureRequest('GET', `${BASE_URL}/users/${user.userId}`, null, user.token) },
      {
         weight: 1,
         fn: () =>
            measureRequest(
               'POST',
               `${BASE_URL}/orders?userId=${user.userId}`,
               {
                  address: randomAddress(),
                  phoneNumber: randomPhone(),
                  paymentMethodId: randomInt(1, 5),
                  shippingMethodId: randomInt(1, 4)
               },
               user.token
            )
      },
      // nghỉ dài hơn để tránh bùng nổ RPS
      { weight: 5, fn: () => sleep(randomInt(300, 1200)) }
   ]

   while (Date.now() - startTime < TEST_DURATION) {
      const action = pickWeighted(actions)
      await action()
      // tăng think time chung để thân thiện hơn với server
      await sleep(randomInt(300, 1200))
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

   // ===== Kết quả =====
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

   // In top lỗi
   if (errorByType.size > 0) {
      console.log('\n❗ Lỗi theo loại (top):')
      const sortedErrors = [...errorByType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
      for (const [type, count] of sortedErrors) {
         console.log(`- ${type}: ${count}`)
      }
   }

   // In thống kê theo endpoint (rút gọn)
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

   // In mẫu lỗi theo endpoint (tối đa 5 mẫu/endpoint)
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
