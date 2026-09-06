import { createClient } from "../lib/supabase/client.ts"
const sb = createClient()
const { data, error } = await sb.from("products").select("id,name,sku,user_id,store_id,status").in("sku",["SHOES-001","BABY-SHIRT-001","SUIT-001","HEADPHONE-001","MAHRUKH-HAMZA-001","MAHRUKH-CHEVRON-001","MAHRUKH-LAWN-001"])
console.log(JSON.stringify(data,null,2))
if (error) console.error(error)
process.exit(0)