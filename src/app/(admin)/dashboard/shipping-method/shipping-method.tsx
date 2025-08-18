'use client'
import { useCreateShippingMethod, useGetAllShippingMethod, useUpdateShippingMethod } from '@/queries/useAdmin'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Edit, Plus } from 'lucide-react'
import { ShippingMethodType } from '@/types/admin.type'
import { toast } from 'react-toastify'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function ShippingMethod() {
   const getAllShippingMethod = useGetAllShippingMethod()
   const shippingMethods = getAllShippingMethod.data?.data.data || []

   const createShippingMethod = useCreateShippingMethod()
   const updateShippingMethod = useUpdateShippingMethod()

   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
   const [newShippingMethod, setNewShippingMethod] = useState<Partial<ShippingMethodType>>({
      methodName: '',
      description: '',
      baseCost: 0,
      estimatedDays: '',
      isActive: true
   })
   const [editingShippingMethod, setEditingShippingMethod] = useState<ShippingMethodType | null>(null)

   const handleAddShippingMethod = () => {
      if (!newShippingMethod.methodName?.trim()) {
         toast.error('Tên phương thức vận chuyển không được để trống')
         return
      }

      if (newShippingMethod.baseCost === undefined || newShippingMethod.baseCost < 0) {
         toast.error('Chi phí cơ bản phải lớn hơn hoặc bằng 0')
         return
      }

      createShippingMethod.mutate(newShippingMethod as ShippingMethodType, {
         onSuccess: () => {
            setIsAddDialogOpen(false)
            setNewShippingMethod({
               methodName: '',
               description: '',
               baseCost: 0,
               estimatedDays: '',
               isActive: true
            })
         }
      })
   }

   const handleEditShippingMethod = () => {
      if (!editingShippingMethod || !editingShippingMethod.methodName.trim()) {
         toast.error('Tên phương thức vận chuyển không được để trống')
         return
      }

      if (editingShippingMethod.baseCost < 0) {
         toast.error('Chi phí cơ bản phải lớn hơn hoặc bằng 0')
         return
      }

      updateShippingMethod.mutate(editingShippingMethod, {
         onSuccess: () => {
            setIsEditDialogOpen(false)
            setEditingShippingMethod(null)
         }
      })
   }

   const openEditDialog = (shippingMethod: ShippingMethodType) => {
      setEditingShippingMethod({ ...shippingMethod })
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
            <h1 className='text-2xl font-bold'>Quản lý phương thức vận chuyển</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
               <Plus className='mr-2 h-4 w-4' /> Thêm phương thức vận chuyển
            </Button>
         </div>

         {getAllShippingMethod.isLoading ? (
            <div className='text-center py-4'>Đang tải...</div>
         ) : (
            <Table className='overflow-auto'>
               <TableHeader>
                  <TableRow>
                     <TableHead className='w-[80px]'>ID</TableHead>
                     <TableHead>Tên phương thức</TableHead>
                     <TableHead>Mô tả</TableHead>
                     <TableHead>Chi phí</TableHead>
                     <TableHead>Thời gian dự kiến</TableHead>
                     <TableHead>Trạng thái</TableHead>
                     <TableHead>Ngày tạo</TableHead>
                     <TableHead>Cập nhật lần cuối</TableHead>
                     <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {shippingMethods.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={9} className='text-center'>
                           Không có phương thức vận chuyển nào
                        </TableCell>
                     </TableRow>
                  ) : (
                     shippingMethods.map((method) => (
                        <TableRow key={method.id}>
                           <TableCell>{method.id}</TableCell>
                           <TableCell className='font-medium'>{method.methodName}</TableCell>
                           <TableCell title={method.description} className='max-w-[200px] truncate'>
                              {method.description}
                           </TableCell>
                           <TableCell>{method.baseCost.toLocaleString('vi-VN')} đ</TableCell>
                           <TableCell>{method.estimatedDays}</TableCell>
                           <TableCell>
                              {method.isActive ? (
                                 <span className='px-2 py-1 bg-green-100 text-green-800 whitespace-nowrap rounded-full text-xs'>
                                    Hoạt động
                                 </span>
                              ) : (
                                 <span className='px-2 py-1 bg-red-100 text-red-800 whitespace-nowrap rounded-full text-xs'>
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

         {/* Dialog thêm phương thức vận chuyển */}
         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Thêm phương thức vận chuyển mới</DialogTitle>
               </DialogHeader>
               <div className='grid gap-4 py-4'>
                  <div className='grid gap-2'>
                     <Label htmlFor='methodName'>Tên phương thức vận chuyển</Label>
                     <Input
                        id='methodName'
                        value={newShippingMethod.methodName}
                        onChange={(e) => setNewShippingMethod({ ...newShippingMethod, methodName: e.target.value })}
                        placeholder='Nhập tên phương thức vận chuyển'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='description'>Mô tả</Label>
                     <Textarea
                        id='description'
                        value={newShippingMethod.description}
                        onChange={(e) => setNewShippingMethod({ ...newShippingMethod, description: e.target.value })}
                        placeholder='Nhập mô tả phương thức vận chuyển'
                        rows={3}
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='baseCost'>Chi phí cơ bản (VNĐ)</Label>
                     <Input
                        id='baseCost'
                        type='number'
                        value={newShippingMethod.baseCost}
                        onChange={(e) =>
                           setNewShippingMethod({ ...newShippingMethod, baseCost: parseFloat(e.target.value) })
                        }
                        placeholder='Nhập chi phí cơ bản'
                     />
                  </div>
                  <div className='grid gap-2'>
                     <Label htmlFor='estimatedDays'>Thời gian dự kiến</Label>
                     <Input
                        id='estimatedDays'
                        value={newShippingMethod.estimatedDays}
                        onChange={(e) => setNewShippingMethod({ ...newShippingMethod, estimatedDays: e.target.value })}
                        placeholder='Ví dụ: 2-3 ngày'
                     />
                  </div>
                  <div className='flex items-center gap-2'>
                     <Switch
                        id='isActive'
                        checked={newShippingMethod.isActive}
                        onCheckedChange={(checked) => setNewShippingMethod({ ...newShippingMethod, isActive: checked })}
                     />
                     <Label htmlFor='isActive'>Kích hoạt</Label>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
                     Hủy
                  </Button>
                  <Button onClick={handleAddShippingMethod} disabled={createShippingMethod.isPending}>
                     {createShippingMethod.isPending ? 'Đang xử lý...' : 'Thêm phương thức'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Dialog chỉnh sửa phương thức vận chuyển */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Chỉnh sửa phương thức vận chuyển</DialogTitle>
               </DialogHeader>
               {editingShippingMethod && (
                  <div className='grid gap-4 py-4'>
                     <div className='grid gap-2'>
                        <Label htmlFor='editMethodName'>Tên phương thức vận chuyển</Label>
                        <Input
                           id='editMethodName'
                           value={editingShippingMethod.methodName}
                           onChange={(e) =>
                              setEditingShippingMethod({ ...editingShippingMethod, methodName: e.target.value })
                           }
                           placeholder='Nhập tên phương thức vận chuyển'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editDescription'>Mô tả</Label>
                        <Textarea
                           id='editDescription'
                           value={editingShippingMethod.description}
                           onChange={(e) =>
                              setEditingShippingMethod({ ...editingShippingMethod, description: e.target.value })
                           }
                           placeholder='Nhập mô tả phương thức vận chuyển'
                           rows={3}
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editBaseCost'>Chi phí cơ bản (VNĐ)</Label>
                        <Input
                           id='editBaseCost'
                           type='number'
                           value={editingShippingMethod.baseCost}
                           onChange={(e) =>
                              setEditingShippingMethod({
                                 ...editingShippingMethod,
                                 baseCost: parseFloat(e.target.value)
                              })
                           }
                           placeholder='Nhập chi phí cơ bản'
                        />
                     </div>
                     <div className='grid gap-2'>
                        <Label htmlFor='editEstimatedDays'>Thời gian dự kiến</Label>
                        <Input
                           id='editEstimatedDays'
                           value={editingShippingMethod.estimatedDays}
                           onChange={(e) =>
                              setEditingShippingMethod({ ...editingShippingMethod, estimatedDays: e.target.value })
                           }
                           placeholder='Ví dụ: 2-3 ngày'
                        />
                     </div>
                     <div className='flex items-center gap-2'>
                        <Switch
                           id='editIsActive'
                           checked={editingShippingMethod.isActive}
                           onCheckedChange={(checked) =>
                              setEditingShippingMethod({ ...editingShippingMethod, isActive: checked })
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
                  <Button onClick={handleEditShippingMethod} disabled={updateShippingMethod.isPending}>
                     {updateShippingMethod.isPending ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   )
}
