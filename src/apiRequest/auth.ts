import http from '@/lib/http'
import { LoginBodyType, RegisterBodyType } from '@/schemaValidations/auth.schema'
import { LoginResType } from '@/types/auth.type'

export const registerAccount = (body: RegisterBodyType) => http.post('/auth/register', body)

export const loginAccount = (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body)

export const forgotPassword = (email: string) => http.post(`/auth/forgot-password?email=${email}`)

export const resetPassword = (body: { token: string; newPassword: string }) => http.post('/auth/reset-password', body)

export const refreshToken = (refreshToken: string) => http.post<LoginResType>('/auth/refresh-token', { refreshToken })

export const verifyEmail = (token: string) => http.get('/auth/verify-email?token=' + token)
//OAuth2
export const getGoogleAuthUrl = () =>
   `https://api.bedeploy.online/api/v1/oauth2/authorize/google?redirect_uri=https://fe-i7eo.vercel.app/oauth2/callback`

export const getDiscordAuthUrl = () =>
   `https://api.bedeploy.online/api/v1/oauth2/authorize/discord?redirect_uri=https://fe-i7eo.vercel.app/oauth2/callback`

export const handleOAuth2Redirect = (token: string, refreshToken: string) =>
   http.get<LoginResType>(`/auth/oauth2/redirect?token=${token}&refreshToken=${refreshToken}`)
