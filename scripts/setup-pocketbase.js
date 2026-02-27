#!/usr/bin/env node
/**
 * Script pour initialiser PocketBase pour TRÄNCËNÐ Store
 * Usage: node scripts/setup-pocketbase.js
 * 
 * Variables d'env:
 *   POCKETBASE_URL     (défaut: http://127.0.0.1:8090)
 *   PB_ADMIN_EMAIL     (défaut: admin@trancend.com)
 *   PB_ADMIN_PASSWORD  (défaut: adminpassword123)
 */

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@trancend.com";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "adminpassword123";

async function auth() {
  const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) { console.error("❌ Auth admin échouée"); process.exit(1); }
  const { token } = await res.json();
  console.log("✅ Admin authentifié");
  return token;
}

async function createCollection(token, schema) {
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Admin ${token}` },
    body: JSON.stringify(schema),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.data?.name?.code === "validation_not_unique") {
      console.log(`ℹ️  Collection '${schema.name}' existe déjà`);
    } else {
      console.error(`❌ Erreur création '${schema.name}':`, JSON.stringify(data));
    }
  } else {
    console.log(`✅ Collection '${schema.name}' créée`);
  }
  return data;
}

async function seed(token, collection, records) {
  for (const r of records) {
    const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Admin ${token}` },
      body: JSON.stringify(r),
    });
    if (res.ok) console.log(`  ✅ ${r.name || r.slug || r.email}`);
    else console.log(`  ⚠️  Échec: ${r.name || r.slug}`);
  }
}

async function main() {
  const token = await auth();
  const headers = { "Content-Type": "application/json", Authorization: `Admin ${token}` };

  // ── CATEGORIES ──────────────────────────────────────────────
  await createCollection(token, {
    name: "categories",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: [
      { name: "name",        type: "text",   required: true },
      { name: "slug",        type: "text",   required: true },
      { name: "description", type: "text" },
      { name: "image",       type: "file",   options: { maxSelect: 1, mimeTypes: ["image/jpeg","image/png","image/webp"] } },
      { name: "order",       type: "number", options: { min: 0 } },
      { name: "active",      type: "bool",   options: { default: true } },
    ],
  });

  await seed(token, "categories", [
    { name: "TOPS",        slug: "tops",        description: "T-shirts, hoodies, sweats", order: 1, active: true },
    { name: "BOTTOMS",     slug: "bottoms",     description: "Pantalons, shorts, cargos", order: 2, active: true },
    { name: "SETS",        slug: "sets",        description: "Ensembles & robes",         order: 3, active: true },
    { name: "ACCESSORIES", slug: "accessories", description: "Casquettes, sacs, bijoux",  order: 4, active: true },
    { name: "UPCYCLING",   slug: "upcycling",   description: "Pièces uniques & rework",   order: 5, active: true },
  ]);

  // ── PRODUCTS ────────────────────────────────────────────────
  await createCollection(token, {
    name: "products",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: [
      { name: "name",        type: "text",   required: true },
      { name: "price",       type: "number", required: true },
      { name: "description", type: "text" },
      { name: "category",    type: "text" },
      { name: "images",      type: "file",   options: { maxSelect: 10, mimeTypes: ["image/jpeg","image/png","image/webp"] } },
      { name: "sizes",       type: "json" },
      { name: "colors",      type: "json" },
      { name: "in_stock",    type: "bool",   options: { default: true } },
      { name: "featured",    type: "bool",   options: { default: false } },
    ],
  });

  await seed(token, "products", [
    { name: "VOID TEE",           price: 45,  description: "Premium heavyweight cotton tee. Drop shoulders, pre-washed.", category: "tops",        sizes: JSON.stringify(["XS","S","M","L","XL"]), colors: JSON.stringify([{name:"Noir",hex:"#0a0a0a"},{name:"Blanc cassé",hex:"#f5f4f0"},{name:"Kaki",hex:"#4a4a35"}]), in_stock: true, featured: true },
    { name: "OBLIVION HOODIE",    price: 89,  description: "Oversized French terry hoodie. Kangaroo pocket, 400gsm.",    category: "tops",        sizes: JSON.stringify(["S","M","L","XL"]),      colors: JSON.stringify([{name:"Noir",hex:"#0a0a0a"},{name:"Gris",hex:"#888"}]), in_stock: true, featured: true },
    { name: "ABYSS CARGO PANT",   price: 110, description: "Wide-leg cargo, zip pockets. Relaxed fit.",                  category: "bottoms",     sizes: JSON.stringify(["XS","S","M","L"]),      in_stock: true, featured: true },
    { name: "ASCEND SET",         price: 145, description: "Matching tee + shorts co-ord in structured cotton.",         category: "sets",        sizes: JSON.stringify(["XS","S","M","L","XL"]), in_stock: true, featured: false },
    { name: "TRANSCEND CAP",      price: 35,  description: "6-panel structured cap. Embroidered logo.",                  category: "accessories", sizes: JSON.stringify(["ONE SIZE"]),            in_stock: true, featured: true },
    { name: "REWORK JACKET",      price: 195, description: "One-of-a-kind upcycled denim jacket. Hand-customized.",      category: "upcycling",   sizes: JSON.stringify(["S","M","L"]),           in_stock: true, featured: true },
    { name: "ECLIPSE SHORTS",     price: 65,  description: "Relaxed-fit shorts in heavy twill. Side seam pockets.",      category: "bottoms",     sizes: JSON.stringify(["XS","S","M","L","XL"]), in_stock: true, featured: true },
    { name: "ALTITUDE L/S TEE",   price: 58,  description: "Boxy long-sleeve tee in organic cotton.",                    category: "tops",        sizes: JSON.stringify(["S","M","L","XL"]),      in_stock: true, featured: true },
  ]);

  // ── HERO SLIDES ──────────────────────────────────────────────
  await createCollection(token, {
    name: "hero_slides",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: [
      { name: "image",     type: "file",   required: true, options: { maxSelect: 1, mimeTypes: ["image/jpeg","image/png","image/webp"] } },
      { name: "title",     type: "text" },
      { name: "subtitle",  type: "text" },
      { name: "cta_label", type: "text" },
      { name: "cta_url",   type: "text" },
      { name: "order",     type: "number", options: { min: 0 } },
      { name: "active",    type: "bool",   options: { default: true } },
    ],
  });

  console.log("ℹ️  hero_slides: Ajoutez 3 slides manuellement via l'admin PocketBase (/_/)");
  console.log("    → Champs: image (fichier), title, subtitle, cta_label, cta_url, order, active");

    // ── CARTS ────────────────────────────────────────────────────
  await createCollection(token, {
    name: "carts",
    type: "base",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    schema: [
      { name: "user",  type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "items", type: "json" },
    ],
  });

  // ── ORDERS ────────────────────────────────────────────────────
  await createCollection(token, {
    name: "orders",
    type: "base",
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    schema: [
      { name: "user",             type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "items",            type: "json" },
      { name: "total",            type: "number" },
      { name: "status",           type: "select", options: { maxSelect: 1, values: ["pending","confirmed","shipped","delivered","cancelled"] } },
      { name: "shipping_address", type: "text" },
    ],
  });

  console.log("\n🎉 Setup terminé! Collections créées: hero_slides, categories, products, carts, orders");
  console.log("👉 Lancez: npm run dev → http://localhost:3000");
}

main().catch(console.error);
