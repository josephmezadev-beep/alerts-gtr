"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="relative z-10 p-8 max-w-4xl mx-auto">
      <Card className="border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
              <LayoutDashboard className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">Dashboard Overview</CardTitle>
              <CardDescription>
                Key metrics and insights at a glance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 border border-dashed border-slate-700 rounded-lg">
            <p className="text-muted-foreground">
              Dashboard overview coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
