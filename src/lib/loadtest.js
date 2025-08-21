const axios = require('axios')

// ================== CONFIG ==================
const BASE_URL = 'https://api.bedeploy.online/api/v1'
const TOTAL_USERS = 500
const TEST_DURATION = 5 * 60 * 1000 // 5 phút
const LOGIN_BATCH_SIZE = 50 // Số user login cùng lúc
const LOGIN_DELAY = 200 // ms nghỉ giữa các batch
const PASSWORD = '123123'
// =============================================

// Thống kê
let totalRequests = 0
let successCount = 0
let errorCount = 0
let responseTimes = []

// Danh sách user từ DB
const USERS = Array.from({ length: TOTAL_USERS }, (_, i) => {
   const num = String(i + 1).padStart(4, '0')
   return {
      userId: i + 1,
      userName: `user${num}`,
      password: PASSWORD
   }
})

// Hàm sleep
function sleep(ms) {
   return new Promise((res) => setTimeout(res, ms))
}

// Hàm login cho 1 user
async function loginUser(user) {
   try {
      const res = await axios.post(
         `${BASE_URL}/auth/login`,
         {
            userName: user.userName,
            password: user.password
         },
         {
            headers: { 'Content-Type': 'application/json' }
         }
      )

      const token = res?.data?.data?.token
      if (!token) {
         console.error(`⚠️ Login fail (không có token) cho ${user.userName}`)
         return null
      }
      return { ...user, token }
   } catch (err) {
      const status = err.response?.status || 'NO_STATUS'
      const msg = err.response?.data || err.message
      console.error(`❌ Login fail cho ${user.userName} - Status: ${status} - Msg: ${JSON.stringify(msg)}`)
      return null
   }
}

// Login theo batch
async function loginAllUsersInBatches(users, batchSize, delayMs) {
   const loggedInUsers = []
   for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const results = await Promise.all(batch.map(loginUser))
      loggedInUsers.push(...results.filter((u) => u !== null))
      await sleep(delayMs)
   }
   return loggedInUsers
}

// Đo thời gian request
async function measureRequest(method, url, data = null, token = null) {
   const start = Date.now()
   const headers = { 'Content-Type': 'application/json' }
   if (token) headers['Authorization'] = `Bearer ${token}`
   const config = { headers, timeout: 10000 }

   let ok = true
   try {
      if (method === 'GET') {
         await axios.get(url, config)
      } else if (method === 'POST') {
         await axios.post(url, data, config)
      } else if (method === 'DELETE') {
         await axios.delete(url, config)
      }
   } catch (err) {
      ok = false
   } finally {
      const duration = Date.now() - start
      responseTimes.push(duration)
      totalRequests++
      if (ok) successCount++
      else errorCount++
   }
}

function randomProductId() {
   return Math.floor(Math.random() * 7824) + 1
}

function randomKeyword() {
   const keywords = ['camera', 'laptop', 'phone', 'watch', 'mouse']
   return keywords[Math.floor(Math.random() * keywords.length)]
}

function randomInt(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min
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
         weight: 8,
         fn: () => measureRequest('GET', `${BASE_URL}/recommendations/${user.userId}?k=8`, null, user.token)
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
      { weight: 2, fn: () => measureRequest('GET', `${BASE_URL}/users/profile`, null, user.token) },
      {
         weight: 1,
         fn: () =>
            measureRequest(
               'POST',
               `${BASE_URL}/orders?userId=${user.userId}`,
               {
                  shippingAddress: randomAddress(),
                  phoneNumber: randomPhone(),
                  paymentMethodId: randomInt(1, 5),
                  shippingMethodId: randomInt(1, 4),
                  orderDetails: [{ productId: randomInt(1, 7824), quantity: 1, price: randomInt(100000, 5000000) }]
               },
               user.token
            )
      },
      // Nghỉ dài hơn một chút (giảm RPS bùng nổ)
      { weight: 5, fn: () => sleep(randomInt(300, 1200)) }
   ]

   while (Date.now() - startTime < TEST_DURATION) {
      const action = pickWeighted(actions)
      await action()
      await sleep(randomInt(100, 300))
   }
}

// Lấy percentile
function getPercentile(arr, percentile) {
   if (arr.length === 0) return 0
   const sorted = [...arr].sort((a, b) => a - b)
   const index = Math.ceil((percentile / 100) * sorted.length) - 1
   return sorted[index]
}

// MAIN
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

   // Kết quả
   const testDurationSec = (Date.now() - startTest) / 1000
   const avgResponse = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
   const p95Response = getPercentile(responseTimes, 95).toFixed(2)
   const throughput = (totalRequests / testDurationSec).toFixed(2)

   console.log('\n===== 📊 KẾT QUẢ TEST =====')
   console.log(`Tổng request: ${totalRequests}`)
   console.log(`Thành công: ${successCount}`)
   console.log(`Thất bại: ${errorCount}`)
   console.log(`Thời gian phản hồi trung bình: ${avgResponse} ms`)
   console.log(`p95 latency: ${p95Response} ms`)
   console.log(`Throughput: ${throughput} req/s`)
   console.log('===========================\n')
}

main()
