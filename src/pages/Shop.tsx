import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { useStore, formatINR } from "../lib/store";
import { categories, type CategorySlug } from "../data/seed";
import { Page, Reveal } from "../components/ui";
import ProductCard from "../components/ProductCard";
import { cn } from "../utils/cn";

const sorts = [
  { key: "latest", label: "Latest" },
  { key: "low", label: "Price: Low to High" },
  { key: "high", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
] as const;

type SortKey = (typeof sorts)[number]["key"];

export default function Shop() {
  const { products } = useStore();
  const { category } = useParams<{ category?: CategorySlug }>();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [activeCat, setActiveCat] = useState<CategorySlug | "all">(
    (category as CategorySlug) ?? "all"
  );
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sort, setSort] = useState<SortKey>("latest");
  const [showFilters, setShowFilters] = useState(false);

  // keep in sync when navigating between category routes
  useEffect(() => {
    setActiveCat((category as CategorySlug) ?? "all");
  }, [category]);

  const catMeta = categories.find((c) => c.slug === activeCat);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat !== "all") list = list.filter((p) => p.category === activeCat);
    if (query.trim())
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
    list = list.filter((p) => p.discountPrice <= maxPrice);
    switch (sort) {
      case "low":
        list.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "high":
        list.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [products, activeCat, query, maxPrice, sort]);

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      {/* hero banner */}
      <Reveal>
        <div className="relative mb-10 overflow-hidden rounded-3xl">
          <img
            src={catMeta?.image ?? categories[0].image}
            alt=""
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">
              {catMeta?.tagline ?? "The complete edit"}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold text-white sm:text-6xl">
              {catMeta?.name ?? "All Products"}
            </h1>
          </div>
        </div>
      </Reveal>

      {/* search + sort bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="glass-light flex flex-1 items-center gap-2 rounded-full px-4 py-3">
          <Search className="h-4 w-4 text-[#786d67]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent text-sm text-[#1c1917] placeholder:text-[#81756f] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="h-4 w-4 text-[#7a716c]" />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="glass-light rounded-full px-4 py-3 text-sm text-[#1c1917] outline-none [&>option]:bg-[#f5efe9]"
        >
          {sorts.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="glass-light flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[#1c1917] lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* filters sidebar */}
        <aside
          className={cn(
            "h-fit space-y-8 lg:block",
            showFilters ? "block" : "hidden"
          )}
        >
          <div className="glass rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#b8733b]">
              Category
            </h3>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              {[{ slug: "all", name: "All Products" }, ...categories].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setActiveCat(c.slug as CategorySlug | "all")}
                  className={cn(
                    "rounded-full px-4 py-2 text-left text-sm transition lg:rounded-xl",
                    activeCat === c.slug
                      ? "bg-[#f9eee4] text-[#b8733b]"
                      : "text-[#524a47] hover:bg-[#f6f1ed]"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#b8733b]">
              Max Price
            </h3>
            <input
              type="range"
              min={10000}
              max={200000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#b8733b]"
            />
            <p className="mt-2 text-sm text-[#554d49]">
              Up to <span className="text-gradient-gold font-semibold">{formatINR(maxPrice)}</span>
            </p>
          </div>
        </aside>

        {/* grid */}
        <div>
          <p className="mb-5 text-sm text-zinc-400">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} found
          </p>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass flex flex-col items-center justify-center rounded-3xl py-24 text-center"
            >
              <Search className="h-12 w-12 text-zinc-600" />
              <h3 className="mt-4 font-serif text-2xl text-white">Nothing matches just yet</h3>
              <p className="mt-2 text-zinc-400">Try adjusting your search or filters.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
