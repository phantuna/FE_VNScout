"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const notificationsFormSchema = z.object({
  newFollowers: z.boolean().default(false).optional(),
  newComments: z.boolean().default(false).optional(),
  newLikes: z.boolean().default(false).optional(),
  marketingEmails: z.boolean().default(false).optional(),
})

export function SettingsNotify() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      newFollowers: true,
      newComments: true,
      newLikes: false,
      marketingEmails: false,
    },
  })

  function onNotificationsSubmit(data: z.infer<typeof notificationsFormSchema>) {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Đã lưu cài đặt!</span>
          </div>
        ) as any,
        description: "Tùy chọn thông báo của bạn đã được cập nhật.",
      })
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thông báo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Định cấu hình cách bạn nhận thông báo.
        </p>
        <Separator className="mb-6" />
      </div>

      <Form {...notificationsForm}>
        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6 max-w-xl">
          <div className="space-y-4">
            <FormField
              control={notificationsForm.control}
              name="newFollowers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Người theo dõi mới</FormLabel>
                    <FormDescription>
                      Nhận thông báo khi ai đó theo dõi bạn.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={notificationsForm.control}
              name="newComments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Bình luận mới</FormLabel>
                    <FormDescription>
                      Nhận thông báo khi ai đó bình luận bài viết của bạn.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={notificationsForm.control}
              name="newLikes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Lượt thích mới</FormLabel>
                    <FormDescription>
                      Nhận thông báo khi ai đó thích bài viết của bạn.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isSaving}>Lưu tùy chọn</Button>
        </form>
      </Form>
    </div>
  )
}
