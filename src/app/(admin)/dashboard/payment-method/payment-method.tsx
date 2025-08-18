'use client'
import { useCreatePaymentMethod, useGetAllPaymentMethod, useUpdatePaymentMethod } from '@/queries/useAdmin'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Edit, Plus } from 'lucide-react'
import { PaymentMethodType } from '@/types/admin.type'
import { toast } from 'react-toastify'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function PaymentMethod() {
   const getAllPaymentMethod = useGetAllPaymentMethod()
   const paymentMethods = getAllPaymentMethod.data?.data.data || []

   const createPaymentMethod = useCreatePaymentMethod()
   const updatePaymentMethod = useUpdatePaymentMethod()

   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [newPaymentMethod, setNewPaymentMethod] = useState<Partial<PaymentMethodType>>({
      methodName: '',
      description: '',
      isActive: true
   })
   const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodType | null>(null)

   const handleAddPaymentMethod = () => {
      if (!newPaymentMethod.methodName?.trim()) {
         toast.error('Tên phương thức thanh toán không được để trống')
         return
      }

      createPaymentMethod.mutate(newPaymentMethod as PaymentMethodType, {
         onSuccess: () => {
            setIsAddDialogOpen(false)
            setNewPaymentMethod({
               methodName: '',
               description: '',
               isActive: true
            })
         }
      })
   }

   const handleEditPaymentMethod = () => {
      if (!editingPaymentMethod || !editingPaymentMethod.methodName.trim()) {
         toast.error('Tên phương thức thanh toán không được để trống')
         return
      }

      updatePaymentMethod.mutate(editingPaymentMethod, {
         onSuccess: () => {
            setIsEditDialogOpen(false)
            setEditingPaymentMethod(null)
         }
      })
   }

   const openEditDialog = (paymentMethod: PaymentMethodType) => {
      setEditingPaymentMethod({ ...paymentMethod })
      setIsEditDialogOpen(true)
   }

   const formatDate = (dateString: string) => {
      try {
         return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi })
      } catch (error) {
         return 'Không xác định'
      }
   }

   return (
      <div className='container mx-auto p-6'>
         <div className='flex justify-between flex-wrap gap-3 items-center mb-6'>
            <h1 className='text-2xl font-bold'>Quản lý phương thức thanh toán</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm phương thức thanh toán
            </Button>
         </div>

         {getAllPaymentMethod.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[80px]'>ID</TableHead>
                     <TableHead>Tên phương thức</TableHead>
                     <TableHead>Mô tả</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead>Ngày tạo</TableHead>
                     <TableHead>Cập nhật lần cuối</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {paymentMethods.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={7} className='text-center'>
                           Không có phương thức thanh toán nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     paymentMethods.map((method) => (
                        <TableRow key={method.id}>
                           <TableCell>{method.id}</TableCell>
                           <TableCell className='font-medium'>{method.methodName}</TableCell>
                           <TableCell title={method.description} className='max-w-[300px] truncate'>
                              {method.description}
                           </TableCell>
                           <TableCell>
                              {method.isActive ? (
                                 <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                                    Hoạt động
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs'>
                                    Không hoạt động
                                 </span>
                              )}
                           </TableCell>
                           <TableCell>{formatDate(method.createdAt)}</TableCell>
                           <TableCell>{formatDate(method.updatedAt)}</TableCell>
                           <TableCell className='text-right'>
                              <Button
                                 variant='outline'
                                 size='icon'
                                 onClick={() => openEditDialog(method)}
                                 className='mr-2'
                              >
                                 <Edit className='h-4 w-4' />
                              </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         )}

         {/* Dialog thêm phương thức thanh toán */}
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Thêm phương thức thanh toán mới</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='methodName'>Tên phương thức thanh toán</Label>
                     <Input
                        id='methodName'
                        value={newPaymentMethod.methodName}
                        onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, methodName: e.target.value })}
                        placeholder='Nhập tên phương thức thanh toán'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='description'>Mô tả</Label>
                     <Textarea
                        id='description'
                        value={newPaymentMethod.description}
                        onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, description: e.target.value })}
                        placeholder='Nhập mô tả phương thức thanh toán'
                        rows={3}
                     />
                  </div>
                  <div className='flex items-center gap-2'>
                     <Switch
                        id='isActive'
                        checked={newPaymentMethod.isActive}
                        onCheckedChange={(checked) => setNewPaymentMethod({ ...newPaymentMethod, isActive: checked })}
                     />
                     <Label htmlFor='isActive'>Kích hoạt</Label>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddPaymentMethod} disabled={createPaymentMethod.isPending}>
                     {createPaymentMethod.isPending ? 'Đang xử lý...' : 'Thêm phương thức'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa phương thức thanh toán */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa phương thức thanh toán</DialogTitle>
               </DialogHeader>
               {editingPaymentMethod && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='editMethodName'>Tên phương thức thanh toán</Label>
                        <Input
                           id='editMethodName'
                           value={editingPaymentMethod.methodName}
                           onChange={(e) =>
                              setEditingPaymentMethod({ ...editingPaymentMethod, methodName: e.target.value })
                           }
                           placeholder='Nhập tên phương thức thanh toán'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editDescription'>Mô tả</Label>
                        <Textarea
                           id='editDescription'
                           value={editingPaymentMethod.description}
                           onChange={(e) =>
                              setEditingPaymentMethod({ ...editingPaymentMethod, description: e.target.value })
                           }
                           placeholder='Nhập mô tả phương thức thanh toán'
                           rows={3}
                        />
                     </div>
                     <div className='flex items-center gap-2'>
                        <Switch
                           id='editIsActive'
                           checked={editingPaymentMethod.isActive}
                           onCheckedChange={(checked) =>
                              setEditingPaymentMethod({ ...editingPaymentMethod, isActive: checked })
                           }
                        />
                        <Label htmlFor='editIsActive'>Kích hoạt</Label>
                     </div>
                  </div>
               )}
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleEditPaymentMethod} disabled={updatePaymentMethod.isPending}>
                     {updatePaymentMethod.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
