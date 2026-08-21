import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Zap, Minus, Plus, Star, Truck, RotateCcw, ShieldCheck, ChevronLeft } from "lucide-react";
import { useStore, formatINR } from "../lib/store";
import { categories } from "../data/seed";
import { Button, Page, StockBadge } from "../components/ui";
import ProductCard from "../components/ProductCard";
import { cn } from "../utils/cn";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { getProduct, products, addToCart } = useStore();
  const navigate = useNavigate();
  const product = getProduct(id ?? "");

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [color, setColor] = useState<string | undefined>(product?.colors?.[0]);

  if (!product) {
    return (
      <Page className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-40 text-center">
        <h1 className="font-serif text-4xl text-white">Product not found</h1>
        <Button to="/shop" className="mt-6">Back to shop</Button>
      </Page>
    );
  }

  const cat = categories.find((c) => c.slug === product.category);
  const off = Math.round(((product.price - product.discountPrice) / product.price) * 100);
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => addToCart(product.id, qty, { size, color });
  const buyNow = () => {
    addToCart(product.id, qty, { size, color });
    navigate("/checkout");
  };

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <Link to="/shop" className="mb-6 inline-flex items-center gap-1 text-sm text-[#665f5a] hover:text-[#b8733b]">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "h-20 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-24 sm:w-20",
                      activeImg === i ? "border-[#b8733b]" : "border-[#e7ddd5] opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <motion.div
            key={activeImg}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex-1 overflow-hidden rounded-3xl glass"
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="aspect-[3/4] w-full object-cover"
            />
            {off > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#e8cf8f] to-[#b8733b] px-3 py-1 text-sm font-bold text-[#fffdfb]">
                -{off}% OFF
              </span>
            )}
          </motion.div>
        </div>

        {/* info */}
        <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#b8733b]">{cat?.name}</p>
              <h1 className="mt-2 font-serif text-4xl font-bold text-[#1c1917] sm:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#b8733b]">
              <Star className="h-4 w-4 fill-current" /> {product.rating.toFixed(1)}
            </span>
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-4xl font-bold text-gradient-gold">
              {formatINR(product.discountPrice)}
            </span>
            {product.discountPrice < product.price && (
              <span className="mb-1 text-xl text-[#8a7d77] line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-[#5f5854]">{product.description}</p>

          {/* sizes */}
          {product.sizes && (
            <div className="mt-7">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#665f5a]">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "min-w-[48px] rounded-xl border px-4 py-2.5 text-sm transition",
                      size === s
                        ? "border-[#b8733b] bg-[#f9eee4] text-[#b8733b]"
                        : "border-[#e7ddd5] text-[#524b47] hover:border-[#d9b18b]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* colors */}
          {product.colors && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#665f5a]">Colour</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-sm transition",
                      color === c
                        ? "border-[#b8733b] bg-[#f9eee4] text-[#b8733b]"
                        : "border-[#e7ddd5] text-[#524b47] hover:border-[#d9b18b]"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* qty */}
          <div className="mt-7 flex items-center gap-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#665f5a]">Qty</p>
            <div className="glass-light flex items-center gap-3 rounded-full px-2 py-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="rounded-full p-2 text-[#1c1917] hover:bg-[#f3eee9]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-[#1c1917]">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}
                className="rounded-full p-2 text-[#1c1917] hover:bg-[#f3eee9]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleAdd} disabled={product.stock <= 0} size="lg" variant="outline">
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </Button>
            <Button onClick={buyNow} disabled={product.stock <= 0} size="lg">
              <Zap className="h-4 w-4" /> Buy Now
            </Button>
          </div>

          {/* perks */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#e7ddd5] pt-6 text-center text-xs text-[#665f5a]">
            {[
              { icon: Truck, t: "Free express shipping" },
              { icon: RotateCcw, t: "30-day returns" },
              { icon: ShieldCheck, t: "Authenticity certified" },
            ].map((p) => (
              <div key={p.t} className="flex flex-col items-center gap-2">
                <p.icon className="h-5 w-5 text-[#b8733b]" />
                {p.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-serif text-3xl font-bold text-[#1c1917]">You may also love</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}
