"use client"

import { Bell, Lock, User, Palette } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

import { SettingsProfile } from "./tabs/settings-profile"
import { SettingsNotify } from "./tabs/settings-notify"
import { SettingsSecurity } from "./tabs/settings-security"

export function SettingsView() {
  return (
    <div className="container mx-auto max-w-4xl p-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin tài khoản và tùy chọn ứng dụng của bạn.
        </p>
      </div>

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-6 md:gap-10">
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-transparent p-0 space-y-1 justify-start">
          <TabsTrigger
            value="profile"
            className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <User className="h-4 w-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <Bell className="h-4 w-4" />
            Thông báo
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <Palette className="h-4 w-4" />
            Giao diện
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="w-full justify-start gap-2 px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            <Lock className="h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="profile" className="m-0 border-none p-0 outline-none">
            <SettingsProfile />
          </TabsContent>

          <TabsContent value="notifications" className="m-0 border-none p-0 outline-none">
            <SettingsNotify />
          </TabsContent>

          <TabsContent value="appearance" className="m-0 space-y-6">
            <div>
              <h3 className="text-lg font-medium">Giao diện</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tính năng đang được phát triển...
              </p>
              <Separator className="mb-6" />
            </div>
          </TabsContent>

          <TabsContent value="security" className="m-0 border-none p-0 outline-none">
            <SettingsSecurity />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
