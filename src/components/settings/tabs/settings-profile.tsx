"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Camera, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { apiFetch } from "@/services/api.service"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Tên người dùng phải có ít nhất 2 ký tự.",
  }),
  bio: z.string().max(160).optional(),
  email: z.string().email(),
})

export function SettingsProfile() {
  const { user, updateUserData } = useAuth()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    setErrorMsg("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await apiFetch("/api/photos/upload-avatar", {
        method: "POST",
        body: formData,
      })

      if (response && response.avatarUrl) {
        updateUserData({
          avatarUrl: response.avatarUrl
        })

        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Ảnh đại diện đã cập nhật!</span>
            </div>
          ) as any,
          description: "Ảnh đại diện mới của bạn đã được tải lên và lưu thành công.",
        })
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Tải ảnh đại diện thất bại")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      email: "",
    },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        bio: user.bio || "",
        email: user.email || "",
      })
    }
  }, [user, profileForm])

  async function onProfileSubmit(data: z.infer<typeof profileFormSchema>) {
    if (!user) return
    setIsSaving(true)
    setErrorMsg("")
    try {
      const response = await apiFetch(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          description: data.bio,
        }),
      })

      updateUserData(response)

      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Cập nhật thành công!</span>
          </div>
        ) as any,
        description: "Thông tin hồ sơ của bạn đã được lưu lại.",
      })
    } catch (error: any) {
      setErrorMsg(error.message || "Lưu thông tin thất bại")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hồ sơ cá nhân</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Thông tin này sẽ được hiển thị công khai cho mọi người.
        </p>
        <Separator className="mb-6" />
      </div>

      {errorMsg && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {errorMsg}
        </div>
      )}

      {/* Premium Avatar Upload Section */}
      <div className="flex items-center gap-6 rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm max-w-xl">
        <div className="relative group">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20 transition-transform group-hover:scale-105">
            <AvatarImage src={user?.avatarUrl || "/default-avatar.svg"} className="object-cover" />
            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Hover overlay button to trigger file picker */}
          <label
            htmlFor="avatar-input"
            className={cn(
              "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300",
              isUploadingAvatar && "opacity-100 bg-black/60 pointer-events-none"
            )}
          >
            {isUploadingAvatar ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Camera className="h-6 w-6 transform scale-90 group-hover:scale-100 transition-transform" />
            )}
          </label>
          <input
            type="file"
            id="avatar-input"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={isUploadingAvatar}
          />
        </div>

        <div>
          <h4 className="text-base font-semibold text-foreground">Ảnh đại diện của bạn</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Định dạng hỗ trợ: JPG, PNG, WEBP.
            <br />Tự động tối ưu hóa kích thước giúp tải trang nhanh hơn.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="relative"
              disabled={isUploadingAvatar}
              asChild
            >
              <label htmlFor="avatar-input" className="cursor-pointer">
                Thay đổi ảnh
              </label>
            </Button>
          </div>
        </div>
      </div>

      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
          <FormField
            control={profileForm.control}
            name="username"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Tên người dùng (Username)</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormDescription>
                   Đây là tên định danh công khai của bạn, ví dụ: @{field.value}
                 </FormDescription>
                 <FormMessage />
               </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="email"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Email</FormLabel>
                 <FormControl>
                   <Input {...field} />
                 </FormControl>
                 <FormDescription>
                   Email dùng để đăng nhập và nhận thông báo.
                 </FormDescription>
                 <FormMessage />
               </FormItem>
            )}
          />
          <FormField
            control={profileForm.control}
            name="bio"
            render={({ field }) => (
               <FormItem>
                 <FormLabel>Tiểu sử</FormLabel>
                 <FormControl>
                   <Textarea
                     placeholder="Viết một chút về bạn..."
                     className="resize-none h-24"
                     {...field}
                   />
                 </FormControl>
                 <FormMessage />
               </FormItem>
            )}
          />
          <Button type="submit" disabled={isSaving}>Cập nhật hồ sơ</Button>
        </form>
      </Form>
    </div>
  )
}
