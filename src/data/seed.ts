export type CategorySlug = "mens-wear" | "ladies-wear" | "jewellery" | "electronics";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  discountPrice: number;
  description: string;
  stock: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  rating: number;
  featured?: boolean;
  createdAt: number;
}

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1100&w=760`;

export const categories: Category[] = [
  {
    slug: "mens-wear",
    name: "Men's Wear",
    tagline: "Tailored for the modern icon",
    image: px(31840907),
  },
  {
    slug: "ladies-wear",
    name: "Ladies Wear",
    tagline: "Grace woven into every thread",
    image: px(14801160),
  },
  {
    slug: "jewellery",
    name: "Jewellery",
    tagline: "Light captured in gold",
    image: px(32797482),
  },
  {
    slug: "electronics",
    name: "Electronics",
    tagline: "Engineered to feel like the future",
    image: px(32912307),
  },
];

export const seedProducts: Product[] = [
  // MEN'S WEAR
  {
    id: "m1",
    name: "Onyx Trench Coat",
    category: "mens-wear",
    price: 38000,
    discountPrice: 28999,
    description:
      "A floor-grazing trench cut from Italian wool-cashmere. Structured shoulders, a storm-proof silhouette, and a hand-finished horn-button placket make it the centrepiece of any wardrobe.",
    stock: 12,
    images: [px(32653254), px(15463481), px(19988840)],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Onyx", "Charcoal"],
    rating: 4.9,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "m2",
    name: "Midnight Embellished Jacket",
    category: "mens-wear",
    price: 26000,
    discountPrice: 21500,
    description:
      "Hand-beaded evening jacket designed for the spotlight. A slim, sculpted fit with satin lapels and crystal detailing that catches every flash.",
    stock: 7,
    images: [px(31840907), px(31780723), px(15661618)],
    sizes: ["S", "M", "L"],
    colors: ["Midnight", "Bordeaux"],
    rating: 4.8,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "m3",
    name: "Heritage Tailored Suit",
    category: "mens-wear",
    price: 45000,
    discountPrice: 39000,
    description:
      "A two-piece masterclass in tailoring. Half-canvas construction, a peak lapel, and a breathable super-120s wool that moves with you from boardroom to ballroom.",
    stock: 9,
    images: [px(31840917), px(32653254), px(15463481)],
    sizes: ["38", "40", "42", "44"],
    colors: ["Slate", "Navy"],
    rating: 5.0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
  {
    id: "m4",
    name: "Velvet Noir Shirt",
    category: "mens-wear",
    price: 14000,
    discountPrice: 10999,
    description:
      "A liquid-soft velvet shirt with a relaxed drape. Tonal mother-of-pearl buttons and a hidden collar stay keep the look effortlessly sharp.",
    stock: 0,
    images: [px(15661618), px(31780723), px(19988840)],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Emerald"],
    rating: 4.6,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },

  // LADIES WEAR
  {
    id: "l1",
    name: "Stardust Evening Gown",
    category: "ladies-wear",
    price: 52000,
    discountPrice: 42000,
    description:
      "A floor-sweeping gown encrusted with thousands of hand-set sequins. Built on a corseted bodice with an architectural train made to command the room.",
    stock: 6,
    images: [px(14801160), px(6234211), px(6235477)],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Obsidian", "Champagne"],
    rating: 4.9,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "l2",
    name: "Pearl Cascade Gown",
    category: "ladies-wear",
    price: 47000,
    discountPrice: 38500,
    description:
      "Strapless silk-satin column dress draped with cascading pearls. A timeless red-carpet silhouette finished with a thigh-high slit.",
    stock: 5,
    images: [px(10543120), px(36973659), px(6234216)],
    sizes: ["XS", "S", "M"],
    colors: ["Black Pearl", "Ivory"],
    rating: 4.8,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: "l3",
    name: "Maison Wool Coat",
    category: "ladies-wear",
    price: 34000,
    discountPrice: 27999,
    description:
      "An oversized double-faced wool coat with a belted waist. Sculptural, warm, and endlessly elegant for cold-weather city days.",
    stock: 11,
    images: [px(29271905), px(6234216), px(14801160)],
    sizes: ["S", "M", "L"],
    colors: ["Camel", "Stone"],
    rating: 4.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: "l4",
    name: "Scarlet Heritage Dress",
    category: "ladies-wear",
    price: 29000,
    discountPrice: 23500,
    description:
      "A statement scarlet dress with artisan embroidery and silver detailing. Cut to flatter, made to be remembered.",
    stock: 8,
    images: [px(29368493), px(6235477), px(10543120)],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Scarlet", "Plum"],
    rating: 4.8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },

  // JEWELLERY
  {
    id: "j1",
    name: "Aureate Diamond Set",
    category: "jewellery",
    price: 185000,
    discountPrice: 159000,
    description:
      "An 18k gold necklace-and-ring set crowned with brilliant-cut diamonds. Each stone is conflict-free and hand-set by master artisans.",
    stock: 4,
    images: [px(32797482), px(30541177), px(30541188)],
    colors: ["Yellow Gold", "Rose Gold"],
    rating: 5.0,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "j2",
    name: "Solitaire Vow Ring",
    category: "jewellery",
    price: 142000,
    discountPrice: 124900,
    description:
      "A 1.5-carat solitaire set in a six-prong platinum band. The cut is calibrated for maximum fire — a forever kind of sparkle.",
    stock: 6,
    images: [px(2849742), px(30541171), px(30541175)],
    colors: ["Platinum", "White Gold"],
    rating: 4.9,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    id: "j3",
    name: "Pearl Heirloom Necklace",
    category: "jewellery",
    price: 78000,
    discountPrice: 64000,
    description:
      "Freshwater pearls strung on a gold-clasped strand alongside a matching ring. Understated luxury for everyday wear.",
    stock: 10,
    images: [px(28436705), px(32797482), px(30541187)],
    colors: ["Pearl Gold"],
    rating: 4.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 11,
  },
  {
    id: "j4",
    name: "Eclipse Twin Rings",
    category: "jewellery",
    price: 96000,
    discountPrice: 82500,
    description:
      "A pair of interlocking gold-and-diamond rings designed to be worn together or apart. Sculpted edges, dramatic shadows.",
    stock: 7,
    images: [px(30541188), px(30541175), px(30541171)],
    colors: ["Gold", "Rose Gold"],
    rating: 4.8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },

  // ELECTRONICS
  {
    id: "e1",
name: "SarvaCart Aura Headphones",
    category: "electronics",
    price: 42000,
    discountPrice: 34999,
    description:
      "Reference-grade wireless headphones with adaptive noise cancelling, 40-hour battery, and a machined aluminium frame. Sound, sculpted.",
    stock: 20,
    images: [px(9154411), px(9154412), px(14212887)],
    colors: ["Stealth Black", "Beige"],
    rating: 4.9,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "e2",
    name: "Nebula Smartphone Pro",
    category: "electronics",
    price: 119000,
    discountPrice: 104999,
    description:
      "A titanium flagship with a cinema-grade display, pro-level cameras, and all-day intelligence. The future, pocket-sized.",
    stock: 15,
    images: [px(32912307), px(16387546), px(9528219)],
    colors: ["Titanium", "Graphite"],
    rating: 4.8,
    featured: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "e3",
    name: "Chronos Smartwatch",
    category: "electronics",
    price: 56000,
    discountPrice: 47999,
    description:
      "A sapphire-glass smartwatch with health-grade sensors and a 2-day battery. Crafted for the wrist of someone who values both time and design.",
    stock: 18,
    images: [px(9528219), px(16387546), px(32912307)],
    colors: ["Midnight", "Silver"],
    rating: 4.7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: "e4",
    name: "Studio Reference Cans",
    category: "electronics",
    price: 31000,
    discountPrice: 25999,
    description:
      "Open-back studio headphones tuned for mixing engineers. Plush memory-foam earcups and a detachable braided cable.",
    stock: 0,
    images: [px(5956086), px(14212887), px(33305814)],
    colors: ["Classic Black"],
    rating: 4.6,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13,
  },
];
