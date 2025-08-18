const axios = require('axios')

// ================== CONFIG ==================
const BASE_URL = 'http://127.0.0.1:8080/api/v1'
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

   try {
      if (method === 'GET') {
         await axios.get(url, { headers })
      } else if (method === 'POST') {
         await axios.post(url, data, { headers })
      }

      const duration = Date.now() - start
      responseTimes.push(duration)
      totalRequests++
      successCount++
   } catch (err) {
      totalRequests++
      errorCount++
      console.error(`Request lỗi: ${err.message}`)
   }
}

// Mô phỏng hành vi của 1 user
async function userScenario(user) {
   const startTime = Date.now()
   while (Date.now() - startTime < TEST_DURATION) {
      await measureRequest('GET', `${BASE_URL}/products/7823`)
      await measureRequest('GET', `${BASE_URL}/products?keyword=camera`)
      await measureRequest(
         'POST',
         `${BASE_URL}/cart/add?productId=664&quantity=1&userId=${user.userId}`,
         null,
         user.token
      )
      await sleep(10000)
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
