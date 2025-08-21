import axios, { AxiosInstance } from 'axios'
import { LoginResType } from '@/types/auth.type'
import { jwtDecode } from 'jwt-decode'

class Http {
   instance: AxiosInstance
   private accessToken: string
   private refreshToken: string
   private refreshTokenRequest: Promise<string> | null

   constructor() {
      this.accessToken = ''
      this.refreshToken = ''
      this.refreshTokenRequest = null
      this.instance = axios.create({
         baseURL: 'http://localhost:8080/api/v1',
         timeout: 30_000,
         headers: {
            'Content-Type': 'application/json'
         }
      })

      this.instance.interceptors.request.use(
         (config) => {
            if (this.accessToken && config.headers) {
               config.headers.Authorization = `Bearer ${this.accessToken}`
            }
            return config
         },
         (error) => {
            return Promise.reject(error)
         }
      )

      this.instance.interceptors.response.use(
         (response) => {
            const { url } = response.config
            if (url === '/auth/login') {
               this.setTokens(response.data)
            }
            return response
         },
         async (error) => {
            const originalRequest = error.config

            // Nếu lỗi không phải 401 hoặc đã thử refresh token rồi thì throw error
            if (error.response?.status !== 401 || originalRequest._retry) {
               return Promise.reject(error)
            }

            originalRequest._retry = true

            // Kiểm tra xem token có gần hết hạn không
            if (this.isTokenExpired() && this.refreshToken) {
               try {
                  const newToken = await this.handleRefreshToken()
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                  return this.instance(originalRequest)
               } catch (error) {
                  this.clearTokens()
                  return Promise.reject(error)
               }
            }

            return Promise.reject(error)
         }
      )
   }

   private isTokenExpired(): boolean {
      if (!this.accessToken) return true

      try {
         const decoded = jwtDecode(this.accessToken)
         if (!decoded.exp) return true

         // Kiểm tra xem token còn thời hạn trên 1 phút không
         return decoded.exp * 1000 - Date.now() < 60000
      } catch {
         return true
      }
   }

   private async handleRefreshToken() {
      try {
         // Tránh gọi nhiều request refresh token cùng lúc
         if (!this.refreshTokenRequest) {
            this.refreshTokenRequest = this.instance
               .post<LoginResType>('/auth/refresh-token', {
                  refreshToken: this.refreshToken
               })
               .then((res) => {
                  this.setTokens(res.data)
                  return this.accessToken
               })
               .finally(() => {
                  this.refreshTokenRequest = null
               })
         }
         return await this.refreshTokenRequest
      } catch (error) {
         this.clearTokens()
         throw error
      }
   }

   private setTokens(response: LoginResType) {
      this.accessToken = response.data.token
      this.refreshToken = response.data.refreshToken

      // Chỉ lưu cookie khi ở môi trường client
      if (typeof window !== 'undefined') {
         document.cookie = `access_token=${this.accessToken}; path=/; max-age=86400; SameSite=Strict`
         document.cookie = `refresh_token=${this.refreshToken}; path=/; max-age=604800; SameSite=Strict`
      }
   }

   // Thêm các phương thức setter cho token
   public setAccessToken(token: string) {
      this.accessToken = token
      // Lưu vào cookie
      if (typeof window !== 'undefined') {
         document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Strict`
      }
   }

   public setRefreshToken(token: string) {
      this.refreshToken = token
      // Lưu vào cookie
      if (typeof window !== 'undefined') {
         document.cookie = `refresh_token=${token}; path=/; max-age=604800; SameSite=Strict`
      }
   }

   public clearTokens() {
      this.accessToken = ''
      this.refreshToken = ''
      // Chỉ xóa cookie khi ở môi trường client
      if (typeof window !== 'undefined') {
         document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
         document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
   }

   // Khởi tạo token từ cookie khi reload trang
   public setTokenFromCookie() {
      // Chỉ đọc cookie khi ở môi trường client
      if (typeof window !== 'undefined') {
         const cookies = document.cookie.split(';')
         const accessToken = cookies.find((cookie) => cookie.trim().startsWith('access_token='))?.split('=')[1]
         const refreshToken = cookies.find((cookie) => cookie.trim().startsWith('refresh_token='))?.split('=')[1]

         if (accessToken && refreshToken) {
            this.accessToken = accessToken
            this.refreshToken = refreshToken
         }
      }
   }
}

const http = new Http()

// Chỉ gọi setTokenFromCookie khi ở môi trường client
if (typeof window !== 'undefined') {
   http.setTokenFromCookie()
}

export default http.instance
// Export instance của Http class để có thể gọi clearTokens
export { http }
