import { useEffect, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal } from "../../components/ui";
import { formatINR } from "../../lib/store";

export default function AdminProductApproval() {
  const { pendingProducts, getPendingProducts, approveSellerProduct } = useStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPendingProducts();
  }, [getPendingProducts]);

  const filtered = pendingProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Product Approval" title="Pending Products" subtitle="Review and approve or reject seller product submissions." />
      </Reveal>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#786d67]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 pl-10 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-[#665f5a] uppercase tracking-wider">Pending</p>
            <p className="font-serif text-lg font-bold text-[#1c1917]">{pendingProducts.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Product</th>
                <th className="pb-3 text-zinc-400">Seller</th>
                <th className="pb-3 text-zinc-400">Price</th>
                <th className="pb-3 text-zinc-400">Submitted</th>
                <th className="pb-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-400">
                    <ShieldCheck className="h-8 w-8 text-[#b8733b] mb-3 block mx-auto" />
                    <p>No pending products.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-[#f8f4f0] overflow-hidden">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#b8733b] text-xs font-bold">
                              {p.name[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1c1917]">{p.name}</p>
                          <p className="text-xs text-[#665f5a]">{p.category}</p>
                          {p.rejectionReason && (
                            <p className="mt-1 text-xs text-red-600">Rejection: {p.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#1c1917]">{p.sellerName || "Unknown"}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(p.discountPrice)}</td>
                    <td className="py-3 text-[#1c1917]">Recent</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSellerProduct(p.id, true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = window.prompt("Rejection reason:");
                            if (reason !== null) {
                              approveSellerProduct(p.id, false, reason);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </div>
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
