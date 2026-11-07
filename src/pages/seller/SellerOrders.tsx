import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal } from "../../components/ui";
import { formatINR } from "../../lib/store";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "Delivered"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Shipped"
        ? "bg-blue-100 text-blue-700"
        : status === "Processing"
          ? "bg-blue-100 text-blue-700"
          : status === "Pending Confirmation"
            ? "bg-amber-100 text-amber-700"
            : status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-zinc-100 text-zinc-700";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}

export default function SellerOrders() {
  const { orders, seller } = useStore();
  const [statusFilter, setStatusFilter] = useState("all");

  // Only show order items belonging to this seller
  const sellerOrders = orders
    .map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId === seller?.id
      );
      if (sellerItems.length === 0) return null;
      return {
        ...order,
        items: sellerItems,
        sellerTotal: sellerItems.reduce((s, it) => s + it.price * it.qty, 0),
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  const filtered = statusFilter === "all"
    ? sellerOrders
    : sellerOrders.filter((o) => o.status === statusFilter);

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Orders" title="My Orders" subtitle="Orders containing your products." />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="font-serif text-2xl font-bold text-[#1c1917]">{sellerOrders.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Your Earnings</p>
          <p className="font-serif text-2xl font-bold text-[#1c1917]">
            {formatINR(sellerOrders.reduce((s, o) => s + o.sellerTotal, 0))}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Pending</p>
          <p className="font-serif text-2xl font-bold text-amber-700">
            {sellerOrders.filter((o) => o.status === "Pending Confirmation" || o.status === "Processing").length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Delivered</p>
          <p className="font-serif text-2xl font-bold text-emerald-700">
            {sellerOrders.filter((o) => o.status === "Delivered").length}
          </p>
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Order Items</h2>
          <div className="flex gap-2">
            {["all", "Pending Confirmation", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-xl text-sm ${
                  statusFilter === s
                    ? "bg-[#b8733b] text-white"
                    : "bg-[#f8f4f0] text-[#1c1917] border border-[#e8ddd2] hover:bg-[#f0e8dd]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Order</th>
                <th className="pb-3 text-zinc-400">Customer</th>
                <th className="pb-3 text-zinc-400">Your Items</th>
                <th className="pb-3 text-zinc-400">Your Total</th>
                <th className="pb-3 text-zinc-400">Status</th>
                <th className="pb-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    <ShoppingCart className="h-8 w-8 text-[#b8733b] mb-3 block mx-auto" />
                    <p>No orders containing your products yet.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3">
                      <p className="font-medium text-[#1c1917]">{o.orderNumber}</p>
                      <p className="text-xs text-[#665f5a]">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 text-[#1c1917]">{o.customer.name}</td>
                    <td className="py-3">
                      <div className="space-y-1">
                        {o.items.map((it) => (
                          <div key={it.productId} className="text-sm">
                            <p className="text-[#1c1917]">{it.name}</p>
                            <p className="text-xs text-[#665f5a]">{it.qty} × {formatINR(it.price)}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-[#1c1917]">{formatINR(o.sellerTotal)}</td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => {}}
                        className="px-3 py-1.5 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-[#1c1917] hover:bg-[#f0e8dd]"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}
