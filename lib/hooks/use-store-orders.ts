"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchOrdersFromSupabase, Order } from "@/lib/data/orders"
import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js"

interface OrderStats {
  total: number
  completed: number
  pending: number
  cancelled: number
  revenue: number
  averageOrderValue: number
  loading: boolean
}

interface UseStoreOrdersResult {
  orders: Order[]
  stats: OrderStats
  refresh: () => Promise<void>
}

/**
 * useStoreOrders
 *
 * Single source of truth for the admin's own orders across the dashboard,
 * orders page, revenue page, etc.
 *
 * It:
 *  1. Loads orders scoped to the logged-in user (RLS also enforces this).
 *  2. Subscribes to realtime INSERT/UPDATE/DELETE events on public.orders
 *     and refreshes automatically. The subscription is filtered to the
 *     current user_id so other users' events are never delivered.
 *  3. Cleans up the subscription on unmount so there are no duplicates
 *     or leaks.
 *  4. Returns derived statistics (revenue, counts by status).
 */
export function useStoreOrders(userId: string | null | undefined): UseStoreOrdersResult {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    if (!userId) {
      setOrders([])
      setLoading(false)
      return
    }
    const data = await fetchOrdersFromSupabase(userId)
    setOrders(data)
    setLoading(false)
  }, [userId])

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!userId) {
      setOrders([])
      setLoading(false)
      return
    }
    let cancelledInner = false
    setLoading(true)
    fetchOrdersFromSupabase(userId).then((data) => {
      if (!cancelledInner) {
        setOrders(data)
        setLoading(false)
      }
    })
    return () => {
      cancelledInner = true
    }
  }, [userId])
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!userId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`orders:${userId}`)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, refresh])

  const stats = React.useMemo<OrderStats>(() => {
    const completed = orders.filter((o) => o.status === "Completed").length
    const pending = orders.filter((o) => o.status === "Pending").length
    const cancelled = orders.filter((o) => o.status === "Cancelled").length
    const revenue = orders
      .filter((o) => o.status === "Completed")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
    const averageOrderValue = completed > 0 ? revenue / completed : 0
    return {
      total: orders.length,
      completed,
      pending,
      cancelled,
      revenue,
      averageOrderValue,
      loading,
    }
  }, [orders, loading])

  return { orders, stats, refresh }
}