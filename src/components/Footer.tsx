import { Link } from "react-router-dom";
import { Camera, Send, Globe, Mail } from "lucide-react";
import { categories } from "../data/seed";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
   <footer className="relative mt-24 border-t border-[#e9dfd4] bg-[#fffdfb]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
<Link to="/" aria-label="SarvaCart home">
            <BrandLogo />
          </Link>
<p className="mt-4 max-w-xs text-sm text-[#625c58]">
            A cinematic luxury marketplace where fashion, fine jewellery, and future-tech meet
            uncompromising craft.
          </p>
          <div className="mt-5 flex gap-3">
            {[Camera, Send, Globe, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
      className="rounded-full border border-[#e7ddd5] bg-white p-2.5 text-[#4f4844] transition hover:border-[#d9b18b] hover:text-[#b8733b]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
<h4 className="text-sm font-semibold uppercase tracking-widest text-[#b8733b]">Shop</h4>
<ul className="mt-4 space-y-2.5 text-sm text-[#625c58]">
            {categories.map((c) => (
              <li key={c.slug}>
      <Link to={`/shop/${c.slug}`} className="transition hover:text-[#1c1917]">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
    <Link to="/shop" className="transition hover:text-[#1c1917]">All Products</Link>
            </li>
          </ul>
        </div>

        <div>
<h4 className="text-sm font-semibold uppercase tracking-widest text-[#b8733b]">Company</h4>
<ul className="mt-4 space-y-2.5 text-sm text-[#625c58]">
  <li><Link to="/about" className="transition hover:text-[#1c1917]">About Us</Link></li>
  <li><Link to="/contact" className="transition hover:text-[#1c1917]">Contact Us</Link></li>
  <li><Link to="/orders" className="transition hover:text-[#1c1917]">Track Orders</Link></li>
</ul>
       </div>

       <div>
<h4 className="text-sm font-semibold uppercase tracking-widest text-[#b8733b]">Legal</h4>
<ul className="mt-4 space-y-2.5 text-sm text-[#625c58]">
  <li><Link to="/privacy" className="transition hover:text-[#1c1917]">Privacy Policy</Link></li>
  <li><Link to="/terms" className="transition hover:text-[#1c1917]">Terms & Conditions</Link></li>
  <li><Link to="/refund" className="transition hover:text-[#1c1917]">Refund Policy</Link></li>
  <li className="pt-2">
    <Link to="/admin/login" className="text-xs uppercase tracking-[0.22em] text-[#8b633f] transition hover:text-[#b8733b]">
      Admin Login
    </Link>
  </li>
</ul>
       </div>
     </div>

     <div className="border-t border-[#e9dfd4] py-6">
       <p className="text-center text-xs text-[#7a716c]">
© {new Date().getFullYear()} SarvaCart. Crafted with precision. All rights reserved.
       </p>
     </div>
   </footer>
 );
}
