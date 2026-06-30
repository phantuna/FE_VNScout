"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const formSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải có ít nhất 6 ký tự.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotStep, setForgotStep] = useState<1 | 2>(1)
  const [forgotOtp, setForgotOtp] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [showForgotModal, setShowForgotModal] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      // apiFetch đã tự unwrap ApiResponse → response = { token, refreshToken, authenticated }
      const token = response?.token
      const refreshToken = response?.refreshToken

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken)
      }

      if (token) {
        login(token, { username: values.email.split('@')[0] })
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Đăng nhập thành công!</span>
            </div>
          ) as any,
          description: "Chào mừng bạn quay trở lại.",
        })
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>Lỗi xác thực</span>
            </div>
          ) as any,
          description: "Không nhận được token từ máy chủ.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Đăng nhập thất bại</span>
          </div>
        ) as any,
        description: error.data?.message || "Kiểm tra lại email và mật khẩu của bạn.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (forgotStep === 1) {
      if (!forgotEmail || !forgotEmail.includes("@")) {
        toast({
          variant: "destructive",
          title: "Email không hợp lệ",
          description: "Vui lòng nhập địa chỉ email hợp lệ để lấy lại mật khẩu.",
        })
        return
      }

      setIsForgotLoading(true)
      try {
        await apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: forgotEmail }) })

        toast({
          title: "Đã gửi hướng dẫn!",
          description: "Vui lòng kiểm tra hộp thư email của bạn để lấy mã OTP.",
        })
        setForgotStep(2)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Không thể gửi OTP",
          description: error.data?.message || "Kiểm tra lại email hoặc thử lại sau.",
        })
      } finally {
        setIsForgotLoading(false)
      }
    } else {
      if (!forgotOtp || forgotNewPassword.length < 6) {
        toast({
          variant: "destructive",
          title: "Thông tin không hợp lệ",
          description: "Mã OTP không được để trống và mật khẩu mới phải có ít nhất 6 ký tự.",
        })
        return
      }

      setIsForgotLoading(true)
      try {
        await apiFetch("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({
            email: forgotEmail,
            otp: forgotOtp,
            newPassword: forgotNewPassword
          })
        })

        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Đổi mật khẩu thành công!</span>
            </div>
          ) as any,
          description: "Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.",
        })
        setShowForgotModal(false)
        setForgotStep(1)
        setForgotEmail("")
        setForgotOtp("")
        setForgotNewPassword("")
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Khôi phục thất bại",
          description: error.data?.message || "Mã OTP không đúng hoặc đã hết hạn.",
        })
      } finally {
        setIsForgotLoading(false)
      }
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Camera className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Chào mừng trở lại</h1>
        <p className="text-sm text-muted-foreground">
          Nhập email và mật khẩu của bạn để đăng nhập
        </p>
      </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <div className="flex justify-end">
                  <span
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-3 text-center text-sm mt-2">
        <div>
          Chưa có tài khoản?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </div>
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary transition-colors hover:underline mx-auto mt-2"
        >
          Tiếp tục dưới tư cách Khách
        </Link>
      </div>

      <Dialog
        open={showForgotModal}
        onOpenChange={(open) => {
          setShowForgotModal(open)
          if (!open) {
            setForgotStep(1)
            setForgotOtp("")
            setForgotNewPassword("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quên mật khẩu?</DialogTitle>
            <DialogDescription>
              {forgotStep === 1
                ? "Nhập địa chỉ email đã đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu qua email."
                : "Nhập mã OTP chúng tôi vừa gửi vào email của bạn cùng với mật khẩu mới."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
            {forgotStep === 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isForgotLoading}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Mã xác nhận (OTP)</label>
                  <Input
                    type="text"
                    placeholder="Nhập mã 6 số"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    disabled={isForgotLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Mật khẩu mới</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    disabled={isForgotLoading}
                    required
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {forgotStep === 1 ? "Gửi yêu cầu khôi phục" : "Xác nhận đổi mật khẩu"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
