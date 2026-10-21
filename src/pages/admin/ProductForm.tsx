import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { useStore } from "../../lib/store";
import { categories, type CategorySlug } from "../../data/seed";
import { Button } from "../../components/ui";

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const { getProduct, addProduct, updateProduct } = useStore();
  const navigate = useNavigate();
  const existing = id ? getProduct(id) : undefined;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    category: (existing?.category ?? "mens-wear") as CategorySlug,
    price: existing?.price ?? 0,
    discountPrice: existing?.discountPrice ?? 0,
    description: existing?.description ?? "",
    stock: existing?.stock ?? 0,
    rating: existing?.rating ?? 4.5,
    featured: existing?.featured ?? false,
    images: existing?.images ?? [""],
    sizes: (existing?.sizes ?? []).join(", "),
    colors: (existing?.colors ?? []).join(", "),
  });
  const [error, setError] = useState("");

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50";

  const setImage = (i: number, v: string) => {
    const imgs = [...form.images];
    imgs[i] = v;
    setForm({ ...form, images: imgs });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const images = form.images.map((s) => s.trim()).filter(Boolean);
    if (form.name.trim().length < 2) return setError("Enter a valid product name.");
    if (images.length === 0) return setError("Add at least one image URL.");
    if (form.price <= 0) return setError("Enter a valid price.");
    if (form.discountPrice <= 0 || form.discountPrice > form.price)
      return setError("Discount price must be > 0 and ≤ price.");

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice),
      description: form.description,
      stock: Number(form.stock),
      rating: Number(form.rating),
      featured: form.featured,
      images,
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    };

    try {
      if (existing) await updateProduct(existing.id, payload);
      else await addProduct(payload);
      navigate("/admin/products");
    } catch {
      setError("Could not save the product. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-white">
        {existing ? "Edit Product" : "Add Product"}
      </h1>
      <p className="mt-2 text-zinc-400">
        {existing ? "Update the details below." : "Create a new listing for your store."}
      </p>

      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm text-zinc-400">Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}
                  className={inputCls + " [&>option]:bg-[#15151a]"}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Price (₹)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Discount Price (₹)</label>
                <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm text-zinc-400">Description</label>
                <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls + " resize-none"} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Sizes (comma separated)</label>
                <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className={inputCls} placeholder="S, M, L" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">Colours (comma separated)</label>
                <input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} className={inputCls} placeholder="Gold, Silver" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-3 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-gold-soft" />
              <h3 className="font-semibold text-white">Product Images (URLs)</h3>
            </div>
            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input value={img} onChange={(e) => setImage(i, e.target.value)} className={inputCls} placeholder="https://…" />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, images: form.images.filter((_, x) => x !== i) })}
                      className="rounded-xl border border-white/10 px-3 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                className="inline-flex items-center gap-1 text-sm text-gold-soft hover:underline"
              >
                <Plus className="h-4 w-4" /> Add image
              </button>
            </div>
          </div>
        </div>

        {/* preview + submit */}
        <div className="h-fit lg:sticky lg:top-28">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-white">Live Preview</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              {form.images[0] ? (
                <img src={form.images[0]} alt="" className="aspect-[3/4] w-full object-cover" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-white/5 text-zinc-600">
                  <ImagePlus className="h-10 w-10" />
                </div>
              )}
            </div>
            <p className="mt-3 font-serif text-lg text-white">{form.name || "Product name"}</p>
            <p className="text-gradient-gold font-semibold">₹{Number(form.discountPrice).toLocaleString("en-IN")}</p>

            <label className="mt-5 flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 accent-[#d4af37]" />
              <span className="text-sm text-zinc-300">Feature on homepage</span>
            </label>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <Button type="submit" full size="lg" className="mt-5">
              {existing ? "Save Changes" : "Publish Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
