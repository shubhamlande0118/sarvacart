import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { cn } from "../../utils/cn";

const statusColor: Record<OrderStatus, string> = {
  "Pending Confirmation": "bg-amber-500/15 text-amber-300",
  Pending: "bg-amber-500/15 text-amber-300",
  Processing: "bg-blue-500/15 text-blue-300",
  Shipped: "bg-violet-500/15 text-violet-300",
  Delivered: "bg-emerald-500/15 text-emerald-300",
  Cancelled: "bg-red-500/15 text-red-300",
};

export default function Orders() {
  const { orders, user } = useStore();
  const mine = orders.filter((o) => o.userId === user?.id);

  return (
    <Page className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">My Orders</h1>
      <p className="mt-2 text-zinc-400">Track and review your past purchases.</p>

      {mine.length === 0 ? (
        <div className="glass mt-10 flex flex-col items-center rounded-3xl py-20 text-center">
          <Package className="h-12 w-12 text-zinc-600" />
          <h3 className="mt-4 font-serif text-2xl text-white">No orders yet</h3>
          <p className="mt-2 text-zinc-400">Your future treasures will appear here.</p>
          <Button to="/shop" className="mt-6">Start Shopping</Button>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {mine.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">Order</p>
                  <p className="font-semibold text-gold-soft">{o.id}</p>
                </div>
                <div className="text-sm text-zinc-400">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusColor[o.status])}>
                  {o.status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {o.items.map((it) => (
                  <div key={it.productId + it.size + it.color} className="flex items-center gap-3">
                    <img src={it.image} alt="" className="h-14 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{it.name}</p>
                      <p className="text-xs text-zinc-500">
                        Qty {it.qty}
                        {[it.size, it.color].filter(Boolean).length
                          ? " · " + [it.size, it.color].filter(Boolean).join(" / ")
                          : ""}
                      </p>
                    </div>
                    <p className="text-sm text-gold-soft">{formatINR(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="flex items-center gap-1 text-sm text-zinc-400">
                  {o.payment} <ChevronRight className="h-4 w-4" />
                </span>
                <span className="text-lg font-semibold text-gradient-gold">{formatINR(o.total)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Page>
  );
}
