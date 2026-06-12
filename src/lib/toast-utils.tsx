import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export function showLoginRequiredToast(router?: any) {
  toast({
    className: "bg-white border-slate-200 shadow-lg p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors",
    title: (
      <div className="flex items-center gap-2 text-slate-800">
         <Lock className="h-5 w-5 text-primary" />
         <span className="font-bold text-base">Yêu cầu đăng nhập</span>
      </div>
    ) as any,
    description: "Bạn cần đăng nhập để sử dụng chức năng",
    onClick: () => {
      if (router) {
        router.push('/login');
      } else {
        window.location.href = '/login';
      }
    }
  });
}

export function showSuccessToast(title: string, description?: string) {
  toast({
    className: "bg-white border-slate-200 shadow-lg p-4 rounded-xl flex items-start gap-3",
    title: (
      <div className="flex items-center gap-2 text-emerald-600">
         <CheckCircle2 className="h-5 w-5" />
         <span className="font-bold text-base">{title}</span>
      </div>
    ) as any,
    description: description ? (
      <span className="text-slate-600 font-medium ml-7">{description}</span>
    ) as any : undefined,
  });
}

export function showErrorToast(title: string, description?: string) {
  toast({
    className: "bg-white border-rose-200 shadow-lg p-4 rounded-xl flex items-start gap-3",
    title: (
      <div className="flex items-center gap-2 text-rose-600">
         <AlertCircle className="h-5 w-5" />
         <span className="font-bold text-base">{title}</span>
      </div>
    ) as any,
    description: description ? (
      <span className="text-slate-600 font-medium ml-7">{description}</span>
    ) as any : undefined,
    variant: "destructive"
  });
}
