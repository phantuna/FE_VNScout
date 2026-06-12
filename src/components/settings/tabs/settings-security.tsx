"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/services/api.service"

export function SettingsSecurity() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Xác nhận mật khẩu không khớp",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      await apiFetch("/users/change-password", {
        method: "PUT",
        body: JSON.stringify(formData)
      })
      
      toast({
        title: "Thành công",
        description: "Mật khẩu của bạn đã được thay đổi thành công."
      })
      
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (error: any) {
      toast({
        title: "Lỗi đổi mật khẩu",
        description: error.message || "Mật khẩu cũ không chính xác hoặc có lỗi xảy ra",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Bảo mật</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cập nhật mật khẩu để bảo vệ tài khoản của bạn.
        </p>
        <Separator className="mb-6" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
          <Input 
            id="oldPassword" 
            name="oldPassword"
            type="password" 
            placeholder="Nhập mật khẩu hiện tại"
            value={formData.oldPassword}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">Mật khẩu mới</Label>
          <Input 
            id="newPassword" 
            name="newPassword"
            type="password" 
            placeholder="Nhập mật khẩu mới" 
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword"
            type="password" 
            placeholder="Nhập lại mật khẩu mới" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </div>
  )
}
