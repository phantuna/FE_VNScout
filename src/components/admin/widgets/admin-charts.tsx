"use client"

import { useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts"
import { TrendingUp, Users, MapPin, Clock } from "lucide-react"

interface AdminChartsProps {
  totalPosts: number
  totalUsers: number
  postsPerDay?: { day: string; count: number }[]
  usersPerDay?: { day: string; count: number }[]
}

// Real data is now passed from the backend

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, suffix = "" }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-xl text-xs font-bold border border-slate-700">
        <p className="text-slate-400 text-[10px] mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.value}{suffix}</p>
        ))}
      </div>
    )
  }
  return null
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export function AdminCharts({ totalPosts, totalUsers, postsPerDay, usersPerDay }: AdminChartsProps) {
  const postsData = useMemo(() => {
    if (postsPerDay && postsPerDay.length > 0) {
      return postsPerDay.map(d => ({ day: d.day, posts: d.count }))
    }
    return []
  }, [postsPerDay])

  const usersData = useMemo(() => {
    if (usersPerDay && usersPerDay.length > 0) {
      return usersPerDay.map(d => ({ day: d.day, users: d.count }))
    }
    return []
  }, [usersPerDay])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Line Chart — Posts per day */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Bài đăng theo ngày
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">7 ngày gần nhất</p>
          </div>
          <div className="px-2.5 py-1 bg-orange-50 rounded-full border border-orange-100 text-[10px] font-black text-orange-600">
            ↑ +15.2%
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={postsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip suffix=" bài" />} />
            <defs>
              <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="posts"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ fill: "#f97316", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Bar Chart — Active users */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              User active 7 ngày
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Lượt đăng nhập mỗi ngày</p>
          </div>
          <div className="px-2.5 py-1 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black text-blue-600">
            {totalUsers} tổng
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={usersData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip suffix=" người" />} />
            <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]}>
              {usersData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === usersData.length - 1 || i === usersData.length - 2
                    ? "#f97316"  // weekend highlight
                    : "#3b82f6"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
