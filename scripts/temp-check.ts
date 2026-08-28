import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  const { data: completed } = await supabase
    .from('orders')
    .select('id, status, total')
    .eq('status', 'Completed')
  
  console.log('Completed orders:', completed?.length ?? 0)
  if (completed && completed.length > 0) {
    completed.forEach(o => console.log(`  - ${o.id}: $${o.total}`))
  }
  
  const { data: allStatuses } = await supabase
    .from('orders')
    .select('status')
  
  const statusCounts: Record<string, number> = {}
  allStatuses?.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })
  console.log('All status counts:', statusCounts)
}

main()
