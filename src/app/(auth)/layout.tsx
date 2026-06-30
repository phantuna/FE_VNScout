import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-muted lg:block relative">
        <Image
          src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"
          alt="Authentication background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
        <div className="absolute bottom-10 left-10 text-white">
          <h2 className="text-3xl font-bold">Photo Scout</h2>
          <p className="mt-2 max-w-md text-lg text-white/80">
            Khám phá, lưu giữ và chia sẻ những địa điểm chụp ảnh tuyệt đẹp nhất cùng cộng đồng.
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center lg:w-1/2 p-8">
        {children}
      </div>
    </div>
  )
}
