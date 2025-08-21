'use client'
import { ModeToggle } from '@/components/mode-toggle'
import { Input } from '@/components/ui/input'
import {
   Bell,
   BookHeart,
   LayoutDashboard,
   LogOut,
   Mic,
   MicOff,
   Search,
   ShoppingCart,
   User,
   WalletCards
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { decodeHTML, formatCurrency, generateNameId } from '@/lib/utils'
import { useAppContext } from '@/context/app.context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetUserInfo } from '@/queries/useUser'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'react-toastify'
import { useGetAllCart } from '@/queries/useCart'
import SwitchLanguage from '@/components/switch-language'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

// Thêm kiểu cho window để hỗ trợ SpeechRecognition
declare global {
   interface Window {
      SpeechRecognition: any
      webkitSpeechRecognition: any
   }
}

export default function Header() {
   const { userId, logout, setSearchProduct } = useAppContext()
   const router = useRouter()
   const [searchValue, setSearchValue] = useState<string>('')
   const { data } = useGetUserInfo(userId!)
   const userInfo = data?.data.data
   const [showLogoutDialog, setShowLogoutDialog] = React.useState(false)
   const getAllCart = useGetAllCart(userId!)
   const cartData = getAllCart.data?.data.data.items || []
   const t = useTranslations('Header')

   // Voice search states
   const [isListening, setIsListening] = useState(false)
   const [speechSupported, setSpeechSupported] = useState(false)
   const recognitionRef = useRef<any>(null)

   // Check if speech recognition is supported
   useEffect(() => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
         setSpeechSupported(true)
         recognitionRef.current = new SpeechRecognition()
         recognitionRef.current.continuous = false
         recognitionRef.current.interimResults = false
         recognitionRef.current.lang = 'vi-VN'

         recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setSearchValue(transcript)
            setIsListening(false)
         }

         recognitionRef.current.onerror = (event: any) => {
            if (event.error === 'aborted') return // 🛠 ignore harmless abort error
            console.error('Speech recognition error', event.error)
            setIsListening(false)
         }

         recognitionRef.current.onend = () => {
            setIsListening(false)
         }
      }

      return () => {
         if (recognitionRef.current) {
            recognitionRef.current.abort()
         }
      }
   }, [])

   const toggleListening = () => {
      if (isListening) {
         recognitionRef.current.abort()
         setIsListening(false)
      } else {
         try {
            recognitionRef.current.start()
            setIsListening(true)
         } catch (error) {
            console.error('Speech recognition error:', error)
         }
      }
   }

   const handleLogout = () => {
      logout()
      setShowLogoutDialog(false)
      toast.success(t('logoutSuccess'))
   }

   return (
      <>
         <header className='bg-primaryColor py-3'>
            <div className='container flex justify-end gap-4 items-center mb-2'>
               <ModeToggle />
               <div className='flex items-center gap-1 text-white'>
                  {userInfo ? (
                     <>
                        <Popover>
                           <PopoverTrigger asChild>
                              <button className='flex items-center gap-1 text-white'>
                                 <Image
                                    src={userInfo.picture || 'https://cdn-icons-png.freepik.com/512/3607/3607444.png'}
                                    alt=''
                                    className='w-10 h-10 rounded-full'
                                    width={40}
                                    height={40}
                                 />
                                 <span>
                                    {userInfo.surName} {userInfo.lastName}
                                 </span>
                              </button>
                           </PopoverTrigger>
                           <PopoverContent className='w-48 p-0'>
                              <div className='flex flex-col'>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/profile'}
                                 >
                                    <User size={20} />
                                    {t('profile')}
                                 </Link>
                                 {userInfo.role && (
                                    <Link
                                       className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                       href={'/dashboard/statistics'}
                                    >
                                       <LayoutDashboard size={20} />
                                       {t('dashboard')}
                                    </Link>
                                 )}
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/purchase'}
                                 >
                                    <WalletCards size={20} />
                                    {t('purchases')}
                                 </Link>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/wishlist'}
                                 >
                                    <BookHeart size={20} />
                                    {t('wishlist')}
                                 </Link>
                                 <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className='flex border-t items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2 text-red-500'
                                 >
                                    <LogOut size={20} />
                                    {t('logout')}
                                 </button>
                              </div>
                           </PopoverContent>
                        </Popover>
                     </>
                  ) : (
                     <>
                        <Link href={'/login'}>{t('login')}</Link>/<Link href={'/register'}>{t('register')}</Link>
                     </>
                  )}
               </div>
            </div>
            <div className='container flex items-center gap-2'>
               <Link href={'/'} className='sm:w-1/5 flex items-center'>
                  <Image src={'/logo.png'} alt='logo' width={50} height={50} className='w-[50px] h-[50px]' />
                  <span className='font-semibold text-lg sm:block hidden text-white'>TechShop</span>
               </Link>
               <form
                  onSubmit={(e) => {
                     e.preventDefault()
                     setSearchProduct(searchValue)
                     router.push(`/products?keyword=${searchValue}`)
                  }}
                  className='sm:w-3/5 flex-1 flex items-center'
               >
                  <Input
                     id='keyword'
                     placeholder={t('search.placeholder')}
                     value={searchValue}
                     onChange={(e) => setSearchValue(e.target.value)}
                     className='bg-white text-black rounded-tr-none rounded-br-none border-none outline-none ring-offset-0'
                  />
                  {speechSupported && (
                     <button
                        type='button'
                        onClick={toggleListening}
                        className={`flex h-9 items-center justify-center px-2 ${
                           isListening ? 'bg-red-500' : 'bg-white'
                        } text-black border-r border-gray-200`}
                        aria-label={isListening ? t('search.stopVoice') : t('search.startVoice')}
                        title={isListening ? t('search.stopVoice') : t('search.startVoice')}
                     >
                        {isListening ? <MicOff size={18} strokeWidth={1.5} /> : <Mic size={18} strokeWidth={1.5} />}
                     </button>
                  )}
                  <button
                     type='submit'
                     className='flex h-9 items-center gap-1 bg-[#097345] font-medium px-3 text-white whitespace-nowrap rounded-tr-md rounded-br-md'
                  >
                     <Search size={20} strokeWidth={1.5} />
                     <span className='sm:block hidden'> {t('search.button')}</span>
                  </button>
               </form>
               <div className='sm:w-1/5 flex items-center justify-center text-white'>
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <div className='relative cursor-pointer'>
                           <ShoppingCart size={30} />
                           <div className='absolute top-[-4px] right-[-8px] bg-secondaryColor px-2 text-xs rounded-lg'>
                              {cartData.length}
                           </div>
                        </div>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className='w-[300px] sm:w-96'>
                        <DropdownMenuGroup className='p-0'>
                           {cartData?.length === 0 && (
                              <div className='flex flex-col justify-center items-center gap-3 my-5'>
                                 <Image
                                    src={'/no-product.png'}
                                    alt='no-product'
                                    width={100}
                                    height={100}
                                    className='w-[100px] h-[100px]'
                                 />
                                 {t('cart.empty')}
                              </div>
                           )}
                           {cartData?.length > 0 && (
                              <>
                                 <p className='p-3'>{t('cart.title')}</p>
                                 {cartData.slice(0, 5)?.map((cart) => (
                                    <Link
                                       href={`/${generateNameId({ name: cart.productName, id: cart.productId })}`}
                                       key={cart.id}
                                    >
                                       <DropdownMenuItem className='flex items-center gap-2 cursor-pointer'>
                                          <Image
                                             src={cart.productImage}
                                             alt={cart.productName}
                                             width={40}
                                             height={40}
                                             className='aspect-square w-10 h-10 flex-shrink-0'
                                          />
                                          <h3 className='truncate font-semibold'>{decodeHTML(cart.productName)}</h3>
                                          <span className='text-secondaryColor'>{formatCurrency(cart.price)}</span>
                                          <span className='ml-auto'>x{cart.quantity}</span>
                                       </DropdownMenuItem>
                                    </Link>
                                 ))}
                                 <div className='flex items-center justify-between p-3'>
                                    <span>
                                       {cartData.length > 5 && cartData.slice(5).length} {t('cart.more')}
                                    </span>
                                    <Link
                                       href={'/cart'}
                                       className='px-5 py-2 bg-secondaryColor text-white button-primary rounded-sm'
                                    >
                                       {t('cart.viewCart')}
                                    </Link>
                                 </div>
                              </>
                           )}
                        </DropdownMenuGroup>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
         </header>

         <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>{t('logoutDialog.title')}</DialogTitle>
                  <DialogDescription>{t('logoutDialog.description')}</DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setShowLogoutDialog(false)}>
                     {t('logoutDialog.cancel')}
                  </Button>
                  <Button variant='destructive' onClick={handleLogout}>
                     {t('logoutDialog.confirm')}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </>
   )
}
