import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path")
  const apikey = searchParams.get("apikey")

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 })
  }

  const vietmapUrl = new URL(`https://maps.vietmap.vn/${path}`)

  searchParams.forEach((value, key) => {
    if (key !== "path") {
      vietmapUrl.searchParams.set(key, value)
    }
  })

  try {
    const response = await fetch(vietmapUrl.toString(), {
      headers: {
        "Referer": "https://maps.vietmap.vn/",
        "Origin": "https://maps.vietmap.vn",
        "User-Agent": request.headers.get("user-agent") || ""
      },
    })

    if (!response.ok) {
      console.error(`VietMap Proxy Error: ${response.status} ${response.statusText} for ${vietmapUrl.toString()}`)
      return new NextResponse(response.body, { status: response.status })
    }

    const newHeaders = new Headers()
    newHeaders.set("Access-Control-Allow-Origin", "*")
    newHeaders.set("Cache-Control", "public, max-age=3600")

    const contentType = response.headers.get("content-type")
    if (contentType) {
      newHeaders.set("Content-Type", contentType)
    }

    const data = await response.arrayBuffer()

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
