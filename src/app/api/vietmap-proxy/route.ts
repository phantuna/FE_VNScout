import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")
  const apikey = searchParams.get("apikey")

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 })
  }

  // Xây dựng URL gốc tới VietMap
  const vietmapUrl = new URL(`https://maps.vietmap.vn/${path}`)
  
  // Sao chép tất cả query params (bao gồm apikey)
  searchParams.forEach((value, key) => {
    if (key !== "path") {
      vietmapUrl.searchParams.set(key, value)
    }
  })

  try {
    const response = await fetch(vietmapUrl.toString(), {
      headers: {
        "Referer": "https://maps.vietmap.vn/", // Spoof referrer để vượt 401/403
        "Origin": "https://maps.vietmap.vn",
        "User-Agent": request.headers.get("user-agent") || ""
      },
    })

    if (!response.ok) {
      console.error(`VietMap Proxy Error: ${response.status} ${response.statusText} for ${vietmapUrl.toString()}`)
      return new NextResponse(response.body, { status: response.status })
    }

    // Chỉ lấy Content-Type, loại bỏ Content-Encoding vì Node.js fetch đã tự động giải nén dữ liệu
    const newHeaders = new Headers()
    newHeaders.set("Access-Control-Allow-Origin", "*")
    newHeaders.set("Cache-Control", "public, max-age=3600")
    
    const contentType = response.headers.get("content-type")
    if (contentType) {
      newHeaders.set("Content-Type", contentType)
    }

    // Đọc toàn bộ dữ liệu ra buffer để đảm bảo luồng không bị ngắt giữa chừng
    const data = await response.arrayBuffer()

    // Trả về dữ liệu nhị phân nguyên thủy
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  } catch (error) {
    console.error("VietMap Proxy Exception:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
