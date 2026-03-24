"use client"

import { WorkersTable } from "@/components/workers-table"

export default function WorkersPage() {
  return (
    <main className="relative min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <WorkersTable />
      </div>
    </main>
  )
}
