"use client"

import * as React from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen">{children}</div>;
}
