import PocketBase from "pocketbase";
import { createSignal } from "solid-js";

// ─────────────────────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────────────────────
const PB_URL =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090")
    : (process.env.POCKETBASE_URL          || "http://127.0.0.1:8090");

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

// ─────────────────────────────────────────────────────────────
// RETRY HELPER
// Wraps any PocketBase call with up to `retries` attempts.
// Backs off 300ms × attempt. Never retries 4xx errors.
// ─────────────────────────────────────────────────────────────
export async function pbFetch<T>(fn: () => Promise<T>, fallback: T, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (e?.status >= 400 && e?.status < 500) break;
      if (i < retries - 1) await new Promise(r => setTimeout(r, 300 * (i + 1)));
    }
  }
  return fallback;
}

// ─────────────────────────────────────────────────────────────
// AUTH STATE
// currentUser always starts null (same on SSR and client)
// so hydration DOM is identical. It resolves client-side only.
// ─────────────────────────────────────────────────────────────
export const [currentUser, setCurrentUser] = createSignal<any>(null);
export const [authReady,   setAuthReady]   = createSignal(false);

if (typeof window !== "undefined") {
  pb.authStore.onChange(() => {
    setCurrentUser(pb.authStore.isValid ? pb.authStore.model : null);
  }, true);

  pb.collection("users")
    .authRefresh()
    .then(() => setCurrentUser(pb.authStore.model))
    .catch(() => setCurrentUser(null))
    .finally(() => setAuthReady(true));
} else {
  setAuthReady(true);
}

export function isLoggedIn() {
  return typeof window !== "undefined" && pb.authStore.isValid;
}

// ─────────────────────────────────────────────────────────────
// IDLE AUTO-LOGOUT (10 minutes)
// Tracks mouse, keyboard, touch, scroll. On expiry clears auth.
// ─────────────────────────────────────────────────────────────
const IDLE_MS = 10 * 60 * 1000; // 10 minutes

if (typeof window !== "undefined") {
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function resetIdleTimer() {
    if (!pb.authStore.isValid) return; // only track when logged in
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (pb.authStore.isValid) {
        pb.authStore.clear();
        setCurrentUser(null);
        // Redirect to login with a message
        window.location.href = "/auth/login?expired=1";
      }
    }, IDLE_MS);
  }

  // Start timer as soon as auth is confirmed
  pb.authStore.onChange((_, model) => {
    if (model) {
      resetIdleTimer();
    } else {
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    }
  });

  // Activity events that reset the timer
  const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
  EVENTS.forEach(ev => window.addEventListener(ev, resetIdleTimer, { passive: true }));
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  active: boolean;
  collectionId: string;
};

export type Color = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  sizes: string[];
  colors: Color[] | string;
  in_stock: boolean;
  featured: boolean;
  collectionId: string;
  created: string;
};

export type CartItem = {
  product: Product;
  color: Color;
  size: string;
  quantity: number;
};

export type Order = {
  id: string;
  user: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address: string;
  created: string;
};

export type HeroSlide = {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url?: string;
  order: number;
  active: boolean;
  collectionId: string;
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
export function parseColors(raw: Color[] | string | undefined): Color[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw as string); } catch { return []; }
}

export function getImageUrl(product: Product, index = 0): string {
  if (!product.images?.length) return "";
  const f = Array.isArray(product.images) ? product.images[index] : product.images;
  if (!f) return "";
  return pb.files.getURL({ collectionId: product.collectionId, id: product.id } as any, f);
}

export function getAllImageUrls(product: Product): string[] {
  if (!product.images?.length) return [];
  return product.images.map(f =>
    pb.files.getURL({ collectionId: product.collectionId, id: product.id } as any, f)
  );
}

export function getCategoryImageUrl(cat: Category): string {
  if (!cat.image) return "";
  return pb.files.getURL({ collectionId: cat.collectionId, id: cat.id } as any, cat.image);
}

export function getHeroSlideImageUrl(slide: HeroSlide): string {
  if (!slide.image) return "";
  return pb.files.getURL({ collectionId: slide.collectionId, id: slide.id } as any, slide.image);
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  const auth = await pb.collection("users").authWithPassword(email, password);
  setCurrentUser(pb.authStore.model);
  return auth;
}

export async function registerWithEmail(email: string, password: string, name: string) {
  await pb.collection("users").create({ email, password, passwordConfirm: password, name });
  const auth = await pb.collection("users").authWithPassword(email, password);
  setCurrentUser(pb.authStore.model);
  return auth;
}

export function logout() {
  pb.authStore.clear();
  setCurrentUser(null);
}

// ─────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  return pbFetch(
    () => pb.collection("categories").getFullList<Category>({ filter: "active=true", sort: "order" }),
    MOCK_CATEGORIES
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────
export async function getProducts(categorySlug?: string): Promise<Product[]> {
  return pbFetch(
    () => pb.collection("product").getFullList<Product>({
      filter: categorySlug ? `category="${categorySlug}"` : "",
      sort: "-created",
    }),
    categorySlug
      ? MOCK_PRODUCTS.filter(p => p.category === categorySlug)
      : MOCK_PRODUCTS
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  return pbFetch(
    () => pb.collection("product").getOne<Product>(id),
    MOCK_PRODUCTS.find(p => p.id === id) ?? null
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return pbFetch(
    () => pb.collection("product").getFullList<Product>({
      filter: "featured=true",
      sort: "-created",
    }),
    MOCK_PRODUCTS.filter(p => p.featured)
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH  — uses PocketBase full-text filter
// Searches: name, description, category (case-insensitive ~)
// Falls back to mock filter if PB unavailable
// ─────────────────────────────────────────────────────────────
export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const q = query.trim();

  return pbFetch(
    () => pb.collection("product").getFullList<Product>({
      filter: `name ~ "${q}" || description ~ "${q}" || category ~ "${q}"`,
      sort: "-created",
    }),
    // fallback: client-side filter on mock
    MOCK_PRODUCTS.filter(p => {
      const lq = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(lq) ||
        p.description.toLowerCase().includes(lq) ||
        p.category.toLowerCase().includes(lq)
      );
    })
  );
}

// ─────────────────────────────────────────────────────────────
// HERO SLIDES
// ─────────────────────────────────────────────────────────────
export async function getHeroSlides(): Promise<HeroSlide[]> {
  return pbFetch(
    () => pb.collection("hero_slides").getFullList<HeroSlide>({ filter: "active=true", sort: "order" }),
    MOCK_HERO_SLIDES
  );
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────
export async function createOrder(items: CartItem[], total: number, shippingAddress: string): Promise<Order> {
  if (!pb.authStore.isValid) throw new Error("Non authentifié");
  return pb.collection("orders").create<Order>({
    user: pb.authStore.model!.id,
    items: JSON.stringify(items),
    total,
    status: "pending",
    shipping_address: shippingAddress,
  });
}

export async function getUserOrders(): Promise<Order[]> {
  if (!pb.authStore.isValid) return [];
  return pbFetch(
    () => pb.collection("orders").getFullList<Order>({
      filter: `user="${pb.authStore.model!.id}"`,
      sort: "-created",
    }),
    []
  );
}

// ─────────────────────────────────────────────────────────────
// CART SYNC
// ─────────────────────────────────────────────────────────────
export async function syncCartToPB(items: CartItem[]) {
  if (!pb.authStore.isValid) return;
  try {
    const userId = pb.authStore.model!.id;
    try {
      const existing = await pb.collection("carts").getFirstListItem(`user="${userId}"`);
      await pb.collection("carts").update(existing.id, { items: JSON.stringify(items) });
    } catch {
      await pb.collection("carts").create({ user: userId, items: JSON.stringify(items) });
    }
  } catch (e) { console.warn("Cart sync failed:", e); }
}

export async function loadCartFromPB(): Promise<CartItem[]> {
  if (!pb.authStore.isValid) return [];
  try {
    const userId = pb.authStore.model!.id;
    const record = await pb.collection("carts").getFirstListItem(`user="${userId}"`);
    return typeof record.items === "string" ? JSON.parse(record.items) : (record.items ?? []);
  } catch { return []; }
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const DC: Color[] = [
  { name: "Noir",       hex: "#0a0a0a" },
  { name: "Blanc cassé",hex: "#f5f4f0" },
  { name: "Kaki",       hex: "#4a4a35" },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "TOPS",        slug: "tops",        order: 1, active: true, collectionId: "categories" },
  { id: "c2", name: "BOTTOMS",     slug: "bottoms",     order: 2, active: true, collectionId: "categories" },
  { id: "c3", name: "SETS",        slug: "sets",        order: 3, active: true, collectionId: "categories" },
  { id: "c4", name: "ACCESSORIES", slug: "accessories", order: 4, active: true, collectionId: "categories" },
  { id: "c5", name: "UPCYCLING",   slug: "upcycling",   order: 5, active: true, collectionId: "categories" },
];

export const MOCK_PRODUCTS: Product[] = [
  { id:"1", name:"VOID TEE",         price:45,  description:"Premium heavyweight cotton tee. Drop shoulders, pre-washed.",  category:"tops",        images:[], sizes:["XS","S","M","L","XL"], colors:DC,                                                                    in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"2", name:"OBLIVION HOODIE",  price:89,  description:"Oversized French terry hoodie. Kangaroo pocket, 400gsm.",       category:"tops",        images:[], sizes:["S","M","L","XL"],      colors:[{name:"Noir",hex:"#0a0a0a"},{name:"Gris",hex:"#888"}],                in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"3", name:"ABYSS CARGO PANT", price:110, description:"Wide-leg cargo, zip pockets. Relaxed fit.",                     category:"bottoms",     images:[], sizes:["XS","S","M","L"],      colors:[{name:"Kaki",hex:"#4a4a35"},{name:"Noir",hex:"#0a0a0a"}],             in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"4", name:"ASCEND SET",       price:145, description:"Matching tee + shorts co-ord in structured cotton.",            category:"sets",        images:[], sizes:["XS","S","M","L","XL"], colors:DC,                                                                    in_stock:true,  featured:false, collectionId:"products", created:"2025-01-01" },
  { id:"5", name:"TRANSCEND CAP",    price:35,  description:"6-panel structured cap. Embroidered logo.",                     category:"accessories", images:[], sizes:["ONE SIZE"],            colors:[{name:"Noir",hex:"#0a0a0a"},{name:"Blanc cassé",hex:"#f5f4f0"}],      in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"6", name:"REWORK JACKET",    price:195, description:"One-of-a-kind upcycled denim jacket. Hand-customized.",         category:"upcycling",   images:[], sizes:["S","M","L"],           colors:[{name:"Denim",hex:"#3a5a8a"}],                                        in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"7", name:"ECLIPSE SHORTS",   price:65,  description:"Relaxed-fit shorts in heavy twill. Side seam pockets.",         category:"bottoms",     images:[], sizes:["XS","S","M","L","XL"], colors:[{name:"Noir",hex:"#0a0a0a"},{name:"Sable",hex:"#c4a882"}],             in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
  { id:"8", name:"ALTITUDE L/S TEE", price:58,  description:"Boxy long-sleeve tee in organic cotton.",                       category:"tops",        images:[], sizes:["S","M","L","XL"],      colors:DC,                                                                    in_stock:true,  featured:true,  collectionId:"products", created:"2025-01-01" },
];

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  { id:"h1", image:"", title:"Collection 2025", subtitle:"L'amour du dépassement",      cta_label:"DÉCOUVRIR", cta_url:"/shop",              order:1, active:true, collectionId:"hero_slides" },
  { id:"h2", image:"", title:"UPCYCLING",       subtitle:"Pièces uniques & handcrafted", cta_label:"EXPLORER",  cta_url:"/shop?cat=upcycling", order:2, active:true, collectionId:"hero_slides" },
  { id:"h3", image:"", title:"NOUVEAUTÉS",      subtitle:"Drops exclusifs cette saison", cta_label:"SHOP NOW",  cta_url:"/shop",              order:3, active:true, collectionId:"hero_slides" },
];
