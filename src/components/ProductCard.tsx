import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, ShoppingBag } from "lucide-react";
import { useStore, formatINR } from "../lib/store";
import { categories, type Product } from "../data/seed";
import { StockBadge } from "./ui";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart } = useStore();
  const cat = categories.find((c) => c.slug === product.category);
  const off = Math.round(((product.price - product.discountPrice) / product.price) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl glass"
    >
      <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#e8cf8f] to-[#b8860b] px-2.5 py-1 text-[11px] font-bold text-black">
            -{off}%
          </span>
        )}
        <div className="absolute right-3 top-3">
          <StockBadge stock={product.stock} />
        </div>
        {/* hover quick actions */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="glass flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium text-white">
            <Eye className="h-4 w-4" /> View
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-soft">{cat?.name}</p>
        <Link
          to={`/product/${product.id}`}
          className="mt-1 font-serif text-xl font-semibold text-white transition-colors hover:text-gold-soft"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{product.description}</p>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-semibold text-gradient-gold">
            {formatINR(product.discountPrice)}
          </span>
          {product.discountPrice < product.price && (
            <span className="mb-0.5 text-sm text-zinc-500 line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock <= 0}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 py-2.5 text-sm font-medium text-gold-soft transition-all hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" />
          {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}
