import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useStore } from "../lib/store";
import { categories } from "../data/seed";
import { Button, Page, Reveal, SectionTitle, Parallax } from "../components/ui";
import ProductCard from "../components/ProductCard";

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden">
      <div className="aurora absolute inset-0" />
      {/* floating product visuals */}
      <motion.img
        style={{ y: y1 }}
        src={categories[2].image}
        alt=""
        className="float-anim absolute right-[6%] top-[16%] hidden h-64 w-48 rotate-6 rounded-3xl object-cover opacity-80 gold-glow lg:block"
      />
      <motion.img
        style={{ y: y2 }}
        src={categories[3].image}
        alt=""
        className="float-anim absolute bottom-[12%] right-[22%] hidden h-40 w-32 -rotate-6 rounded-2xl object-cover opacity-70 lg:block"
        loading="lazy"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-28 sm:px-6">
        <motion.div
          style={{ opacity }}
          className="max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-light inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-gold-soft"
          >
            <Sparkles className="h-4 w-4" /> The 2026 Cinematic Collection
          </motion.span>

          <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.05] text-white sm:text-7xl lg:text-8xl">
            {"Luxury,".split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {c}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-gradient-gold"
            >
              reimagined.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg text-zinc-300"
          >
            Where Apple-grade product storytelling meets the soul of a fashion house. Discover
            curated wear, fine jewellery, and future-tech — staged like cinema.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Button to="/shop" size="lg">
              <ShoppingBag className="h-4 w-4" /> Shop Now
            </Button>
            <Button to="/#categories" variant="outline" size="lg">
              Explore Categories <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="mt-12 flex flex-wrap gap-8 text-sm text-zinc-400"
          >
            <div>
              <p className="font-serif text-3xl font-bold text-white">12k+</p>
              <p>Curated members</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-white">4.9★</p>
              <p>Average rating</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-white">48h</p>
              <p>Express delivery</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
    </section>
  );
}

const perks = [
  { icon: Truck, title: "Express Worldwide", text: "Insured 48-hour delivery on every order." },
  { icon: ShieldCheck, title: "Authenticity Promise", text: "Every piece verified & certified." },
  { icon: Star, title: "Concierge Service", text: "Personal styling, around the clock." },
];

export default function Home() {
  const { products } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const trending = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <Page>
      <Hero />

      {/* perks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="glass flex items-start gap-4 rounded-2xl p-6">
                <div className="rounded-xl bg-gold/10 p-3 text-gold">
                  <p.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="text-sm text-zinc-400">{p.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* categories */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6">
        <Reveal>
          <SectionTitle
            eyebrow="Curated Worlds"
            title="Four houses. One obsession with craft."
            subtitle="Step into immersive collections, each art-directed to feel like a flagship boutique."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link
                to={`/shop/${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold-soft">{c.tagline}</p>
                  <h3 className="mt-1 font-serif text-2xl font-bold text-white">{c.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-200 opacity-0 transition group-hover:opacity-100">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* parallax story banner */}
      <section className="relative my-12">
        <Parallax amount={80} className="h-[60vh]">
          <img
            src={categories[0].image}
            alt=""
            className="h-[80vh] w-full object-cover"
            loading="lazy"
          />
        </Parallax>
        <div className="absolute inset-0 flex items-center bg-black/55">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <Reveal>
<p className="text-xs uppercase tracking-[0.3em] text-gold-soft">The SarvaCart Ethos</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl font-bold text-white sm:text-6xl">
                Objects designed to be lived with — and remembered.
              </h2>
              <Button to="/about" variant="outline" className="mt-7">
                Our Story <ArrowRight className="h-4 w-4" />
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* featured */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionTitle eyebrow="Editor's Edit" title="Featured masterpieces" />
            <Button to="/shop" variant="ghost">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* trending */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <SectionTitle eyebrow="Most Loved" title="Trending this season" />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {trending.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* newsletter CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="glass relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
            <div className="aurora absolute inset-0 opacity-60" />
            <div className="relative">
              <h2 className="font-serif text-3xl font-bold text-white sm:text-5xl">
                Join the inner circle
              </h2>
              <p className="mx-auto mt-3 max-w-md text-zinc-300">
                Early access to drops, private sales and styling sessions. No noise — only craft.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="glass-light flex-1 rounded-full px-5 py-3.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-gold/50"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </Page>
  );
}
