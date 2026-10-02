"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { fetchOrdersForStore, Order } from "@/lib/data/orders"
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
 * Single source of truth for the orders shown across the dashboard, revenue
 * page, orders page, etc.
 *
 * It is driven by the *selected store ID*, never by the signed-in user, so
 * switching stores switches the revenue/order context without touching the
 * auth session. It:
 *  1. Loads orders scoped to the selected store via the store-scoped server
 *     route (the browser client cannot read another store's orders).
 *  2. Subscribes to realtime INSERT/UPDATE/DELETE events on public.orders and
 *     refreshes automatically. The subscription is filtered to the selected
 *     store so another store's events are never delivered.
 *  3. Cleans up the subscription on unmount so there are no duplicates
 *     or leaks.
 *  4. Returns derived statistics (revenue, counts by status).
 */
export function useStoreOrders(storeId: string | null | undefined): UseStoreOrdersResult {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    if (!storeId) {
      setOrders([])
      setLoading(false)
      return
    }
    const data = await fetchOrdersForStore(storeId)
    setOrders(data)
    setLoading(false)
  }, [storeId])

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!storeId) {
      setOrders([])
      setLoading(false)
      return
    }
    let cancelledInner = false
    setLoading(true)
    fetchOrdersForStore(storeId).then((data) => {
      if (!cancelledInner) {
        setOrders(data)
        setLoading(false)
      }
    })
    return () => {
      cancelledInner = true
    }
  }, [storeId])
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    if (!storeId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`orders:${storeId}`)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL,
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          void refresh()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [storeId, refresh])

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