import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Banknote, Smartphone, CreditCard, ShoppingBag, Clock } from "lucide-react";
import { useStore, formatINR, type Order } from "../lib/store";
import { Button, Page } from "../components/ui";
import { cn } from "../utils/cn";

type PaymentKey = "Cash on Delivery" | "UPI" | "Online Payment";

interface PaymentOption {
  key: PaymentKey;
  icon: typeof Banknote;
  desc: string;
  disabled?: boolean;
}

const payments: PaymentOption[] = [
  { key: "Cash on Delivery", icon: Banknote, desc: "Pay when it arrives at your door." },
  { key: "UPI", icon: Smartphone, desc: "Instant pay via any UPI app.", disabled: true },
  { key: "Online Payment", icon: CreditCard, desc: "Card / Online gateway.", disabled: true },
];

export default function Checkout() {
  const { cart, products, user, placeOrder, toast } = useStore();
  const [placed, setPlaced] = useState<Order | null>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const [payment, setPayment] = useState<Order["payment"]>("Cash on Delivery");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const lines = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! }));
  const discounted = lines.reduce((s, l) => s + l.product.discountPrice * l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = subtotal - discounted;
  const delivery = discounted > 50000 || discounted === 0 ? 0 : 499;
  const total = discounted + delivery;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) e.phone = "Enter a valid 10-digit phone";
    if (form.address.trim().length < 10) e.address = "Enter a complete delivery address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const order = placeOrder(form, payment);
    if (order) setPlaced(order);
  };

  if (placed) {
    return (
      <Page className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-36 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15"
        >
          <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        </motion.div>
        <h1 className="mt-8 font-serif text-4xl font-bold text-white">Order confirmed</h1>
        <p className="mt-3 text-zinc-400">
          Thank you, {placed.customer.name.split(" ")[0]}. Your order{" "}
          <span className="text-gold-soft">{placed.id}</span> is being prepared.
        </p>
        <div className="glass mt-8 w-full rounded-2xl p-6 text-left">
          <div className="flex justify-between text-sm text-zinc-300">
            <span>Total paid</span>
            <span className="text-gradient-gold text-lg font-semibold">{formatINR(placed.total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-zinc-400">
            <span>Payment</span>
            <span>{placed.payment}</span>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button to="/orders">View My Orders</Button>
          <Button to="/shop" variant="outline">Keep Shopping</Button>
        </div>
      </Page>
    );
  }

  if (cart.length === 0) {
    return (
      <Page className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-40 text-center">
        <ShoppingBag className="h-14 w-14 text-zinc-600" />
        <h1 className="mt-6 font-serif text-3xl text-white">Your cart is empty</h1>
        <Button to="/shop" className="mt-6">Browse products</Button>
      </Page>
    );
  }

  const field = (key: keyof typeof form, label: string, type = "text", area = false) => (
    <div>
      <label className="mb-1.5 block text-sm text-zinc-400">{label}</label>
      {area ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={cn(
            "w-full resize-none rounded-xl bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50",
            errors[key] ? "border border-red-500/60" : "border border-white/10"
          )}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={cn(
            "w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-gold/50",
            errors[key] ? "border border-red-500/60" : "border border-white/10"
          )}
        />
      )}
      {errors[key] && <p className="mt-1 text-xs text-red-400">{errors[key]}</p>}
    </div>
  );

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-[#1c1917] sm:text-5xl">Checkout</h1>

      <form onSubmit={submit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* delivery details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Delivery Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {field("name", "Full Name")}
              {field("phone", "Phone Number", "tel")}
              <div className="sm:col-span-2">{field("email", "Email", "email")}</div>
              <div className="sm:col-span-2">{field("address", "Delivery Address", "text", true)}</div>
            </div>
          </div>

          {/* payment */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Payment Method</h2>
            <div className="mt-5 space-y-3">
              {payments.map((p) => (
                <button
                  type="button"
                  key={p.key}
                  disabled={p.disabled}
                  onClick={() => {
                    if (p.disabled) {
                      toast("info", "Coming Soon");
                      return;
                    }
                    setPayment(p.key);
                  }}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition",
                    p.disabled && "cursor-not-allowed opacity-60",
                    !p.disabled &&
                      (payment === p.key
                        ? "border-[#d9b18b] bg-[#f9eee4]"
                        : "border-[#e7ddd5] hover:border-[#d9b18b]")
                  )}
                >
                  <div className={cn("rounded-lg p-2.5", payment === p.key && !p.disabled ? "bg-[#f6e7d9] text-[#b8733b]" : "bg-[#f8f4f0] text-[#654e40]")}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1c1917]">{p.key}</p>
                    <p className="text-xs text-[#665f5a]">{p.desc}</p>
                  </div>
                  {p.disabled ? (
                    <span className="flex items-center gap-1 rounded-full bg-[#f3efe9] px-2.5 py-1 text-[11px] font-semibold text-[#5c524d]">
                      <Clock className="h-3 w-3" /> Coming Soon
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full border-2",
                        payment === p.key ? "border-[#b8733b] bg-[#b8733b]" : "border-[#b7aca5]"
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* summary */}
        <div className="h-fit lg:sticky lg:top-28">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-serif text-2xl font-bold text-[#1c1917]">Order Summary</h2>
            <div className="mt-5 max-h-60 space-y-3 overflow-auto pr-1">
              {lines.map((l) => (
                <div key={l.productId + l.size + l.color} className="flex gap-3">
                  <img src={l.product.images[0]} alt="" className="h-16 w-14 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm text-[#1c1917]">{l.product.name}</p>
                    <p className="text-xs text-[#7d736d]">Qty {l.qty}</p>
                  </div>
                  <p className="self-center text-sm text-[#b8733b]">
                    {formatINR(l.product.discountPrice * l.qty)}
                  </p>
                </div>
              ))}
            </div>
            <dl className="mt-5 space-y-2 border-t border-[#e7ddd5] pt-5 text-sm">
              <div className="flex justify-between text-[#4a433f]"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              <div className="flex justify-between text-[#2e8b57]"><dt>Discount</dt><dd>− {formatINR(discount)}</dd></div>
              <div className="flex justify-between text-[#4a433f]"><dt>Delivery</dt><dd>{delivery === 0 ? "Free" : formatINR(delivery)}</dd></div>
              <div className="flex justify-between border-t border-[#e7ddd5] pt-3 text-lg font-semibold text-[#1c1917]">
                <dt>Total</dt><dd className="text-gradient-gold">{formatINR(total)}</dd>
              </div>
            </dl>
            <Button type="submit" full size="lg" className="mt-6">Place Order</Button>
            <Link to="/cart" className="mt-4 block text-center text-sm text-[#665f5a] hover:text-[#b8733b]">
              Back to cart
            </Link>
          </div>
        </div>
      </form>
    </Page>
  );
}
