export interface Product {
  id: string
  name: string
  sku: string
  price: string
  stock: string
  status: string
  image: string
  description: string
}

export const products: Product[] = [
  { id: "1", name: "Suit Piece", sku: "PLAN-PRE", price: "$49.00", stock: "Unlimited", status: "Active", image: "/products/premium-plan.jpg", description: "Elevate your wardrobe with the Suit Piece — a refined men's suit crafted for professionals who demand elegance and confidence." },
  { id: "2", name: "Shoes", sku: "PLAN-BAS", price: "$19.00", stock: "Unlimited", status: "Active", image: "/products/basic-plan.jpg", description: "Step into style with our Shoes — premium footwear designed for everyday comfort and modern aesthetics." },
  { id: "3", name: "Dress Shirt", sku: "PLAN-ENT", price: "$149.00", stock: "Unlimited", status: "Active", image: "/products/enterprise-plan.jpg", description: "Make a lasting impression with the Dress Shirt — a high-quality formal shirt tailored for the modern professional." },
  { id: "4", name: "Add-on Pack", sku: "ADD-001", price: "$9.00", stock: "500", status: "Active", image: "/products/add-on-pack.jpg", description: "Unlock extra value with the Add-on Pack — a curated collection of accessories to enhance your experience." },
  { id: "5", name: "Headphones", sku: "SUP-OLD", price: "$29.00", stock: "0", status: "Discontinued", image: "/products/legacy-support.jpg", description: "Stay connected with Headphones — a professional headset delivering crystal-clear audio for calls and collaboration." },
]
