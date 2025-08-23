'use client'
import { useGetDashboardStatistics } from '@/queries/useAdmin'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { decodeHTML, formatCurrency, formatShortCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart,
   Pie,
   Cell,
   Legend
} from 'recharts'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'
import { DashboardStatisticsType } from '@/types/admin.type'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getRevenueByCategoryPie, getRevenueByInterval } from '@/apiRequest/admin'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function Statistics() {
   const { data } = useGetDashboardStatistics()
   const statistics = data?.data.data as DashboardStatisticsType

   const [revenueStartDate, setRevenueStartDate] = React.useState<Date>(new Date(new Date().getFullYear(), 0, 1))
   const [revenueEndDate, setRevenueEndDate] = React.useState<Date>(new Date())
   const [interval, setInterval] = React.useState<'day' | 'week' | 'month' | 'year'>('day')
   const [categoryStartDate, setCategoryStartDate] = React.useState<Date>(new Date(new Date().getFullYear(), 0, 1))
   const [categoryEndDate, setCategoryEndDate] = React.useState<Date>(new Date())

   // API calls for revenue data
   const [revenueData, setRevenueData] = React.useState<any>(null)
   const [categoryData, setCategoryData] = React.useState<any>(null)

   const fetchRevenueByInterval = async () => {
      try {
         const startDateStr = revenueStartDate.toISOString().split('T')[0]
         const endDateStr = revenueEndDate.toISOString().split('T')[0]
         const response = await getRevenueByInterval(startDateStr, endDateStr, interval)
         setRevenueData(response.data.data)
      } catch (error) {
         console.error('Error fetching revenue by interval:', error)
      }
   }

   const fetchRevenueByCategoryPie = async () => {
      try {
         const startDateStr = categoryStartDate.toISOString().split('T')[0]
         const endDateStr = categoryEndDate.toISOString().split('T')[0]
         const response = await getRevenueByCategoryPie(startDateStr, endDateStr)
         setCategoryData(response.data.data)
      } catch (error) {
         console.error('Error fetching revenue by category:', error)
      }
   }

   React.useEffect(() => {
      fetchRevenueByInterval()
   }, [revenueStartDate, revenueEndDate, interval])

   React.useEffect(() => {
      fetchRevenueByCategoryPie()
   }, [categoryStartDate, categoryEndDate])

   // Format ngày tháng
   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
      } catch (error) {
         return 'Không xác định'
      }
   }

   // Lấy trạng thái đơn hàng
   const getOrderStatus = (status: number) => {
      switch (status) {
         case 0:
            return <span className='px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs'>Chờ xác nhận</span>
         case 1:
            return <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>Đang xử lý</span>
         case 2:
            return <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>Đang giao</span>
         case 3:
            return <span className='px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs'>Đã giao</span>
         case 4:
            return <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs'>Đã hủy</span>
         default:
            return <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs'>Không xác định</span>
      }
   }

   // Format revenue chart data
   const formatRevenueChartData = (data: any) => {
      if (!data?.revenueData) return []

      return Object.entries(data.revenueData).map(([key, value]) => ({
         period: key,
         revenue: value as number
      }))
   }

   // Generate colors for pie chart
   const generateColors = (count: number) => {
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ff0000']
      return colors.slice(0, count)
   }

   return (
      <div className='container p-6'>
         <h1 className='text-2xl font-bold mb-6'>Thống kê tổng quan</h1>

         {/* Thống kê tổng quan */}
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card>
               <CardContent className='p-6 flex items-center justify-between'>
                  <div>
                     <p className='text-sm text-muted-foreground'>Tổng người dùng</p>
                     <h2 className='text-3xl font-bold'>{statistics?.totalUsers || 0}</h2>
                     <p className='text-xs text-muted-foreground mt-1'>+{statistics?.newUsersToday || 0} hôm nay</p>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-full'>
                     <Users className='h-6 w-6 text-blue-600' />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className='p-6 flex items-center justify-between'>
                  <div>
                     <p className='text-sm text-muted-foreground'>Tổng sản phẩm</p>
                     <h2 className='text-3xl font-bold'>{statistics?.totalProducts || 0}</h2>
                     <p className='text-xs text-muted-foreground mt-1'>
                        {statistics?.lowStockProducts || 0} sản phẩm sắp hết hàng
                     </p>
                  </div>
                  <div className='p-3 bg-amber-100 rounded-full'>
                     <Package className='h-6 w-6 text-amber-600' />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className='p-6 flex items-center justify-between'>
                  <div>
                     <p className='text-sm text-muted-foreground'>Tổng đơn hàng</p>
                     <h2 className='text-3xl font-bold'>{statistics?.totalOrders || 0}</h2>
                     <p className='text-xs text-muted-foreground mt-1'>+{statistics?.newOrdersToday || 0} hôm nay</p>
                  </div>
                  <div className='p-3 bg-green-100 rounded-full'>
                     <ShoppingCart className='h-6 w-6 text-green-600' />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className='p-6 flex items-center justify-between'>
                  <div>
                     <p className='text-sm text-muted-foreground'>Tổng doanh thu</p>
                     <h2 className='text-3xl font-bold'>{formatShortCurrency(statistics?.totalRevenue || 0)}</h2>
                     <p className='text-xs text-muted-foreground mt-1'>
                        +{formatCurrency(statistics?.revenueToday || 0)} hôm nay
                     </p>
                  </div>
                  <div className='p-3 bg-purple-100 rounded-full'>
                     <DollarSign className='h-6 w-6 text-purple-600' />
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Thống kê trạng thái đơn hàng */}
         <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mb-6'>
            <Card className='bg-amber-50 border-amber-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <Clock className='h-6 w-6 text-amber-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Chờ xác nhận</p>
                  <h3 className='text-2xl font-bold text-amber-700'>{statistics?.pendingOrders || 0}</h3>
               </CardContent>
            </Card>
            <Card className='bg-blue-50 border-blue-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <TrendingUp className='h-6 w-6 text-blue-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Đang xử lý</p>
                  <h3 className='text-2xl font-bold text-blue-700'>{statistics?.processingOrders || 0}</h3>
               </CardContent>
            </Card>
            <Card className='bg-green-50 border-green-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <Truck className='h-6 w-6 text-green-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Đang giao</p>
                  <h3 className='text-2xl font-bold text-green-700'>{statistics?.shippedOrders || 0}</h3>
               </CardContent>
            </Card>
            <Card className='bg-emerald-50 border-emerald-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <CheckCircle className='h-6 w-6 text-emerald-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Đã giao</p>
                  <h3 className='text-2xl font-bold text-emerald-700'>{statistics?.deliveredOrders || 0}</h3>
               </CardContent>
            </Card>
            <Card className='bg-emerald-50 border-emerald-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <CheckCircle className='h-6 w-6 text-emerald-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Hoàn thành</p>
                  <h3 className='text-2xl font-bold text-emerald-700'>{statistics?.completedOrders || 0}</h3>
               </CardContent>
            </Card>
            <Card className='bg-red-50 border-red-200'>
               <CardContent className='p-4 flex flex-col items-center justify-center'>
                  <XCircle className='h-6 w-6 text-red-600 mb-2' />
                  <p className='text-sm text-muted-foreground'>Đã hủy</p>
                  <h3 className='text-2xl font-bold text-red-700'>{statistics?.cancelledOrders || 0}</h3>
               </CardContent>
            </Card>
         </div>

         <Tabs defaultValue='orders' className='w-full'>
            <TabsList className='mb-4 flex-wrap h-full'>
               <TabsTrigger value='orders'>Đơn hàng gần đây</TabsTrigger>
               <TabsTrigger value='products'>Sản phẩm bán chạy</TabsTrigger>
               <TabsTrigger value='customers'>Khách hàng hàng đầu</TabsTrigger>
               {/* <TabsTrigger value='charts'>Biểu đồ</TabsTrigger> */}
               <TabsTrigger value='revenue-interval'>Doanh thu theo thời gian</TabsTrigger>
               <TabsTrigger value='revenue-category'>Doanh thu theo danh mục</TabsTrigger>
            </TabsList>

            {/* Tab đơn hàng gần đây */}
            <TabsContent value='orders'>
               <Card>
                  <CardHeader>
                     <CardTitle>Đơn hàng gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Mã đơn</TableHead>
                              <TableHead>Khách hàng</TableHead>
                              <TableHead>Ngày đặt</TableHead>
                              <TableHead>Tổng tiền</TableHead>
                              <TableHead>Trạng thái</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {statistics?.recentOrders && statistics?.recentOrders.length > 0 ? (
                              statistics?.recentOrders.map((order) => (
                                 <TableRow key={order.id}>
                                    <TableCell className='font-medium'>#{order.id}</TableCell>
                                    <TableCell>{order.userName}</TableCell>
                                    <TableCell>{formatDate(order.createAt)}</TableCell>
                                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                                    <TableCell>{getOrderStatus(order.orderStatus)}</TableCell>
                                 </TableRow>
                              ))
                           ) : (
                              <TableRow>
                                 <TableCell colSpan={5} className='text-center py-4'>
                                    Không có đơn hàng nào
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* Tab sản phẩm bán chạy */}
            <TabsContent value='products'>
               <Card>
                  <CardHeader>
                     <CardTitle>Các sản phẩm bán chạy</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Tên sản phẩm</TableHead>
                              <TableHead>Giá</TableHead>
                              <TableHead className='text-right'>Đã bán</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {statistics?.topSellingProducts && statistics?.topSellingProducts.length > 0 ? (
                              statistics?.topSellingProducts.slice(0, 10).map((product) => (
                                 <TableRow key={product.id}>
                                    <TableCell className='font-medium'>{product.id}</TableCell>
                                    <TableCell title={decodeHTML(product.name)}>
                                       {decodeHTML(product.name.slice(0, 100))}{' '}
                                       {product.name.length <= 100 ? '' : '...'}
                                    </TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell className='text-right'>{product.soldQuantity}</TableCell>
                                 </TableRow>
                              ))
                           ) : (
                              <TableRow>
                                 <TableCell colSpan={4} className='text-center py-4'>
                                    Không có sản phẩm nào
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* Tab khách hàng hàng đầu */}
            <TabsContent value='customers'>
               <Card>
                  <CardHeader>
                     <CardTitle>Khách hàng hàng đầu</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Tên người dùng</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className='text-right'>Số đơn hàng</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {statistics?.topCustomers && statistics?.topCustomers.length > 0 ? (
                              statistics?.topCustomers.map((customer) => (
                                 <TableRow key={customer.id}>
                                    <TableCell className='font-medium'>{customer.id}</TableCell>
                                    <TableCell>{customer.userName}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell className='text-right'>{customer.orderCount}</TableCell>
                                 </TableRow>
                              ))
                           ) : (
                              <TableRow>
                                 <TableCell colSpan={4} className='text-center py-4'>
                                    Không có khách hàng nào
                                 </TableCell>
                              </TableRow>
                           )}
                        </TableBody>
                     </Table>
                  </CardContent>
               </Card>
            </TabsContent>

            {/* Tab biểu đồ */}
            <TabsContent value='charts'>
               <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <Card>
                     <CardHeader>
                        <CardTitle>Sản phẩm bán chạy</CardTitle>
                     </CardHeader>
                     <CardContent className='h-80'>
                        <ResponsiveContainer width='100%' height='100%'>
                           <BarChart
                              data={
                                 statistics?.topSellingProducts?.map((item) => ({
                                    ...item,
                                    name: decodeHTML(item.name.slice(0, 30) + '...')
                                 })) || []
                              }
                              layout='vertical'
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                           >
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis type='number' />
                              <YAxis type='category' dataKey='name' width={150} tick={{ fontSize: 12 }} />
                              <Tooltip formatter={(value, name) => [value, 'Đã bán']} />
                              <Bar dataKey='soldQuantity' fill='#8884d8' />
                           </BarChart>
                        </ResponsiveContainer>
                     </CardContent>
                  </Card>
               </div>
            </TabsContent>

            {/* Tab doanh thu theo thời gian */}
            <TabsContent value='revenue-interval'>
               <Card>
                  <CardHeader>
                     <CardTitle>Doanh thu theo thời gian</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className='mb-6 space-y-4'>
                        <div className='flex flex-wrap gap-4 items-end'>
                           <div className='space-y-2'>
                              <Label>Ngày bắt đầu</Label>
                              <DatePicker
                                 value={revenueStartDate}
                                 onChange={(date) => date && setRevenueStartDate(date)}
                              />
                           </div>
                           <div className='space-y-2'>
                              <Label>Ngày kết thúc</Label>
                              <DatePicker value={revenueEndDate} onChange={(date) => date && setRevenueEndDate(date)} />
                           </div>
                        </div>

                        <div className='space-y-2'>
                           <Label>Đơn vị thời gian</Label>
                           <RadioGroup
                              value={interval}
                              onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setInterval(value)}
                              className='flex flex-wrap gap-4'
                           >
                              <div className='flex items-center space-x-2'>
                                 <RadioGroupItem value='day' id='day' />
                                 <Label htmlFor='day'>Ngày</Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                 <RadioGroupItem value='week' id='week' />
                                 <Label htmlFor='week'>Tuần</Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                 <RadioGroupItem value='month' id='month' />
                                 <Label htmlFor='month'>Tháng</Label>
                              </div>
                              <div className='flex items-center space-x-2'>
                                 <RadioGroupItem value='year' id='year' />
                                 <Label htmlFor='year'>Năm</Label>
                              </div>
                           </RadioGroup>
                        </div>
                     </div>

                     <div className='h-96'>
                        <ResponsiveContainer width='100%' height='100%'>
                           <BarChart data={formatRevenueChartData(revenueData)}>
                              <CartesianGrid strokeDasharray='3 3' />
                              <XAxis dataKey='period' />
                              <YAxis tickFormatter={(value) => formatCurrency(value)} />
                              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Doanh thu']} />
                              <Bar dataKey='revenue' fill='#8884d8' />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>

                     {revenueData && (
                        <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                           <Card>
                              <CardContent className='p-4'>
                                 <p className='text-sm text-muted-foreground'>Tổng doanh thu</p>
                                 <p className='text-2xl font-bold'>{formatCurrency(revenueData.totalRevenue)}</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className='p-4'>
                                 <p className='text-sm text-muted-foreground'>Doanh thu trung bình</p>
                                 <p className='text-2xl font-bold'>{formatCurrency(revenueData.averageRevenue)}</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className='p-4'>
                                 <p className='text-sm text-muted-foreground'>Khoảng thời gian</p>
                                 <p className='text-sm'>
                                    {revenueData.startDate} - {revenueData.endDate}
                                 </p>
                              </CardContent>
                           </Card>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            {/* Tab doanh thu theo danh mục */}
            <TabsContent value='revenue-category'>
               <Card>
                  <CardHeader>
                     <CardTitle>Doanh thu theo danh mục</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className='mb-6 flex flex-wrap gap-4 items-end'>
                        <div className='space-y-2'>
                           <Label>Ngày bắt đầu</Label>
                           <DatePicker
                              value={categoryStartDate}
                              onChange={(date) => date && setCategoryStartDate(date)}
                           />
                        </div>
                        <div className='space-y-2'>
                           <Label>Ngày kết thúc</Label>
                           <DatePicker value={categoryEndDate} onChange={(date) => date && setCategoryEndDate(date)} />
                        </div>
                     </div>

                     <div className='h-96'>
                        <ResponsiveContainer width='100%' height='100%'>
                           <PieChart>
                              <Pie
                                 data={categoryData?.categoryData || []}
                                 cx='50%'
                                 cy='50%'
                                 labelLine={false}
                                 outerRadius={120}
                                 fill='#8884d8'
                                 dataKey='revenue'
                                 label={({ category, percentage }) => `${category}: ${percentage}%`}
                              >
                                 {(categoryData?.categoryData || []).map((entry: any, index: number) => (
                                    <Cell
                                       key={`cell-${index}`}
                                       fill={generateColors(categoryData?.categoryData?.length || 0)[index]}
                                    />
                                 ))}
                              </Pie>
                              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Doanh thu']} />
                              <Legend />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>

                     {categoryData && (
                        <div className='mt-4'>
                           <Card>
                              <CardContent className='p-4'>
                                 <p className='text-sm text-muted-foreground mb-2'>Chi tiết doanh thu theo danh mục</p>
                                 <div className='space-y-2'>
                                    {categoryData.categoryData?.map((item: any, index: number) => (
                                       <div key={index} className='flex justify-between items-center'>
                                          <div className='flex items-center gap-2'>
                                             <div
                                                className='w-4 h-4 rounded'
                                                style={{
                                                   backgroundColor: generateColors(categoryData.categoryData.length)[
                                                      index
                                                   ]
                                                }}
                                             />
                                             <span>{item.category}</span>
                                          </div>
                                          <div className='text-right'>
                                             <p className='font-semibold'>{formatCurrency(item.revenue)}</p>
                                             <p className='text-sm text-muted-foreground'>{item.percentage}%</p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 <div className='mt-4 pt-4 border-t'>
                                    <div className='flex justify-between items-center font-bold'>
                                       <span>Tổng cộng</span>
                                       <span>{formatCurrency(categoryData.totalRevenue)}</span>
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>
      </div>
   )
}
