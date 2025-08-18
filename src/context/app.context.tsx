'use client'
import useLocalStorage from '@/hooks/use-localstorage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useState } from 'react'
import { http } from '@/lib/http'

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         refetchOnWindowFocus: false,
         retry: 0
      }
   }
})

interface AppContextProps {
   userId: number | undefined
   setUserId: React.Dispatch<React.SetStateAction<number | undefined>>
   logout: () => void
   searchProduct: string | undefined
   setSearchProduct: React.Dispatch<React.SetStateAction<string | undefined>>
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

export const useAppContext = () => {
   const context = useContext(AppContext)
   if (!context) {
      throw new Error('useAppContext must be used within an AppProvider')
   }
   return context
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
   const [userId, setUserId] = useLocalStorage<number | undefined>('userId', undefined)
   const [searchProduct, setSearchProduct] = useState<string | undefined>(undefined)
   const logout = () => {
      setUserId(undefined)
      // Xóa token
      http.clearTokens()
   }

   return (
      <AppContext.Provider value={{ userId, setUserId, logout, searchProduct, setSearchProduct }}>
         <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AppContext.Provider>
   )
}
