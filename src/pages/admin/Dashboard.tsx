import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { IndianRupee, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "../../lib/store";
import { cn } from "../../utils/cn";

const statusColor: Record<OrderStatus, string> = {
  "Pending Confirmation": "bg-amber-500/15 text-amber-300",
  Pending: "bg-amber-500/15 text-amber-300",
  Processing: "bg-blue-500/15 text-blue-300",
  Packed: "bg-cyan-500/15 text-cyan-300",
  "Picked Up": "bg-indigo-500/15 text-indigo-300",
  "In Transit": "bg-violet-500/15 text-violet-300",
  "Out For Delivery": "bg-fuchsia-500/15 text-fuchsia-300",
  Shipped: "bg-violet-500/15 text-violet-300",
  Delivered: "bg-emerald-500/15 text-emerald-300",
  Cancelled: "bg-red-500/15 text-red-300",
};

export default function Dashboard() {
  const { products, orders } = useStore();

  const totalSales = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Total Sales", value: formatINR(totalSales), icon: IndianRupee, color: "text-emerald-400" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-400" },
    { label: "Total Products", value: products.length, icon: Package, color: "text-gold-soft" },
  ];

  const recent = orders.slice(0, 6);

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-zinc-400">Welcome back. Here's what's happening today.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <s.icon className={cn("h-6 w-6", s.color)} />
              <TrendingUp className="h-4 w-4 text-zinc-600" />
            </div>
            <p className="mt-4 font-serif text-3xl font-bold text-white">{s.value}</p>
            <p className="text-sm text-zinc-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-gold-soft hover:underline">View all</Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-6 text-zinc-400">No orders yet.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-gold-soft">{o.id}</td>
                    <td className="py-3 pr-4 text-zinc-300">{o.customer.name}</td>
                    <td className="py-3 pr-4 text-white">{formatINR(o.total)}</td>
                    <td className="py-3">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusColor[o.status])}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
