import z from 'zod'

export const RegisterBody = z
   .object({
      email: z.string().email('Email không hợp lệ'),
      password: z
         .string()
         .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
         .max(100, { message: 'Mật khẩu không được quá 100 kí tự' }),
      userName: z
         .string()
         .min(3, { message: 'Tên đăng nhập phải có ít nhất 3 kí tự' })
         .max(50, { message: 'Tên đăng nhập không được quá 50 kí tự' }),
      phone: z.string().regex(/^[0-9]{10}$/, { message: 'Số điện thoại không hợp lệ' }),
      surName: z.string().min(1, { message: 'Vui lòng nhập họ' }).max(50, { message: 'Họ không được quá 50 kí tự' }),
      lastName: z.string().min(1, { message: 'Vui lòng nhập tên' }).max(50, { message: 'Tên không được quá 50 kí tự' }),
      address: z
         .string()
         .min(5, { message: 'Địa chỉ phải có ít nhất 5 kí tự' })
         .max(200, { message: 'Địa chỉ không được quá 200 kí tự' }),
      dateOfBirth: z.string().refine(
         (date) => {
            const today = new Date()
            const birthDate = new Date(date)
            const age = today.getFullYear() - birthDate.getFullYear()
            return age >= 16
         },
         { message: 'Bạn phải đủ 16 tuổi' }
      ),
      gender: z.enum(['male', 'female', 'other'], {
         errorMap: () => ({ message: 'Vui lòng chọn giới tính' })
      })
   })
   .strict()

export type RegisterBodyType = z.TypeOf<typeof RegisterBody>

export const LoginBody = z
   .object({
      userName: z
         .string()
         .min(3, { message: 'Tên đăng nhập phải có ít nhất 3 kí tự' })
         .max(50, { message: 'Tên đăng nhập không được quá 50 kí tự' }),
      password: z
         .string()
         .min(6, { message: 'Mật khẩu phải có ít nhất 6 kí tự' })
         .max(100, { message: 'Mật khẩu không được quá 100 kí tự' })
   })
   .strict()

export type LoginBodyType = z.TypeOf<typeof LoginBody>
