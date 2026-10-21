import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Search, PackagePlus } from "lucide-react";
import { useStore, formatINR } from "../../lib/store";
import { categories } from "../../data/seed";
import { Button } from "../../components/ui";
import { cn } from "../../utils/cn";

export default function ManageProducts() {
  const { products, deleteProduct } = useStore();
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white">Manage Products</h1>
          <p className="mt-2 text-zinc-400">{products.length} products in catalogue</p>
        </div>
        <Button to="/admin/add">
          <PackagePlus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="glass-light mt-6 flex items-center gap-2 rounded-full px-4 py-3">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
        />
      </div>

      <div className="mt-6 space-y-3">
        {list.map((p) => {
          const cat = categories.find((c) => c.slug === p.category);
          return (
            <div key={p.id} className="glass flex items-center gap-4 rounded-2xl p-4">
              <img src={p.images[0]} alt="" className="h-16 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{p.name}</p>
                <p className="text-xs text-zinc-500">{cat?.name}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-gold-soft">{formatINR(p.discountPrice)}</p>
                <p className="text-xs text-zinc-500 line-through">{formatINR(p.price)}</p>
              </div>
              <span
                className={cn(
                  "hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block",
                  p.stock <= 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-300"
                )}
              >
                {p.stock <= 0 ? "Out" : `${p.stock} in stock`}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/admin/edit/${p.id}`}
                  className="rounded-lg border border-white/10 p-2.5 text-zinc-300 transition hover:border-gold/40 hover:text-gold-soft"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setConfirm(p.id)}
                  className="rounded-lg border border-white/10 p-2.5 text-zinc-300 transition hover:border-red-400/40 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-sm rounded-2xl p-6 text-center">
            <Trash2 className="mx-auto h-10 w-10 text-red-400" />
            <h3 className="mt-4 font-serif text-2xl text-white">Delete product?</h3>
            <p className="mt-2 text-sm text-zinc-400">This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <Button variant="dark" full onClick={() => setConfirm(null)}>Cancel</Button>
              <button
                onClick={async () => {
                  try {
                    await deleteProduct(confirm);
                    setConfirm(null);
                  } catch {
                    // The store reports the persistence error.
                  }
                }}
                className="w-full rounded-full bg-red-500/90 py-3 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
