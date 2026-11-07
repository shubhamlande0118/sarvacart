import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Store } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";

export default function SellerLogin() {
  const { login, isSeller, logout } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      if (isSeller) {
        navigate("/seller/dashboard", { replace: true });
      } else {
        await logout();
        setError("This account is not registered as a seller.");
      }
    }
  };

  return (
    <Page className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="aurora absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-md rounded-3xl border-gold/30 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Store className="h-6 w-6 text-[#b8733b]" />
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1c1917]">Seller Portal</h1>
            <p className="text-xs uppercase tracking-widest text-[#b8733b]">Seller access</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seller email"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
            />
          </Field>
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Enter Seller Dashboard"}
          </Button>
        </form>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <p className="mt-5 block text-center text-sm text-[#665f5a]">
          Need a seller account?{" "}
          <Link to="/seller/register" className="text-[#b8733b] hover:underline">Register</Link>
        </p>
        <p className="mt-2 block text-center text-sm text-[#665f5a]">
          Customer?{" "}
          <Link to="/login" className="text-[#b8733b] hover:underline">User Login</Link>
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
    <div className="flex items-center gap-3 rounded-xl border border-[#e8ddd2] bg-[#f8f4f0] px-4 py-3.5 transition focus-within:border-[#d9b18b]">
      <Icon className="h-4 w-4 shrink-0 text-[#786d67]" />
      {children}
    </div>
  );
}
