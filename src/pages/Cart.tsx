import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore, formatINR } from "../lib/store";
import { computeOrderTotals } from "../lib/pricing";
import { categories } from "../data/seed";
import { Button, Page } from "../components/ui";

export default function Cart() {
  const { cart, products, setQty, removeFromCart } = useStore();

  const lines = cart.flatMap((c) => {
    const product = products.find((p) => p.id === c.productId);
    return product ? [{ ...c, product }] : [];
  });
  const unavailableItems = cart.filter((c) => !products.some((p) => p.id === c.productId));
  const hasUnavailableItems = lines.length !== cart.length;

  const { subtotal, discount, delivery, total } = computeOrderTotals(
    lines.map((l) => ({ price: l.product.price, discountPrice: l.product.discountPrice, qty: l.qty })),
  );

  if (cart.length === 0) {
    return (
      <Page className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-40 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass flex h-28 w-28 items-center justify-center rounded-full"
        >
          <ShoppingBag className="h-12 w-12 text-gold-soft" />
        </motion.div>
        <h1 className="mt-8 font-serif text-4xl font-bold text-white">Your cart is empty</h1>
        <p className="mt-3 text-zinc-400">
          The finest things await. Begin your curation.
        </p>
        <Button to="/shop" size="lg" className="mt-8">
          Start Shopping <ArrowRight className="h-4 w-4" />
        </Button>
      </Page>
    );
  }

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">Shopping Cart</h1>
      <p className="mt-2 text-zinc-400">{cart.length} item{cart.length > 1 ? "s" : ""} in your bag</p>
      {hasUnavailableItems && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Some items are no longer available. Remove them before checkout.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <AnimatePresence>
            {unavailableItems.map((item) => (
              <div key={item.productId + item.size + item.color} className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
                <p className="text-sm text-red-300">An item in your cart is no longer available.</p>
                <button
                  onClick={() => removeFromCart(item)}
                  className="shrink-0 rounded-lg border border-red-400/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))}
            {lines.map((l) => {
              const cat = categories.find((c) => c.slug === l.product.category);
              return (
                <motion.div
                  key={l.productId + l.size + l.color}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="glass flex gap-4 rounded-2xl p-4"
                >
                  <Link to={`/product/${l.product.id}`} className="shrink-0">
                    <img
                      src={l.product.images[0]}
                      alt={l.product.name}
                      className="h-28 w-24 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-gold-soft">{cat?.name}</p>
                        <Link to={`/product/${l.product.id}`} className="font-serif text-xl text-white hover:text-gold-soft">
                          {l.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {[l.size, l.color].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(l)}
                        className="h-fit rounded-full p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="glass-light flex items-center gap-2 rounded-full px-2 py-1">
                        <button onClick={() => setQty(l, l.qty - 1)} className="rounded-full p-1.5 text-white hover:bg-white/10">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm text-white">{l.qty}</span>
                        <button
                          onClick={() => setQty(l, Math.min(l.product.stock, l.qty + 1))}
                          className="rounded-full p-1.5 text-white hover:bg-white/10"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gradient-gold">
                          {formatINR(l.product.discountPrice * l.qty)}
                        </p>
                        {l.product.discountPrice < l.product.price && (
                          <p className="text-xs text-zinc-500 line-through">
                            {formatINR(l.product.price * l.qty)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* summary */}
        <div className="h-fit lg:sticky lg:top-28">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-serif text-2xl font-bold text-white">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-300">
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-emerald-400">
                <dt>Discount</dt>
                <dd>− {formatINR(discount)}</dd>
              </div>
              <div className="flex justify-between text-zinc-300">
                <dt>Delivery</dt>
                <dd>{delivery === 0 ? "Free" : formatINR(delivery)}</dd>
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="flex justify-between text-lg font-semibold text-white">
                <dt>Total</dt>
                <dd className="text-gradient-gold">{formatINR(total)}</dd>
              </div>
            </dl>
            <Button to={hasUnavailableItems ? "/cart" : "/checkout"} full size="lg" className="mt-6">
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <Link to="/shop" className="mt-4 block text-center text-sm text-zinc-400 hover:text-gold-soft">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
