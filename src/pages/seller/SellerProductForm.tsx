import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, Trash2, ArrowLeft } from "lucide-react";
import { useStore } from "../../lib/store";
import { categories, type CategorySlug } from "../../data/seed";
import { Page, SectionTitle, Reveal, Button } from "../../components/ui";
import { uploadProductImage } from "../../services/storage";

const inputCls =
  "w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none transition focus:border-[#d9b18b]";

export default function SellerProductForm() {
  const { id } = useParams<{ id?: string }>();
  const { addSellerProduct, updateSellerProduct, seller, sellerProducts } = useStore();
  const navigate = useNavigate();
  const existing = id ? sellerProducts.find((p) => p.id === id) : undefined;

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    category: (existing?.category ?? "mens-wear") as CategorySlug,
    price: existing?.price ?? 0,
    discountPrice: existing?.discountPrice ?? 0,
    description: existing?.description ?? "",
    stock: existing?.stock ?? 0,
    rating: existing?.rating ?? 4.5,
    sizes: (existing?.sizes ?? []).join(", "),
    colors: (existing?.colors ?? []).join(", "),
  });

  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setImages([...existing.images]);
    }
  }, [existing]);

  const isEdit = !!id;

  const setImage = (i: number, v: string) => {
    const imgs = [...images];
    imgs[i] = v;
    setImages(imgs);
  };

  const addImageInput = () => {
    setImages([...images, ""]);
  };

  const removeImage = (i: number) => {
    setImages(images.filter((_, idx) => idx !== i));
  };

  const uploadImage = async (file: File, index: number) => {
    if (!seller) return;
    setUploading({ ...uploading, [index]: true });
    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB.");
        return;
      }
      const url = await uploadProductImage(seller.id, file);
      setImage(index, url);
      setError("");
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading({ ...uploading, [index]: false });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, index);
    e.target.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const imgList = images.map((s) => s.trim()).filter(Boolean);
    if (form.name.trim().length < 2) return setError("Enter a valid product name.");
    if (imgList.length === 0) return setError("Add at least one product image.");
    if (form.price <= 0) return setError("Enter a valid price.");
    if (form.discountPrice <= 0 || form.discountPrice > form.price)
      return setError("Discount price must be > 0 and ≤ price.");
    if (form.stock < 0) return setError("Stock cannot be negative.");

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: form.price,
      discountPrice: form.discountPrice,
      description: form.description.trim(),
      stock: form.stock,
      rating: form.rating,
      images: imgList,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isEdit && id) {
        await updateSellerProduct(id, payload);
        navigate("/seller/products");
      } else {
        await addSellerProduct(payload);
        navigate("/seller/products");
      }
    } catch {
      // error toast already handled by store
    }
  };

  return (
    <Page className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle
            eyebrow={isEdit ? "Edit Product" : "Add Product"}
            title={isEdit ? "Edit Product Details" : "Add New Product"}
            subtitle={isEdit ? "Update your product information." : "Products start as pending approval."}
          />
        </div>
        <Button to="/seller/products" variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <Reveal className="glass rounded-2xl p-8">
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CategorySlug })}
                className={inputCls}
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm text-[#665f5a]">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product"
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Discount Price (₹)</label>
              <input
                type="number"
                value={form.discountPrice}
                onChange={(e) => setForm({ ...form, discountPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 4.5 })}
                placeholder="4.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Sizes (comma separated)</label>
              <input
                value={form.sizes}
                onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                placeholder="S, M, L, XL"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Colors (comma separated)</label>
              <input
                value={form.colors}
                onChange={(e) => setForm({ ...form, colors: e.target.value })}
                placeholder="Red, Blue, Green"
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-[#665f5a]">Product Images</label>
            <div className="grid gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  {url ? (
                    <img
                      src={url}
                      alt={`Product image ${i + 1}`}
                      className="h-32 w-32 rounded-lg object-cover border border-[#e8ddd2]"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-lg border-2 border-dashed border-[#e8ddd2] flex items-center justify-center">
                      <ImagePlus className="h-6 w-6 text-[#b8733b]" />
                      <p className="text-xs text-[#665f5a] mt-2">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, i)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {uploading[i] && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                      <div className="flex flex-col items-center gap-1">
                        <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <p className="text-xs text-white">Uploading…</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageInput}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[#e8ddd2] bg-[#f8f4f0] px-4 py-4 text-[#1c1917] hover:border-[#d9b18b] transition"
              >
                <ImagePlus className="h-4 w-4 text-[#b8733b]" />
                <span className="text-sm">Add another image</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-[#665f5a]">
              Images are uploaded to secure storage. Max 5MB per image. JPG/PNG/WebP only.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" full size="lg">
              {isEdit ? "Update Product" : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </Reveal>
    </Page>
  );
}
