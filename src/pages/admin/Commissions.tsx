import { useEffect, useState } from "react";
import { Search, DollarSign } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal } from "../../components/ui";
import { formatINR } from "../../lib/store";

export default function AdminCommissions() {
  const { sellers, getAllSellers } = useStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllSellers();
  }, [getAllSellers]);

  // In a real implementation, commissions would be fetched from Firestore.
  // For now, we show the commission dashboard structure with seller data.
  const filteredSellers = sellers.filter((s) =>
    s.storeName.toLowerCase().includes(search.toLowerCase())
  );

  const totals = { gross: 0, commission: 0, sellerAmount: 0 };

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Commissions" title="Platform Commission" subtitle="10% platform commission on all seller sales." />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Gross Sales</p>
          <p className="font-serif text-2xl font-bold text-[#1c1917]">{formatINR(totals.gross)}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Platform Commission (10%)</p>
          <p className="font-serif text-2xl font-bold text-red-600">{formatINR(totals.commission)}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Seller Earnings</p>
          <p className="font-serif text-2xl font-bold text-emerald-700">{formatINR(totals.sellerAmount)}</p>
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Commission by Seller</h2>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#786d67]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers…"
              className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 pl-10 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Seller</th>
                <th className="pb-3 text-zinc-400">Store</th>
                <th className="pb-3 text-zinc-400">Gross Sales</th>
                <th className="pb-3 text-zinc-400">Commission</th>
                <th className="pb-3 text-zinc-400">Seller Amount</th>
                <th className="pb-3 text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    <DollarSign className="h-8 w-8 text-[#b8733b] mb-3 block mx-auto" />
                    <p>No commission records found.</p>
                  </td>
                </tr>
              ) : (
                filteredSellers.map((s) => (
                  <tr key={s.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#f8f4f0] flex items-center justify-center text-[#1c1917] font-bold">
                          {s.storeName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1c1917]">{s.storeName}</p>
                          <p className="text-xs text-[#665f5a]">{s.businessName || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#1c1917]">{s.status}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(0)}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(0)}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(0)}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        Pending
                      </span>
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
