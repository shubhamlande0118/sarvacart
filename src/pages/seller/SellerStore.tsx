import { useState } from "react";
import { useStore } from "../../lib/store";
import { Page, SectionTitle, Reveal, Button } from "../../components/ui";

export default function SellerStore() {
  const { seller, updateSellerProfile } = useStore();
  const [form, setForm] = useState({
    storeName: seller?.storeName || "",
    businessName: seller?.businessName || "",
    phone: seller?.phone || "",
    address: seller?.address || "",
    storeDescription: seller?.storeDescription || "",
    storeLogo: seller?.storeLogo || "",
    storeBanner: seller?.storeBanner || "",
    contactEmail: seller?.contactEmail || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSellerProfile(form);
    } catch {
      // error toast handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="Store Profile" title="My Store" subtitle="Manage your store information and branding." />
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="glass rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-[#1c1917] mb-6">Store Preview</h2>
          <div className="flex items-center gap-6 p-4 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0]">
            <div className="h-16 w-16 rounded-full bg-gold/10 text-gold-soft flex items-center justify-center text-2xl font-bold">
              {form.storeName ? form.storeName[0].toUpperCase() : "S"}
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-[#1c1917]">{form.storeName || "Store Name"}</p>
              <p className="text-sm text-[#665f5a]">{form.businessName || "Business name not set"}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-[#665f5a] font-medium mb-3">Store Description</p>
            <p className="text-[#1c1917]">{form.storeDescription || "No description set."}</p>
          </div>
        </div>

        <Reveal className="glass rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-[#1c1917] mb-6">Edit Store Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Store Name</label>
              <input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                placeholder="Your store name"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Business Name</label>
              <input
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Legal business name"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="contact@store.com"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 XXXXXXXXXX"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Business address"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Store Description</label>
              <textarea
                rows={3}
                value={form.storeDescription}
                onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
                placeholder="Tell customers about your store"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b] resize-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Store Logo URL</label>
              <input
                value={form.storeLogo}
                onChange={(e) => setForm({ ...form, storeLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-[#665f5a]">Store Banner URL</label>
              <input
                value={form.storeBanner}
                onChange={(e) => setForm({ ...form, storeBanner: e.target.value })}
                placeholder="https://example.com/banner.png"
                className="w-full rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3 text-sm text-[#1c1917] outline-none focus:border-[#d9b18b]"
              />
            </div>
            <Button type="submit" full disabled={loading}>
              {loading ? "Saving…" : "Save Store Details"}
            </Button>
          </form>
        </Reveal>
      </div>
    </Page>
  );
}
