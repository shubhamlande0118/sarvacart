import { useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal } from "../../components/ui";

export default function AdminSellers() {
  const { sellers, getAllSellers, approveSeller } = useStore();
  const [search, setSearch] = useState("");

  // In a real implementation, sellers would include owner info from users collection.
  // For now we use the seller profile data available.
  const filtered = sellers.filter((s) =>
    s.storeName.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "suspended": return "bg-zinc-100 text-zinc-700";
      default: return "bg-zinc-100 text-zinc-700";
    }
  };

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Seller Management" title="Sellers" subtitle="Review and manage seller accounts on SarvaCart." />
      </Reveal>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#786d67]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers by store name…"
              className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 pl-10 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
            />
          </div>
          <button onClick={() => getAllSellers()} className="px-4 py-2 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-[#1c1917] hover:bg-[#f0e8dd]">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Store</th>
                <th className="pb-3 text-zinc-400">Owner</th>
                <th className="pb-3 text-zinc-400">Contact</th>
                <th className="pb-3 text-zinc-400">Seller Status</th>
                <th className="pb-3 text-zinc-400">KYC</th>
                <th className="pb-3 text-zinc-400">Joined</th>
                <th className="pb-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-400">No sellers found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gold/10 text-gold-soft flex items-center justify-center font-bold">
                          {s.storeName[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-medium text-[#1c1917]">{s.storeName}</p>
                          <p className="text-xs text-[#665f5a]">{s.businessName || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#1c1917]">{s.userId.slice(0, 8)}...</td>
                    <td className="py-3 text-[#1c1917]">{s.phone || "-"}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(s.status)}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(s.status === "approved" ? "approved" : "pending")}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-[#1c1917]">Recent</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {s.status === "pending" && (
                          <button
                            onClick={() => approveSeller(s.id, "approved")}
                            className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs hover:bg-emerald-500/20"
                          >
                            Approve
                          </button>
                        )}
                        {s.status === "pending" || s.status === "rejected" && (
                          <button
                            onClick={() => approveSeller(s.id, "rejected")}
                            className="px-3 py-1 rounded-xl bg-red-500/10 text-red-600 text-xs hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        )}
                        {s.status === "approved" && (
                          <button
                            onClick={() => approveSeller(s.id, "suspended")}
                            className="px-3 py-1 rounded-xl bg-zinc-500/10 text-zinc-600 text-xs hover:bg-zinc-500/20"
                          >
                            Suspend
                          </button>
                        )}
                        {s.status === "suspended" && (
                          <button
                            onClick={() => approveSeller(s.id, "approved")}
                            className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs hover:bg-emerald-500/20"
                          >
                            Reactivate
                          </button>
                        )}
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
