import { useState, useEffect } from "react";
import { Search, PackagePlus } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal, Button } from "../../components/ui";
import { formatINR } from "../../lib/store";

type StatusColorProps = { status: string };
function StatusBadge({ status }: StatusColorProps) {
  const color =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "pending"
        ? "bg-amber-100 text-amber-700"
        : status === "rejected"
          ? "bg-red-100 text-red-700"
          : "bg-zinc-100 text-zinc-700";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function SellerProducts() {
  const {
    sellerProducts,
    getSellerProducts,
    deleteSellerProduct,
  } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getSellerProducts();
  }, [getSellerProducts]);

  const filtered = sellerProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: sellerProducts.length,
    pending: sellerProducts.filter((p) => p.status === "pending").length,
    approved: sellerProducts.filter((p) => p.status === "approved").length,
    rejected: sellerProducts.filter((p) => p.status === "rejected").length,
  };

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <SectionTitle eyebrow="Products" title="My Products" subtitle="Manage your catalog. New products start as pending approval." />
          </div>
          <Button to="/seller/products/new">
            <PackagePlus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </Reveal>

      <Reveal className="mt-8 glass rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          {[["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]].map(
            ([key, label]) => (
              <div
                key={key}
                className={`p-4 rounded-xl border text-center ${
                  statusFilter === key
                    ? "border-[#b8733b] bg-[#fef7ee]"
                    : "border-[#e8ddd2] bg-[#f8f4f0] hover:border-[#d9b18b]"
                }`}
                onClick={() => setStatusFilter(key)}
              >
                <p className="text-xs text-[#665f5a] uppercase tracking-wider">{label}</p>
                <p className="mt-1 font-serif text-lg font-bold text-[#1c1917]">
                  {statusCounts[key as keyof typeof statusCounts]}
                </p>
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Product</th>
                <th className="pb-3 text-zinc-400">Price</th>
                <th className="pb-3 text-zinc-400">Stock</th>
                <th className="pb-3 text-zinc-400">Status</th>
                <th className="pb-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-400">
                    No products found.
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
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[#1c1917]">{formatINR(p.discountPrice)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.stock <= 0
                            ? "bg-red-100 text-red-700"
                            : p.stock <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.stock <= 0 ? "Out of Stock" : p.stock <= 5 ? `Low (${p.stock})` : `In Stock (${p.stock})`}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={p.status ?? "pending"} />
                      {p.status === "rejected" && p.rejectionReason && (
                        <p className="mt-1 text-xs text-red-600">{p.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Navigate to edit
                          }}
                          disabled={p.status !== "pending" && p.status !== "rejected"}
                          className={`px-3 py-1.5 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-[#1c1917] ${p.status !== "pending" && p.status !== "rejected" ? "opacity-50 cursor-not-allowed" : "hover:bg-[#f0e8dd]"}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSellerProduct(p.id)}
                          className="px-3 py-1.5 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Reveal>
    </Page>
  );
}
