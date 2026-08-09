import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User } from "lucide-react";
import { useStore } from "../../lib/store";
import { Button, Page } from "../../components/ui";
import { Field } from "./Login";
import BrandLogo from "../../components/BrandLogo";

export default function Signup() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Please enter a valid email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    setLoading(true);
    const ok = await register(form.name, form.email, form.password);
    setLoading(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <Page className="relative flex min-h-screen items-center justify-center px-4 pt-24">
      <div className="aurora absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass relative w-full max-w-md rounded-3xl p-8"
      >
<div className="flex items-center gap-2">
          <BrandLogo />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-400">Join the inner circle of SarvaCart.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <Field icon={User}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Field icon={Mail}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Confirm password"
              className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" full size="lg" disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already a member?{" "}
          <Link to="/login" className="text-gold-soft hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </Page>
  );
}
