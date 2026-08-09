import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";

export default function Profile() {
  const { user, updateProfile, logout, orders } = useStore();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });

  const mine = orders.filter((o) => o.userId === user?.id);
  const spent = mine.reduce((s, o) => s + o.total, 0);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50";

  return (
    <Page className="mx-auto max-w-5xl px-4 pb-24 pt-28 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-2xl font-bold text-gold-soft">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">{user?.name}</h1>
          <p className="text-sm text-zinc-400">{user?.email}</p>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Orders", value: mine.length },
          { label: "Total Spent", value: "₹" + spent.toLocaleString("en-IN") },
          { label: "Member Since", value: new Date(user?.createdAt ?? Date.now()).getFullYear() },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-sm text-zinc-400">{s.label}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-gradient-gold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <form onSubmit={save} className="glass rounded-2xl p-6">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-white">
            <User className="h-5 w-5 text-gold-soft" /> Edit Profile
          </h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="10-digit phone number" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Default Address</label>
              <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls + " resize-none"} placeholder="Delivery address" />
            </div>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>

        <div className="space-y-3">
          <Link to="/orders" className="glass flex items-center gap-3 rounded-2xl p-5 transition hover:border-gold/40">
            <Package className="h-5 w-5 text-gold-soft" />
            <span className="text-white">My Orders</span>
          </Link>
          <button onClick={logout} className="glass flex w-full items-center gap-3 rounded-2xl p-5 text-left transition hover:border-red-400/40">
            <LogOut className="h-5 w-5 text-red-400" />
            <span className="text-white">Sign Out</span>
          </button>
        </div>
      </div>
    </Page>
  );
}
