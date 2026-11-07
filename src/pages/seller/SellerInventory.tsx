import { useEffect } from "react";
import { Boxes, Package, AlertTriangle } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal, Button } from "../../components/ui";
import { formatINR } from "../../lib/store";

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
        Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
        Low Stock ({stock})
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
      In Stock ({stock})
    </span>
  );
}

export default function SellerInventory() {
  const { sellerProducts, getSellerProducts } = useStore();

  useEffect(() => {
    getSellerProducts();
  }, [getSellerProducts]);

  const lowStock = sellerProducts.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = sellerProducts.filter((p) => p.stock <= 0);
  const totalValue = sellerProducts.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Inventory" title="Stock Management" subtitle="Track and update your product inventory." />
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Total Products</p>
          <p className="font-serif text-2xl font-bold text-[#1c1917]">{sellerProducts.length}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Low Stock</p>
          <p className={`font-serif text-2xl font-bold ${lowStock.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>
            {lowStock.length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Out of Stock</p>
          <p className={`font-serif text-2xl font-bold ${outOfStock.length > 0 ? "text-red-700" : "text-emerald-700"}`}>
            {outOfStock.length}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">Inventory Value</p>
          <p className="font-serif text-2xl font-bold text-[#1c1917]">{formatINR(totalValue)}</p>
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Product Stock</h2>
          <Button to="/seller/products/new">
            <Package className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8ddd2]">
                <th className="pb-3 text-zinc-400">Product</th>
                <th className="pb-3 text-zinc-400">SKU</th>
                <th className="pb-3 text-zinc-400">Price</th>
                <th className="pb-3 text-zinc-400">Stock</th>
                <th className="pb-3 text-zinc-400">Status</th>
                <th className="pb-3 text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    <Boxes className="h-8 w-8 text-[#b8733b] mb-3 block mx-auto" />
                    <p>No products in inventory.</p>
                  </td>
                </tr>
              ) : (
                sellerProducts.map((p) => (
                  <tr key={p.id} className="border-b border-[#f0e8dd]">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#f8f4f0] overflow-hidden">
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
                    <td className="py-3 text-[#1c1917]">{p.id.toUpperCase()}</td>
                    <td className="py-3 text-[#1c1917]">{formatINR(p.price)}</td>
                    <td className="py-3">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="py-3">
                      <StatusBadge status={p.status ?? "pending"} />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {}}
                          className="px-3 py-1.5 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-[#1c1917] hover:bg-[#f0e8dd]"
                        >
                          Edit Stock
                        </button>
                        {p.status === "pending" || p.status === "rejected" ? (
                          <button
                            onClick={() => {}}
                            className="px-3 py-1.5 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] text-sm text-[#1c1917] hover:bg-[#f0e8dd]"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {lowStock.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                {lowStock.length} product(s) are running low on stock. Restock soon to avoid lost sales.
              </p>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function StatusBadge({ status }: { status: string }) {
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
