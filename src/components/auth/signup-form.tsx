"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

import { apiFetch } from "@/services/api.service"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Tên người dùng phải có ít nhất 3 ký tự.",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
})

export function SignupForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          // birthday if needed can be added here
        }),
      })
      
      // Chuyển hướng về trang login sau khi đăng ký thành công
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Đăng ký thành công!</span>
          </div>
        ) as any,
        description: "Đang chuyển hướng đến trang đăng nhập...",
      })
      setTimeout(() => router.push("/login"), 1500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Đăng ký thất bại</span>
          </div>
        ) as any,
        description: error.data?.message || "Tên người dùng hoặc email có thể đã tồn tại.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Camera className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Điền thông tin bên dưới để tạo tài khoản mới
        </p>
      </div>



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
               <FormItem>
                <FormLabel>Tên người dùng</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
               <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
               <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-3 text-center text-sm mt-2">
        <div>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
        <Link 
          href="/" 
          className="text-muted-foreground hover:text-primary transition-colors hover:underline mx-auto mt-2"
        >
          Tiếp tục dưới tư cách Khách
        </Link>
      </div>
    </div>
  )
}
