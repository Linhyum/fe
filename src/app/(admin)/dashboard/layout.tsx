'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
   BarChart3,
   ShoppingCart,
   Package,
   Tag,
   Users,
   LogOut,
   ChevronDown,
   Menu,
   X,
   Truck,
   CreditCard,
   Home,
   User,
   LayoutDashboard,
   WalletCards,
   BookHeart,
   Star,
   Archive,
   BadgeDollarSign,
   Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAppContext } from '@/context/app.context'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import { useGetUserInfo } from '@/queries/useUser'
import Image from 'next/image'
import { ModeToggle } from '@/components/mode-toggle'

interface NavItem {
   title: string
   href: string
   icon: React.ReactNode
}

export default function DashboardLayout({
   children
}: Readonly<{
   children: React.ReactNode
}>) {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true)
   const [showLogoutDialog, setShowLogoutDialog] = useState(false)
   const pathname = usePathname()
   const { userId, logout } = useAppContext()
   const router = useRouter()
   const { data } = useGetUserInfo(userId!)
   const userInfo = data?.data.data

   const navItems: NavItem[] = [
      {
         title: 'Thống kê',
         href: '/dashboard/statistics',
         icon: <BarChart3 className='h-5 w-5' />
      },
      {
         title: 'Đơn hàng',
         href: '/dashboard/order',
         icon: <ShoppingCart className='h-5 w-5' />
      },
      {
         title: 'Sản phẩm',
         href: '/dashboard/product',
         icon: <Package className='h-5 w-5' />
      },
      {
         title: 'Danh mục',
         href: '/dashboard/category',
         icon: <Tag className='h-5 w-5' />
      },
      {
         title: 'Mã giảm giá',
         href: '/dashboard/discount',
         icon: <BadgeDollarSign className='h-5 w-5' />
      },
      {
         title: 'Flash Sale',
         href: '/dashboard/flash-sale',
         icon: <Zap className='h-5 w-5' />
      },
      {
         title: 'Thương hiệu',
         href: '/dashboard/brand',
         icon: <Archive className='h-5 w-5' />
      },
      {
         title: 'Người dùng',
         href: '/dashboard/user',
         icon: <Users className='h-5 w-5' />
      },
      {
         title: 'Đánh giá sản phẩm',
         href: '/dashboard/rating',
         icon: <Star className='h-5 w-5' />
      },
      {
         title: 'Phương thức vận chuyển',
         href: '/dashboard/shipping-method',
         icon: <Truck className='h-5 w-5' />
      },
      {
         title: 'Phương thức thanh toán',
         href: '/dashboard/payment-method',
         icon: <CreditCard className='h-5 w-5' />
      }
   ]

   const handleLogout = () => {
      logout()
      setShowLogoutDialog(false)
      toast.success('Đăng xuất thành công')
      router.push('/login')
   }

   const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen)
   }

   return (
      <div className='flex min-h-screen bg-gray-50 dark:bg-gray-900'>
         {/* Mobile header */}
         <div className='lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800'>
            <Button variant='ghost' size='icon' onClick={toggleSidebar}>
               <Menu className='h-6 w-6' />
            </Button>
            <Link href={'/'} className='sm:w-1/5 flex items-center'>
               <Image src={'/logo.png'} alt='logo' width={50} height={50} className='w-[50px] h-[50px]' />
               <span className='font-semibold text-lg sm:block hidden text-white'>TechShop</span>
            </Link>
            {userInfo ? (
               <Popover>
                  <PopoverTrigger asChild>
                     <Button variant='ghost' size='icon' className='rounded-full'>
                        <Avatar className='h-8 w-8'>
                           <AvatarImage src={userInfo.picture || ''} alt={userInfo.userName || 'User'} />
                           <AvatarFallback>
                              {userInfo.surName?.[0]?.toUpperCase()}
                              {userInfo.lastName?.[0]?.toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                     </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-48 p-0'>
                     <div className='flex flex-col'>
                        <Link
                           className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                           href={'/profile'}
                        >
                           <User size={20} />
                           Hồ sơ
                        </Link>
                        <Link
                           className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                           href={'/dashboard/statistics'}
                        >
                           <LayoutDashboard size={20} />
                           Quản lý
                        </Link>
                        <Link
                           className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                           href={'/purchase'}
                        >
                           <WalletCards size={20} />
                           Đơn mua
                        </Link>
                        <Link
                           className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                           href={'/wishlist'}
                        >
                           <BookHeart size={20} />
                           Sản phẩm yêu thích
                        </Link>
                        <button
                           onClick={() => setShowLogoutDialog(true)}
                           className='flex items-center border-t hover:bg-primary/10 px-4 py-2 transition-colors gap-2 text-red-500'
                        >
                           <LogOut size={20} />
                           Đăng xuất
                        </button>
                     </div>
                  </PopoverContent>
               </Popover>
            ) : (
               <div className='flex items-center gap-1 text-white'>
                  <Link href={'/login'}>Đăng nhập</Link>/<Link href={'/register'}>Đăng ký</Link>
               </div>
            )}
         </div>

         {/* Sidebar */}
         <aside
            className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            fixed top-0 left-0 z-40 h-full transition-transform lg:translate-x-0
            w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            overflow-hidden flex flex-col
          `}
         >
            <div className='flex flex-col h-full'>
               {/* Sidebar header */}
               <div className='flex items-center justify-between p-4 border-b'>
                  <Link href={'/'} className='sm:w-1/5 flex items-center gap-1'>
                     <Image src={'/logo.png'} alt='logo' width={50} height={50} className='w-[50px] h-[50px]' />
                     <span className='font-semibold text-lg sm:block hidden text-white'>TechShop</span>
                  </Link>
                  <Button variant='ghost' size='icon' onClick={toggleSidebar} className='lg:hidden'>
                     <X className='h-5 w-5' />
                  </Button>
               </div>

               {/* Sidebar navigation */}
               <nav className='flex-1 overflow-y-auto p-4'>
                  <ul className='space-y-1'>
                     {navItems.map((item) => (
                        <li key={item.href}>
                           <Link href={item.href}>
                              <div
                                 className={`
                          flex items-center gap-3 px-3 py-2 rounded-md text-sm
                          ${
                             pathname === item.href
                                ? 'bg-gray-100 dark:bg-gray-700 text-primary font-medium'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }
                        `}
                              >
                                 {item.icon}
                                 <span>{item.title}</span>
                              </div>
                           </Link>
                        </li>
                     ))}
                  </ul>
               </nav>

               {/* Sidebar footer */}
               {/* <div className='p-4 border-t mt-auto'>
                  {userInfo ? (
                     <div className='flex items-center gap-3'>
                        <Avatar>
                           <AvatarImage src={userInfo.picture || ''} alt={userInfo.userName || 'User'} />
                           <AvatarFallback>
                              {userInfo.surName?.[0]?.toUpperCase()}
                              {userInfo.lastName?.[0]?.toUpperCase()}
                           </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                           <p className='text-sm font-medium truncate'>
                              {userInfo.surName} {userInfo.lastName}
                           </p>
                           <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{userInfo.email}</p>
                        </div>
                        <Popover>
                           <PopoverTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                 <ChevronDown className='h-4 w-4' />
                              </Button>
                           </PopoverTrigger>
                           <PopoverContent className='w-48 p-0' align='end'>
                              <div className='flex flex-col'>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/profile'}
                                 >
                                    <User size={20} />
                                    Hồ sơ
                                 </Link>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/'}
                                 >
                                    <Home size={20} />
                                    Về trang chủ
                                 </Link>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/purchase'}
                                 >
                                    <WalletCards size={20} />
                                    Đơn mua
                                 </Link>
                                 <Link
                                    className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                    href={'/wishlist'}
                                 >
                                    <BookHeart size={20} />
                                    Sản phẩm yêu thích
                                 </Link>
                                 <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className='flex items-center border-t hover:bg-primary/10 px-4 py-2 transition-colors gap-2 text-red-500'
                                 >
                                    <LogOut size={20} />
                                    Đăng xuất
                                 </button>
                              </div>
                           </PopoverContent>
                        </Popover>
                     </div>
                  ) : (
                     <div className='flex justify-center'>
                        <Link href='/login' className='text-primary hover:underline'>
                           Đăng nhập để tiếp tục
                        </Link>
                     </div>
                  )}
               </div> */}
            </div>
         </aside>

         {/* Overlay for mobile */}
         {isSidebarOpen && <div className='fixed inset-0 bg-gray-900/50 z-30 lg:hidden' onClick={toggleSidebar} />}

         {/* Main content */}
         <main className='flex-1 lg:ml-64 min-h-screen w-[calc(100%-256px)]'>
            {/* Desktop header */}
            <header className='hidden lg:flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 sticky top-0 z-10'>
               <div>
                  <h1 className='text-xl font-semibold'>Dashboard</h1>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>Quản lý cửa hàng của bạn</p>
               </div>
               <div className='flex items-center gap-4'>
                  <Link href='/'>
                     <Button variant='outline' size='sm'>
                        <Home className='mr-2 h-4 w-4' />
                        Về trang chủ
                     </Button>
                  </Link>
                  <div className='bg-primaryColor w-8 h-8 flex items-center justify-center rounded'>
                     <ModeToggle />
                  </div>
                  {userInfo ? (
                     <Popover>
                        <PopoverTrigger asChild>
                           <Button variant='ghost' size='icon' className='rounded-full'>
                              <Avatar className='h-8 w-8'>
                                 <AvatarImage src={userInfo.picture || ''} alt={userInfo.userName || 'User'} />
                                 <AvatarFallback>
                                    {userInfo.surName?.[0]?.toUpperCase()}
                                    {userInfo.lastName?.[0]?.toUpperCase()}
                                 </AvatarFallback>
                              </Avatar>
                           </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-48 p-0' align='end'>
                           <div className='flex flex-col'>
                              <Link
                                 className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                 href={'/profile'}
                              >
                                 <User size={20} />
                                 Hồ sơ
                              </Link>
                              <Link
                                 className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                 href={'/purchase'}
                              >
                                 <WalletCards size={20} />
                                 Đơn mua
                              </Link>
                              <Link
                                 className='flex items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2'
                                 href={'/wishlist'}
                              >
                                 <BookHeart size={20} />
                                 Sản phẩm yêu thích
                              </Link>
                              <button
                                 onClick={() => setShowLogoutDialog(true)}
                                 className='flex border-t items-center hover:bg-primary/10 px-4 py-2 transition-colors gap-2 text-red-500'
                              >
                                 <LogOut size={20} />
                                 Đăng xuất
                              </button>
                           </div>
                        </PopoverContent>
                     </Popover>
                  ) : (
                     <div className='flex items-center gap-2'>
                        <Link href='/login'>
                           <Button size='sm' variant='outline'>
                              Đăng nhập
                           </Button>
                        </Link>
                        <Link href='/register'>
                           <Button size='sm'>Đăng ký</Button>
                        </Link>
                     </div>
                  )}
               </div>
            </header>

            {/* Page content with padding for mobile header */}
            <div className='p-0 lg:p-0 pt-16 lg:pt-0'>{children}</div>
         </main>

         {/* Logout confirmation dialog */}
         <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Xác nhận đăng xuất</DialogTitle>
                  <DialogDescription>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setShowLogoutDialog(false)}>
                     Hủy
                  </Button>
                  <Button variant='destructive' onClick={handleLogout}>
                     Đăng xuất
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
