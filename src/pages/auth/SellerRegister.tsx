import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Store, Phone, MapPin, Building, User } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { cn } from "../../utils/cn";

export default function SellerRegister() {
  const { registerSeller } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    storeName: "",
    businessName: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.storeName.trim().length < 2) return setError("Please enter your store name.");
    setLoading(true);
    const ok = await registerSeller(
      form.name,
      form.email,
      form.password,
      form.storeName,
      form.businessName || undefined,
      form.phone || undefined,
      form.address || undefined
    );
    setLoading(false);
    if (ok) navigate("/seller/login", { replace: true });
  };

  return (
    <Page className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="aurora absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-lg rounded-3xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Store className="h-6 w-6 text-[#b8733b]" />
          <h1 className="font-serif text-3xl font-bold text-[#1c1917]">Become a Seller</h1>
        </div>
        <p className="mt-1 text-sm text-[#665f5a] mb-6">
          Join SarvaCart as a verified seller and start selling your products.
        </p>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <Field icon={User}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Confirm password"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Store}>
            <input
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              placeholder="Store name"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Building}>
            <input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Business name (optional)"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Phone}>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={MapPin}>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Business address"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Creating…" : "Register as Seller"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#665f5a]">
          Already have a seller account?{" "}
          <Link to="/seller/login" className="text-[#b8733b] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </Page>
  );
}

export function Field({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3.5 transition focus-within:border-[#d9b18b]")}>
      <Icon className="h-4 w-4 shrink-0 text-[#786d67]" />
      {children}
    </div>
  );
}
