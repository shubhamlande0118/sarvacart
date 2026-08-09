import { useState } from "react";
import { Package } from "lucide-react";
import { useStore, formatINR, type OrderStatus } from "../../lib/store";
import { cn } from "../../utils/cn";

const allStatus: OrderStatus[] = [
  "Pending Confirmation",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const statusColor: Record<OrderStatus, string> = {
  "Pending Confirmation": "bg-amber-500/15 text-amber-300",
  Pending: "bg-amber-500/15 text-amber-300",
  Processing: "bg-blue-500/15 text-blue-300",
  Shipped: "bg-violet-500/15 text-violet-300",
  Delivered: "bg-emerald-500/15 text-emerald-300",
  Cancelled: "bg-red-500/15 text-red-300",
};

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-white">Orders</h1>
      <p className="mt-2 text-zinc-400">Manage and fulfil customer orders.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...allStatus] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              filter === s ? "bg-gold/15 text-gold-soft" : "glass-light text-zinc-300 hover:text-white"
            )}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="glass mt-8 flex flex-col items-center rounded-3xl py-20 text-center">
          <Package className="h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-zinc-400">No orders in this view.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((o) => (
            <div key={o.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gold-soft">{o.id}</p>
                  <p className="text-sm text-white">{o.customer.name} · {o.customer.phone}</p>
                  <p className="text-xs text-zinc-500">{o.customer.email}</p>
                  <p className="mt-1 max-w-md text-xs text-zinc-500">{o.customer.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gradient-gold">{formatINR(o.total)}</p>
                  <p className="text-xs text-zinc-500">{o.payment}</p>
                  <p className="text-xs text-zinc-600">
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {o.items.map((it) => (
                  <span key={it.productId + it.size + it.color} className="glass-light rounded-full px-3 py-1 text-xs text-zinc-300">
                    {it.name} × {it.qty}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", statusColor[o.status])}>
                  {o.status}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#15151a]"
                >
                  {allStatus.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
