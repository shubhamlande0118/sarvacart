import { Package, ShoppingCart, Shield } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal } from "../../components/ui";
import { formatINR } from "../../lib/store";

export default function SellerDashboard() {
  const { seller, orders } = useStore();

  const myOrders = orders.filter((o) => {
    // Filter orders that contain this seller's products
    return o.items.some((item) => item.productId); // Simplified - all orders shown for now
  });

  const grossSales = myOrders.reduce((s, o) => s + o.total, 0);
  const commission = grossSales * 0.1;
  const netEarnings = grossSales - commission;

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Seller Dashboard" title="Overview" subtitle="Manage your store performance on SarvaCart." />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((_, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="glass rounded-2xl p-6">
              <div className="text-sm text-zinc-400 uppercase tracking-wider mb-2">{i === 0 ? "Total Sales" : i === 1 ? "Commission" : i === 2 ? "Net Earnings" : "Orders"}</div>
              <div className="font-serif text-3xl font-bold text-gradient-gold">
                {i === 0 ? formatINR(grossSales) : i === 1 ? formatINR(commission) : i === 2 ? formatINR(netEarnings) : myOrders.length}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Reveal className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-[#b8733b]" />
            <div>
              <p className="text-sm text-zinc-400">Recent Orders</p>
              <p className="font-serif text-2xl font-bold text-[#1c1917]">{myOrders.length}</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-[#b8733b]" />
            <div>
              <p className="text-sm text-zinc-400">Pending Payouts</p>
              <p className="font-serif text-2xl font-bold text-[#1c1917]">{formatINR(netEarnings)}</p>
            </div>
          </div>
        </Reveal>
        <Reveal className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#b8733b]" />
            <div>
              <p className="text-sm text-zinc-400">KYC Status</p>
              <p className="font-serif text-2xl font-bold text-[#1c1917]">{seller?.status?.toUpperCase() || "PENDING"}</p>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="font-serif text-2xl font-bold text-[#1c1917] mb-4">Recent Orders</h2>
        {myOrders.length === 0 ? (
          <p className="text-zinc-400">No orders yet. Start selling to receive orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e8ddd2]">
                  <th className="pb-2 text-zinc-400">Order #</th>
                  <th className="pb-2 text-zinc-400">Customer</th>
                  <th className="pb-2 text-zinc-400">Amount</th>
                  <th className="pb-2 text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3 text-[#1c1917]">{o.id}</td>
                    <td className="py-3 text-[#1c1917]">{o.customer.name}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(o.total)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#1c1917]/10 text-[#1c1917] text-xs">
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
    </Page>
  );
}
