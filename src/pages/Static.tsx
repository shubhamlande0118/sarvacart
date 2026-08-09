import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useStore } from "../lib/store";
import { Button, Page, Reveal, SectionTitle } from "../components/ui";
import { categories } from "../data/seed";
import BrandLogo from "../components/BrandLogo";

/* --------------------------------- About --------------------------------- */
export function About() {
  return (
    <Page className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">Our Story</p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-white sm:text-6xl">
          Craft, staged like cinema.
        </h1>
<p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
          SarvaCart was born from a simple belief: that buying something beautiful should feel
          as memorable as owning it. We blend the storytelling discipline of a great film studio
          with the obsessive craft of a fashion atelier — curating wear, fine jewellery, and
          future-tech that earns its place in your life.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <div className="relative overflow-hidden rounded-3xl">
              <img src={c.image} alt={c.name} className="h-64 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-0 p-6">
                <h3 className="font-serif text-2xl font-bold text-white">{c.name}</h3>
                <p className="text-sm text-zinc-300">{c.tagline}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="glass mt-14 grid gap-8 rounded-3xl p-10 text-center sm:grid-cols-3">
          {[
            { v: "2026", l: "Founded" },
            { v: "120+", l: "Artisan partners" },
            { v: "40", l: "Countries served" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-serif text-4xl font-bold text-gradient-gold">{s.v}</p>
              <p className="mt-1 text-sm text-zinc-400">{s.l}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </Page>
  );
}

/* -------------------------------- Contact -------------------------------- */
export function Contact() {
  const { toast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("success", "Message sent. Our concierge will reply shortly.");
    setForm({ name: "", email: "", message: "" });
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50";

  return (
    <Page className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
      <Reveal>
        <SectionTitle eyebrow="We're listening" title="Get in touch" subtitle="Questions, styling requests, or partnerships — our concierge is here." />
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Message</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls + " resize-none"} />
            </div>
            <Button type="submit"><Send className="h-4 w-4" /> Send Message</Button>
          </form>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            {[
{ icon: Mail, label: "Email", value: "concierge@sarvacart.store" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210" },
              { icon: MapPin, label: "Atelier", value: "SarvaCart Tower, Bandra, Mumbai" },
            ].map((c) => (
              <div key={c.label} className="glass flex items-center gap-4 rounded-2xl p-5">
                <div className="rounded-xl bg-gold/10 p-3 text-gold">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500">{c.label}</p>
                  <p className="text-white">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Page>
  );
}

/* ---------------------------- Legal page shell ---------------------------- */
function Legal({ title, sections }: { title: string; sections: { h: string; p: string }[] }) {
  return (
    <Page className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
      <Reveal>
<div className="mb-2 flex items-center gap-2">
          <BrandLogo />
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">SarvaCart</span>
        </div>
        <h1 className="font-serif text-5xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: January 2026</p>
      </Reveal>
      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <Reveal key={s.h} delay={i * 0.05}>
            <h2 className="font-serif text-2xl font-semibold text-white">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-zinc-300">{s.p}</p>
          </Reveal>
        ))}
      </div>
    </Page>
  );
}

export function Privacy() {
  return (
    <Legal
      title="Privacy Policy"
      sections={[
        { h: "Information We Collect", p: "We collect the details you provide at signup and checkout — your name, email, phone, and delivery address — strictly to fulfil orders and personalise your experience. Passwords are stored only as salted, irreversible hashes." },
        { h: "How We Use Your Data", p: "Your data powers order processing, delivery, support, and optional marketing you can opt out of at any time. We never sell your personal information to third parties." },
        { h: "Cookies & Storage", p: "We use local browser storage to keep you signed in and remember your cart. You can clear this at any time from your browser settings." },
{ h: "Your Rights", p: "You may request access, correction, or deletion of your data by contacting concierge@sarvacart.store. We respond within 30 days." },
      ]}
    />
  );
}

export function Terms() {
  return (
    <Legal
      title="Terms & Conditions"
      sections={[
        { h: "Acceptance of Terms", p: "By accessing SarvaCart you agree to these terms. If you do not agree, please discontinue use of the platform." },
        { h: "Accounts", p: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account." },
        { h: "Pricing & Availability", p: "All prices are listed in INR and may change without notice. Products are subject to availability; we reserve the right to limit quantities." },
        { h: "Intellectual Property", p: "All content, imagery, and branding on SarvaCart is owned by us or our partners and may not be reproduced without permission." },
        { h: "Limitation of Liability", p: "SarvaCart is not liable for indirect or consequential damages arising from the use of our platform to the fullest extent permitted by law." },
      ]}
    />
  );
}

export function Refund() {
  return (
    <Legal
      title="Refund Policy"
      sections={[
        { h: "30-Day Returns", p: "Unworn items in original condition and packaging may be returned within 30 days of delivery for a full refund or exchange." },
        { h: "How to Initiate", p: "Start a return from your Orders page or email concierge@sarvacart.store with your order ID. We'll arrange a complimentary pickup." },
        { h: "Refund Timeline", p: "Approved refunds are processed to your original payment method within 5–7 business days of us receiving the returned item." },
        { h: "Non-Returnable Items", p: "For hygiene and safety, custom-engraved jewellery and final-sale items cannot be returned unless they arrive damaged or defective." },
      ]}
    />
  );
}
