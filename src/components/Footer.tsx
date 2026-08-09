import { Link } from "react-router-dom";
import { Camera, Send, Globe, Mail } from "lucide-react";
import { categories } from "../data/seed";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-[#08080a]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
<Link to="/" aria-label="SarvaCart home">
            <BrandLogo />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-zinc-400">
            A cinematic luxury marketplace where fashion, fine jewellery, and future-tech meet
            uncompromising craft.
          </p>
          <div className="mt-5 flex gap-3">
            {[Camera, Send, Globe, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="rounded-full border border-white/10 p-2.5 text-zinc-300 transition hover:border-gold/40 hover:text-gold-soft"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-soft">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/shop/${c.slug}`} className="transition hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className="transition hover:text-white">All Products</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-soft">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li><Link to="/about" className="transition hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="transition hover:text-white">Contact Us</Link></li>
            <li><Link to="/orders" className="transition hover:text-white">Track Orders</Link></li>
            <li><Link to="/admin/login" className="transition hover:text-white">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-soft">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
            <li><Link to="/privacy" className="transition hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/refund" className="transition hover:text-white">Refund Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-zinc-500">
© {new Date().getFullYear()} SarvaCart. Crafted with precision. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
