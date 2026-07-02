import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5433/velora_db" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const categories = [
  { name: "Mujeres", slug: "mujeres", order: 1 },
  { name: "Hombres", slug: "hombres", order: 2 },
  { name: "Niños", slug: "ninos", order: 3 },
  { name: "Calzado", slug: "calzado", order: 4 },
  { name: "Accesorios", slug: "accesorios", order: 5 },
  { name: "Hogar", slug: "hogar", order: 6 },
];

const subcategories: Record<string, { name: string; slug: string }[]> = {
  mujeres: [
    { name: "Vestidos", slug: "vestidos" },
    { name: "Blusas", slug: "blusas" },
    { name: "Pantalones", slug: "pantalones" },
    { name: "Faldas", slug: "faldas" },
    { name: "Abrigos", slug: "abrigos" },
    { name: "Deportivo", slug: "deportivo" },
    { name: "Lencería", slug: "lenceria" },
    { name: "Trajes de Baño", slug: "trajes-bano" },
  ],
  hombres: [
    { name: "Camisas", slug: "camisas" },
    { name: "Camisetas", slug: "camisetas" },
    { name: "Pantalones", slug: "pantalones-h" },
    { name: "Jeans", slug: "jeans" },
    { name: "Trajes", slug: "trajes" },
    { name: "Deportivo", slug: "deportivo-h" },
    { name: "Abrigos", slug: "abrigos-h" },
  ],
  ninos: [
    { name: "Niñas", slug: "ninas" },
    { name: "Niños", slug: "ninos-sub" },
    { name: "Bebés", slug: "bebes" },
    { name: "Uniformes", slug: "uniformes" },
  ],
  calzado: [
    { name: "Tenis", slug: "tenis" },
    { name: "Tacones", slug: "tacones" },
    { name: "Botines", slug: "botines" },
    { name: "Sandalias", slug: "sandalias" },
    { name: "Zapatos Formales", slug: "formales" },
    { name: "Botas", slug: "botas" },
  ],
  accesorios: [
    { name: "Bolsas", slug: "bolsas" },
    { name: "Relojes", slug: "relojes" },
    { name: "Joyería", slug: "joyeria" },
    { name: "Cinturones", slug: "cinturones" },
    { name: "Gorras", slug: "gorras" },
    { name: "Gafas", slug: "gafas" },
  ],
  hogar: [
    { name: "Sala", slug: "sala" },
    { name: "Recámara", slug: "recamara" },
    { name: "Cocina", slug: "cocina" },
    { name: "Baño", slug: "bano" },
    { name: "Decoración", slug: "decoracion" },
    { name: "Organización", slug: "organizacion" },
  ],
};

const brands = [
  "VELORA Studio",
  "Moderna",
  "Urban Style",
  "Chic Boutique",
  "Active Wear",
  "Casa Collection",
  "Premium Line",
  "Trend Setter",
  "Elegance",
  "Street Fashion",
];

// Product templates per category
const productTemplates = {
  mujeres: [
    { name: "Vestido Floral de Verano", subcat: "vestidos", price: 599, compare: 899, colors: ["Rosa", "Blanco", "Azul"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["vestido", "verano", "floral"] },
    { name: "Blusa Satinada Elegante", subcat: "blusas", price: 349, compare: 499, colors: ["Negro", "Champagne", "Burdeos"], sizes: ["XS", "S", "M", "L"], tags: ["blusa", "elegante"] },
    { name: "Vestido Midi de Encaje", subcat: "vestidos", price: 799, compare: 1199, colors: ["Negro", "Blanco"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["vestido", "encaje", "especial"] },
    { name: "Pantalón Wide Leg Beige", subcat: "pantalones", price: 449, compare: 649, colors: ["Beige", "Negro", "Blanco"], sizes: ["24", "26", "28", "30", "32"], tags: ["pantalon", "wide leg"] },
    { name: "Falda Plisada Midi", subcat: "faldas", price: 399, compare: 599, colors: ["Rosado", "Verde Olivo", "Camel"], sizes: ["XS", "S", "M", "L"], tags: ["falda", "midi"] },
    { name: "Abrigo de Lana Premium", subcat: "abrigos", price: 1299, compare: 1899, colors: ["Camel", "Negro", "Gris"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["abrigo", "lana", "premium"] },
    { name: "Set Deportivo Femenino", subcat: "deportivo", price: 549, compare: 799, colors: ["Negro", "Morado", "Verde Menta"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["deportivo", "gym"] },
    { name: "Vestido Cóctel Negro", subcat: "vestidos", price: 899, compare: 1299, colors: ["Negro"], sizes: ["XS", "S", "M", "L"], tags: ["vestido", "coctel", "noche"] },
    { name: "Blusa Bohemia de Lino", subcat: "blusas", price: 299, compare: 449, colors: ["Blanco", "Natural", "Azul"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["blusa", "lino", "casual"] },
    { name: "Jogger de Terciopelo", subcat: "pantalones", price: 379, compare: 549, colors: ["Burdeos", "Verde Bosque", "Negro"], sizes: ["XS", "S", "M", "L"], tags: ["jogger", "casual"] },
    { name: "Vestido Boho Maxi", subcat: "vestidos", price: 699, compare: 999, colors: ["Blanco", "Naranja", "Azul Índigo"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["vestido", "boho", "maxi"] },
    { name: "Chaqueta Denim Classic", subcat: "abrigos", price: 649, compare: 949, colors: ["Azul Claro", "Azul Oscuro"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["denim", "casual", "chaqueta"] },
    { name: "Falda Mini de Tweed", subcat: "faldas", price: 499, compare: 749, colors: ["Negro", "Beige", "Rojo"], sizes: ["XS", "S", "M", "L"], tags: ["falda", "mini", "tweed"] },
    { name: "Top Crop de Encaje", subcat: "blusas", price: 249, compare: 399, colors: ["Negro", "Blanco", "Rosa"], sizes: ["XS", "S", "M", "L"], tags: ["top", "encaje"] },
    { name: "Legging Premium Push Up", subcat: "deportivo", price: 329, compare: 499, colors: ["Negro", "Azul Marino", "Gris"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["legging", "gym", "deportivo"] },
    { name: "Traje de Baño Bikini", subcat: "trajes-bano", price: 449, compare: 699, colors: ["Coral", "Negro", "Turquesa"], sizes: ["XS", "S", "M", "L"], tags: ["bikini", "playa", "verano"] },
    { name: "Vestido Floreado Wrap", subcat: "vestidos", price: 649, compare: 949, colors: ["Amarillo", "Verde", "Rosa"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["vestido", "wrap", "flores"] },
    { name: "Camisa de Rayas Oxford", subcat: "blusas", price: 379, compare: 549, colors: ["Azul", "Rosa", "Blanco"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["camisa", "stripes", "casual"] },
    { name: "Pantalón Cuero Ecológico", subcat: "pantalones", price: 799, compare: 1199, colors: ["Negro", "Marrón"], sizes: ["24", "26", "28", "30"], tags: ["cuero", "moderno"] },
    { name: "Conjunto Lencero de Seda", subcat: "lenceria", price: 549, compare: 799, colors: ["Negro", "Rosa", "Champagne"], sizes: ["XS", "S", "M", "L"], tags: ["lenceria", "seda"] },
    { name: "Hoodie Oversize Comfort", subcat: "deportivo", price: 399, compare: 599, colors: ["Gris", "Negro", "Beige"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["hoodie", "casual", "oversize"] },
    { name: "Vestido Asimétrico Formal", subcat: "vestidos", price: 1099, compare: 1599, colors: ["Negro", "Navy"], sizes: ["XS", "S", "M", "L"], tags: ["formal", "asimetrico"] },
    { name: "Chaleco de Punto", subcat: "abrigos", price: 449, compare: 699, colors: ["Camel", "Blanco Roto", "Gris"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["chaleco", "punto", "crochet"] },
    { name: "Short de Mezclilla", subcat: "pantalones", price: 299, compare: 449, colors: ["Azul", "Negro", "Blanco"], sizes: ["24", "26", "28", "30", "32"], tags: ["short", "denim", "casual"] },
    { name: "Camiseta Estampada Artística", subcat: "blusas", price: 199, compare: 299, colors: ["Blanco", "Negro", "Gris"], sizes: ["XS", "S", "M", "L", "XL"], tags: ["camiseta", "estampada", "arte"] },
  ],
  hombres: [
    { name: "Camisa Oxford Slim Fit", subcat: "camisas", price: 499, compare: 749, colors: ["Blanco", "Azul Cielo", "Negro"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["camisa", "slim", "formal"] },
    { name: "Jeans Slim Dark Wash", subcat: "jeans", price: 649, compare: 999, colors: ["Azul Oscuro", "Negro"], sizes: ["28", "30", "32", "34", "36"], tags: ["jeans", "slim", "denim"] },
    { name: "Traje de Lana Premium", subcat: "trajes", price: 2999, compare: 4499, colors: ["Gris Antracita", "Negro", "Azul Marino"], sizes: ["S", "M", "L", "XL"], tags: ["traje", "formal", "premium"] },
    { name: "Polo de Algodón Pima", subcat: "camisetas", price: 349, compare: 499, colors: ["Blanco", "Navy", "Verde"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["polo", "casual", "verano"] },
    { name: "Pantalón Chino Slim", subcat: "pantalones-h", price: 549, compare: 799, colors: ["Beige", "Gris", "Verde Olivo"], sizes: ["28", "30", "32", "34", "36"], tags: ["chino", "slim", "casual"] },
    { name: "Chamarra de Cuero Genuino", subcat: "abrigos-h", price: 2499, compare: 3499, colors: ["Negro", "Marrón"], sizes: ["S", "M", "L", "XL"], tags: ["cuero", "chamarra", "premium"] },
    { name: "Hoodie Técnico Active", subcat: "deportivo-h", price: 549, compare: 799, colors: ["Negro", "Gris", "Azul"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["hoodie", "deportivo", "active"] },
    { name: "Camisa Lino Verano", subcat: "camisas", price: 399, compare: 599, colors: ["Blanco", "Azul Cielo", "Beige"], sizes: ["S", "M", "L", "XL"], tags: ["lino", "verano", "casual"] },
    { name: "Jogger Cargo Streetwear", subcat: "pantalones-h", price: 449, compare: 649, colors: ["Negro", "Kaki", "Gris"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["cargo", "street", "jogger"] },
    { name: "Sweater de Merino", subcat: "abrigos-h", price: 799, compare: 1199, colors: ["Camel", "Gris", "Navy"], sizes: ["S", "M", "L", "XL"], tags: ["sweater", "merino", "premium"] },
    { name: "Camiseta Gráfica Oversize", subcat: "camisetas", price: 249, compare: 349, colors: ["Blanco", "Negro", "Gris"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["camiseta", "grafica", "oversize"] },
    { name: "Blazer Casual Sport", subcat: "trajes", price: 999, compare: 1499, colors: ["Azul Marino", "Gris", "Negro"], sizes: ["S", "M", "L", "XL"], tags: ["blazer", "casual", "sport"] },
    { name: "Short de Baño Tropical", subcat: "deportivo-h", price: 299, compare: 449, colors: ["Azul", "Negro", "Estampado"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["baño", "playa", "verano"] },
    { name: "Pantalón de Vestir Classic", subcat: "pantalones-h", price: 599, compare: 899, colors: ["Gris", "Negro", "Marino"], sizes: ["28", "30", "32", "34", "36"], tags: ["vestir", "formal", "clasico"] },
    { name: "Camisa Cuadros Franela", subcat: "camisas", price: 449, compare: 649, colors: ["Rojo/Negro", "Azul/Negro", "Verde/Negro"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["franela", "cuadros", "casual"] },
    { name: "Abrigo Trench Moderno", subcat: "abrigos-h", price: 1299, compare: 1899, colors: ["Beige", "Negro"], sizes: ["S", "M", "L", "XL"], tags: ["trench", "abrigo", "elegante"] },
    { name: "Mallas Compresión Run", subcat: "deportivo-h", price: 349, compare: 499, colors: ["Negro", "Azul"], sizes: ["S", "M", "L", "XL"], tags: ["mallas", "running", "compresion"] },
    { name: "Chaleco Puffer Ligero", subcat: "abrigos-h", price: 699, compare: 999, colors: ["Negro", "Azul Navy", "Gris"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["chaleco", "puffer", "invierno"] },
    { name: "Jeans Relaxed Vintage", subcat: "jeans", price: 599, compare: 899, colors: ["Azul Claro", "Azul Medio"], sizes: ["28", "30", "32", "34", "36", "38"], tags: ["jeans", "vintage", "relaxed"] },
    { name: "Camisa Manga Corta Resort", subcat: "camisas", price: 349, compare: 499, colors: ["Estampado Floral", "Blanco", "Azul"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["resort", "verano", "vacaciones"] },
    { name: "Sudadera Deportiva Tech", subcat: "deportivo-h", price: 499, compare: 749, colors: ["Gris", "Negro", "Azul"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["sudadera", "deportiva", "tech"] },
    { name: "Polo Premium Piqué", subcat: "camisetas", price: 449, compare: 649, colors: ["Blanco", "Negro", "Rojo", "Verde"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["polo", "pique", "clasico"] },
    { name: "Pantalón Cargo Tech", subcat: "pantalones-h", price: 549, compare: 799, colors: ["Negro", "Verde Olivo", "Gris"], sizes: ["28", "30", "32", "34", "36"], tags: ["cargo", "utilitario", "moderno"] },
    { name: "Bermuda Chino", subcat: "pantalones-h", price: 349, compare: 499, colors: ["Beige", "Azul", "Verde"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["bermuda", "casual", "chino"] },
    { name: "Camisa Social Rayas", subcat: "camisas", price: 549, compare: 799, colors: ["Blanco/Azul", "Blanco/Rosa", "Blanco/Gris"], sizes: ["S", "M", "L", "XL", "XXL"], tags: ["social", "rayas", "elegante"] },
  ],
  ninos: [
    { name: "Vestido de Niña con Volantes", subcat: "ninas", price: 249, compare: 399, colors: ["Rosa", "Blanco", "Lila"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["niña", "vestido", "sweet"] },
    { name: "Set Escolar Niño 3 Piezas", subcat: "ninos-sub", price: 299, compare: 449, colors: ["Azul", "Gris"], sizes: ["4T", "5T", "6T", "7T", "8T"], tags: ["escolar", "niño", "uniforme"] },
    { name: "Pijama Dinosaurios", subcat: "ninos-sub", price: 199, compare: 299, colors: ["Azul", "Verde"], sizes: ["2T", "3T", "4T", "5T", "6T", "7T", "8T"], tags: ["pijama", "dino", "comodo"] },
    { name: "Falda Tutu de Princesa", subcat: "ninas", price: 179, compare: 299, colors: ["Rosa", "Morado", "Azul"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["tutu", "princesa", "niña"] },
    { name: "Conjunto Deportivo Kids", subcat: "ninos-sub", price: 249, compare: 349, colors: ["Negro", "Azul", "Rojo"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T"], tags: ["deportivo", "kids", "activo"] },
    { name: "Body Bebé Algodón 3-Pack", subcat: "bebes", price: 199, compare: 299, colors: ["Blanco", "Mixto Pastel"], sizes: ["0-3m", "3-6m", "6-9m", "9-12m"], tags: ["bebe", "body", "algodon"] },
    { name: "Hoodie Unicornio Niña", subcat: "ninas", price: 299, compare: 449, colors: ["Rosa", "Morado"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T"], tags: ["unicornio", "hoodie", "niña"] },
    { name: "Bermuda Cargo Junior", subcat: "ninos-sub", price: 199, compare: 299, colors: ["Kaki", "Negro", "Azul"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T", "12T"], tags: ["cargo", "junior", "casual"] },
    { name: "Vestido Fiesta Bordado", subcat: "ninas", price: 449, compare: 699, colors: ["Rosa Gold", "Blanco Perla"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["fiesta", "bordado", "especial"] },
    { name: "Mameluco Bebé Estampado", subcat: "bebes", price: 149, compare: 229, colors: ["Celeste", "Rosa", "Amarillo"], sizes: ["0-3m", "3-6m", "6-9m", "9-12m", "12-18m"], tags: ["mameluco", "bebe", "cute"] },
    { name: "Pantalón Jogger Gamer", subcat: "ninos-sub", price: 249, compare: 349, colors: ["Gris", "Negro"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T", "12T"], tags: ["gamer", "jogger", "cool"] },
    { name: "Camisa Social Kids", subcat: "ninos-sub", price: 179, compare: 269, colors: ["Blanco", "Azul Cielo"], sizes: ["4T", "5T", "6T", "7T", "8T"], tags: ["social", "formal", "kids"] },
    { name: "Tutú Ballet Niña", subcat: "ninas", price: 149, compare: 229, colors: ["Rosa", "Blanco", "Negro"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["ballet", "tut", "danza"] },
    { name: "Sudadera School Spirit", subcat: "ninos-sub", price: 219, compare: 319, colors: ["Azul Navy", "Gris", "Rojo"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T", "12T"], tags: ["school", "sudadera", "cool"] },
    { name: "Conjunto Bebé 5 Piezas", subcat: "bebes", price: 349, compare: 499, colors: ["Rosa", "Azul"], sizes: ["0-3m", "3-6m", "6-9m"], tags: ["bebe", "conjunto", "regalo"] },
    { name: "Vestido Casual Summer", subcat: "ninas", price: 199, compare: 299, colors: ["Turquesa", "Amarillo", "Coral"], sizes: ["2T", "3T", "4T", "5T", "6T", "7T", "8T"], tags: ["verano", "casual", "niña"] },
    { name: "Jeans Slim Junior", subcat: "ninos-sub", price: 249, compare: 369, colors: ["Azul", "Negro"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T", "12T"], tags: ["jeans", "junior", "slim"] },
    { name: "Sweater Animal Print Niña", subcat: "ninas", price: 229, compare: 349, colors: ["Rosa", "Morado"], sizes: ["4T", "5T", "6T", "7T", "8T"], tags: ["animal print", "sweater", "niña"] },
    { name: "Short Deportivo Kids", subcat: "ninos-sub", price: 149, compare: 229, colors: ["Negro", "Azul", "Gris"], sizes: ["4T", "5T", "6T", "7T", "8T", "10T"], tags: ["deportivo", "short", "kids"] },
    { name: "Conjunto Pijama Espacio", subcat: "ninos-sub", price: 199, compare: 299, colors: ["Azul Marino"], sizes: ["2T", "3T", "4T", "5T", "6T", "7T", "8T"], tags: ["pijama", "espacio", "noche"] },
    { name: "Bolero Crochet Niña", subcat: "ninas", price: 179, compare: 269, colors: ["Blanco", "Crema", "Rosa"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["bolero", "crochet", "niña"] },
    { name: "Pantalón Cargo Junior", subcat: "ninos-sub", price: 249, compare: 349, colors: ["Verde", "Negro", "Gris"], sizes: ["6T", "7T", "8T", "10T", "12T", "14T"], tags: ["cargo", "junior", "utilitario"] },
    { name: "Vestido Invierno Pana", subcat: "ninas", price: 269, compare: 399, colors: ["Burdeos", "Verde Bosque", "Mostaza"], sizes: ["2T", "3T", "4T", "5T", "6T"], tags: ["pana", "invierno", "abrigador"] },
    { name: "Calcetines Divertidos 5-Pack", subcat: "ninos-sub", price: 99, compare: 149, colors: ["Mixto"], sizes: ["0-2 años", "2-5 años", "5-8 años", "8-12 años"], tags: ["calcetines", "fun", "pack"] },
    { name: "Sombrero de Paja Niñas", subcat: "ninas", price: 119, compare: 179, colors: ["Natural", "Rosa", "Blanco"], sizes: ["Talla Única"], tags: ["sombrero", "playa", "verano"] },
  ],
  calzado: [
    { name: "Tenis Air Classic Mujer", subcat: "tenis", price: 899, compare: 1299, colors: ["Blanco", "Negro", "Rosa"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["tenis", "mujer", "casual"] },
    { name: "Tacón Stiletto 12cm", subcat: "tacones", price: 799, compare: 1199, colors: ["Negro", "Nude", "Rojo"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["tacon", "stiletto", "elegante"] },
    { name: "Botín Chelsea Hombre", subcat: "botines", price: 1099, compare: 1599, colors: ["Negro", "Marrón"], sizes: ["38", "39", "40", "41", "42", "43", "44", "45"], tags: ["chelsea", "bota", "hombre"] },
    { name: "Sandalia Plataforma", subcat: "sandalias", price: 549, compare: 799, colors: ["Blanco", "Negro", "Camel"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["sandalia", "plataforma", "verano"] },
    { name: "Zapato Oxford Hombre", subcat: "formales", price: 1299, compare: 1899, colors: ["Negro", "Marrón Café"], sizes: ["38", "39", "40", "41", "42", "43", "44"], tags: ["oxford", "formal", "hombre"] },
    { name: "Bota Vaquera Cuero", subcat: "botas", price: 1599, compare: 2299, colors: ["Marrón", "Negro", "Beige"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42"], tags: ["bota", "vaquera", "cuero"] },
    { name: "Sneaker Platform Mujer", subcat: "tenis", price: 799, compare: 1199, colors: ["Blanco", "Negro"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["sneaker", "plataforma", "trendy"] },
    { name: "Mocasín de Cuero", subcat: "formales", price: 899, compare: 1299, colors: ["Negro", "Marrón", "Burdeos"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43"], tags: ["mocasin", "clasico", "cuero"] },
    { name: "Tenis Running Pro", subcat: "tenis", price: 1199, compare: 1799, colors: ["Negro/Gris", "Azul/Blanco", "Rojo/Blanco"], sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"], tags: ["running", "pro", "deportivo"] },
    { name: "Sandalia de Piel Trenzada", subcat: "sandalias", price: 649, compare: 949, colors: ["Camel", "Negro", "Blanco"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["sandalia", "piel", "boho"] },
    { name: "Botín Ante Mujer", subcat: "botines", price: 999, compare: 1499, colors: ["Camel", "Negro", "Gris"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["bota", "ante", "otoño"] },
    { name: "Zapato Cómodo Suela Goma", subcat: "formales", price: 699, compare: 999, colors: ["Blanco", "Beige", "Negro"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42"], tags: ["comodo", "everyday", "casual"] },
    { name: "Bota Militar Hombre", subcat: "botas", price: 1299, compare: 1899, colors: ["Negro", "Kaki"], sizes: ["38", "39", "40", "41", "42", "43", "44", "45"], tags: ["militar", "bota", "fuerte"] },
    { name: "Tacón Block de Madera", subcat: "tacones", price: 649, compare: 999, colors: ["Marrón", "Negro", "Blanco"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["block", "madera", "comfort"] },
    { name: "Slip-On Casual Mujer", subcat: "tenis", price: 449, compare: 649, colors: ["Blanco", "Negro", "Rosado"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["slip-on", "casual", "comodo"] },
    { name: "Zapato Formal Bicolor", subcat: "formales", price: 1099, compare: 1599, colors: ["Negro/Blanco", "Marrón/Beige"], sizes: ["38", "39", "40", "41", "42", "43"], tags: ["formal", "bicolor", "elegante"] },
    { name: "Sandalia Flip Flop Premium", subcat: "sandalias", price: 249, compare: 399, colors: ["Negro", "Blanco", "Azul"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43"], tags: ["flip-flop", "playa", "verano"] },
    { name: "Bota Lluvia Waterproof", subcat: "botas", price: 799, compare: 1199, colors: ["Negro", "Rojo", "Verde"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42"], tags: ["lluvia", "impermeable", "resistente"] },
    { name: "Tenis Skate Hombre", subcat: "tenis", price: 699, compare: 999, colors: ["Negro", "Blanco"], sizes: ["38", "39", "40", "41", "42", "43", "44", "45"], tags: ["skate", "street", "hombre"] },
    { name: "Zapato Ballet Flat", subcat: "formales", price: 549, compare: 799, colors: ["Negro", "Nude", "Rosado"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["ballet", "flat", "elegante"] },
    { name: "Botín Cowboy Mujer", subcat: "botines", price: 1199, compare: 1799, colors: ["Marrón", "Beige", "Negro"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["cowboy", "western", "mujer"] },
    { name: "Sneaker Chunky Gen Z", subcat: "tenis", price: 849, compare: 1299, colors: ["Blanco", "Negro", "Colorido"], sizes: ["35", "36", "37", "38", "39", "40", "41", "42", "43"], tags: ["chunky", "trendy", "dadshoe"] },
    { name: "Sandalia Gladiadora", subcat: "sandalias", price: 499, compare: 749, colors: ["Camel", "Negro", "Blanco"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["gladiadora", "verano", "romano"] },
    { name: "Zapato Destalonado Mule", subcat: "tacones", price: 599, compare: 899, colors: ["Negro", "Marrón", "Beige"], sizes: ["35", "36", "37", "38", "39", "40"], tags: ["mule", "destalonado", "casual"] },
    { name: "Bota Equitación Premium", subcat: "botas", price: 2499, compare: 3499, colors: ["Marrón Oscuro", "Negro"], sizes: ["35", "36", "37", "38", "39", "40", "41"], tags: ["equitacion", "premium", "clasico"] },
  ],
  accesorios: [
    { name: "Bolsa Tote de Cuero", subcat: "bolsas", price: 899, compare: 1299, colors: ["Negro", "Camel", "Blanco"], sizes: ["Talla Única"], tags: ["tote", "cuero", "casual"] },
    { name: "Reloj Minimalista Dorado", subcat: "relojes", price: 1499, compare: 2199, colors: ["Dorado", "Plateado"], sizes: ["Talla Única"], tags: ["reloj", "minimalista", "elegante"] },
    { name: "Aretes Perla Natural", subcat: "joyeria", price: 349, compare: 499, colors: ["Blanco Perla", "Negro Perla"], sizes: ["Talla Única"], tags: ["aretes", "perla", "clasico"] },
    { name: "Cinturón de Cuero Trenzado", subcat: "cinturones", price: 299, compare: 449, colors: ["Negro", "Marrón"], sizes: ["S", "M", "L", "XL"], tags: ["cinturon", "cuero", "casual"] },
    { name: "Bolso Crossbody Mini", subcat: "bolsas", price: 649, compare: 999, colors: ["Negro", "Beige", "Rojo"], sizes: ["Talla Única"], tags: ["crossbody", "mini", "diario"] },
    { name: "Collar Cadena Gold Fill", subcat: "joyeria", price: 449, compare: 699, colors: ["Dorado", "Plateado"], sizes: ["Talla Única"], tags: ["collar", "cadena", "gold"] },
    { name: "Gorra Beisbolera Snapback", subcat: "gorras", price: 249, compare: 349, colors: ["Negro", "Blanco", "Rojo", "Azul"], sizes: ["Talla Única"], tags: ["gorra", "beisbol", "snapback"] },
    { name: "Gafas Sol Polarizadas", subcat: "gafas", price: 599, compare: 899, colors: ["Negro/Negro", "Carey/Verde"], sizes: ["Talla Única"], tags: ["gafas", "sol", "polarizado"] },
    { name: "Mochila Multifuncional", subcat: "bolsas", price: 799, compare: 1199, colors: ["Negro", "Gris", "Azul"], sizes: ["Talla Única"], tags: ["mochila", "bolsa", "trabajo"] },
    { name: "Reloj Smart Sport", subcat: "relojes", price: 2499, compare: 3499, colors: ["Negro", "Azul", "Rojo"], sizes: ["Talla Única"], tags: ["smartwatch", "deporte", "tech"] },
    { name: "Pulsera Bangle Set 5pz", subcat: "joyeria", price: 299, compare: 499, colors: ["Dorado", "Plateado", "Rosegold"], sizes: ["Talla Única"], tags: ["pulsera", "bangle", "set"] },
    { name: "Cartera de Cuero Bifold", subcat: "bolsas", price: 449, compare: 699, colors: ["Negro", "Marrón", "Azul"], sizes: ["Talla Única"], tags: ["cartera", "bifold", "hombre"] },
    { name: "Sombrero Fedora Panamá", subcat: "gorras", price: 499, compare: 749, colors: ["Natural", "Negro", "Azul"], sizes: ["S/M", "L/XL"], tags: ["fedora", "panama", "verano"] },
    { name: "Gafas Redondas Retro", subcat: "gafas", price: 399, compare: 599, colors: ["Negro", "Dorado", "Carey"], sizes: ["Talla Única"], tags: ["retro", "redondas", "vintage"] },
    { name: "Bolso Shopper Canvas", subcat: "bolsas", price: 349, compare: 499, colors: ["Beige/Negro", "Blanco/Azul"], sizes: ["Talla Única"], tags: ["shopper", "canvas", "eco"] },
    { name: "Anillo de Plata 925", subcat: "joyeria", price: 299, compare: 449, colors: ["Plateado"], sizes: ["5", "6", "7", "8", "9"], tags: ["anillo", "plata", "minimalista"] },
    { name: "Cinturón Traje Formal", subcat: "cinturones", price: 399, compare: 599, colors: ["Negro", "Marrón Oscuro"], sizes: ["28", "30", "32", "34", "36", "38", "40"], tags: ["formal", "cuero", "clasico"] },
    { name: "Reloj Cronógrafo Hombre", subcat: "relojes", price: 1999, compare: 2999, colors: ["Plateado/Negro", "Dorado/Café"], sizes: ["Talla Única"], tags: ["cronografo", "hombre", "sport"] },
    { name: "Bolsa Bucket de Ante", subcat: "bolsas", price: 749, compare: 1099, colors: ["Camel", "Negro", "Burdeos"], sizes: ["Talla Única"], tags: ["bucket", "ante", "boho"] },
    { name: "Gorra Trucker Mesh", subcat: "gorras", price: 199, compare: 299, colors: ["Negro", "Blanco", "Gris"], sizes: ["Talla Única"], tags: ["trucker", "mesh", "casual"] },
    { name: "Pendientes Colgantes Crystal", subcat: "joyeria", price: 199, compare: 299, colors: ["Crystal", "Smoke", "Rose"], sizes: ["Talla Única"], tags: ["pendientes", "cristal", "brillantes"] },
    { name: "Gafas Aviador Clásicas", subcat: "gafas", price: 449, compare: 699, colors: ["Dorado/Verde", "Plateado/Azul"], sizes: ["Talla Única"], tags: ["aviador", "clasico", "sol"] },
    { name: "Bolso Clutch para Noche", subcat: "bolsas", price: 399, compare: 599, colors: ["Dorado", "Negro", "Plateado"], sizes: ["Talla Única"], tags: ["clutch", "noche", "fiesta"] },
    { name: "Collar Choker Cadena", subcat: "joyeria", price: 179, compare: 269, colors: ["Dorado", "Plateado", "Negro"], sizes: ["Talla Única"], tags: ["choker", "cadena", "trendy"] },
    { name: "Mochila Vintage de Cuero", subcat: "bolsas", price: 1199, compare: 1799, colors: ["Marrón", "Negro"], sizes: ["Talla Única"], tags: ["mochila", "vintage", "cuero"] },
  ],
  hogar: [
    { name: "Juego de Sábanas 400 Hilos", subcat: "recamara", price: 799, compare: 1199, colors: ["Blanco", "Gris", "Beige"], sizes: ["Individual", "Matrimonial", "Queen", "King"], tags: ["sabanas", "algodon", "premium"] },
    { name: "Lámpara de Piso Minimalista", subcat: "sala", price: 1299, compare: 1899, colors: ["Negro", "Dorado", "Blanco"], sizes: ["Talla Única"], tags: ["lampara", "piso", "minimalista"] },
    { name: "Set de Toallas Premium 4pz", subcat: "bano", price: 549, compare: 799, colors: ["Blanco", "Gris", "Azul Navy"], sizes: ["Talla Única"], tags: ["toallas", "algodon", "suave"] },
    { name: "Organizador Joyero con Espejo", subcat: "organizacion", price: 399, compare: 599, colors: ["Blanco", "Negro", "Rosa"], sizes: ["Talla Única"], tags: ["organizador", "joyero", "decoracion"] },
    { name: "Cojín Decorativo Terciopelo", subcat: "sala", price: 199, compare: 299, colors: ["Mostaza", "Verde Sage", "Terracota"], sizes: ["40x40cm", "45x45cm"], tags: ["cojin", "terciopelo", "decoracion"] },
    { name: "Set de Ollas Antiadherente 5pz", subcat: "cocina", price: 1599, compare: 2299, colors: ["Gris", "Rojo", "Negro"], sizes: ["Talla Única"], tags: ["ollas", "cocina", "premium"] },
    { name: "Marco de Fotos Gallery Wall", subcat: "decoracion", price: 349, compare: 499, colors: ["Negro", "Blanco", "Madera"], sizes: ["Set de 3", "Set de 6", "Set de 9"], tags: ["marcos", "galeria", "decoracion"] },
    { name: "Alfombra Boho Kilim", subcat: "sala", price: 1299, compare: 1899, colors: ["Multicolor", "Azul", "Tierra"], sizes: ["120x180cm", "150x210cm", "200x290cm"], tags: ["alfombra", "boho", "kilim"] },
    { name: "Velas Aromáticas Set 3pz", subcat: "decoracion", price: 299, compare: 449, colors: ["Blanco", "Gris", "Natural"], sizes: ["Talla Única"], tags: ["velas", "aromaticas", "relax"] },
    { name: "Dispensador Baño de Mármol", subcat: "bano", price: 249, compare: 369, colors: ["Blanco Mármol", "Negro Mármol"], sizes: ["Talla Única"], tags: ["dispensador", "marmol", "bano"] },
    { name: "Plantas Suculentas Set Decorativo", subcat: "decoracion", price: 349, compare: 499, colors: ["Verde"], sizes: ["Set de 3", "Set de 5"], tags: ["plantas", "suculentas", "decoracion"] },
    { name: "Set Cocina Utensilios 8pz", subcat: "cocina", price: 449, compare: 699, colors: ["Madera/Negro", "Bambú Natural"], sizes: ["Talla Única"], tags: ["utensilios", "cocina", "bambu"] },
    { name: "Espejo Redondo Antiguo", subcat: "decoracion", price: 699, compare: 1099, colors: ["Dorado", "Negro", "Cobre"], sizes: ["50cm", "70cm", "90cm"], tags: ["espejo", "decoracion", "retro"] },
    { name: "Cobija Sherpa Reversible", subcat: "recamara", price: 499, compare: 749, colors: ["Gris", "Beige", "Blanco"], sizes: ["Individual", "Matrimonial", "Queen"], tags: ["cobija", "sherpa", "calidez"] },
    { name: "Organizador Escritorio Bambú", subcat: "organizacion", price: 299, compare: 449, colors: ["Natural", "Negro"], sizes: ["Talla Única"], tags: ["organizador", "escritorio", "eco"] },
    { name: "Set Desayuno Cerámica", subcat: "cocina", price: 549, compare: 799, colors: ["Blanco", "Azul", "Verde Sage"], sizes: ["Set 2 personas", "Set 4 personas"], tags: ["ceramica", "desayuno", "artesanal"] },
    { name: "Cortina Blackout Premium", subcat: "recamara", price: 699, compare: 999, colors: ["Gris", "Negro", "Blanco"], sizes: ["140x230cm", "140x260cm", "200x230cm"], tags: ["cortina", "blackout", "oscuridad"] },
    { name: "Porta Plantas Macramé", subcat: "decoracion", price: 199, compare: 299, colors: ["Natural", "Blanco"], sizes: ["Talla Única"], tags: ["macrame", "bohemio", "plantas"] },
    { name: "Set Baño Accesorios 5pz", subcat: "bano", price: 449, compare: 699, colors: ["Dorado", "Plateado", "Matte Negro"], sizes: ["Talla Única"], tags: ["bano", "accesorios", "set"] },
    { name: "Tapete de Yoga Premium", subcat: "sala", price: 349, compare: 499, colors: ["Morado", "Azul", "Negro"], sizes: ["61x183cm"], tags: ["yoga", "tapete", "fitness"] },
    { name: "Reloj de Pared Nórdico", subcat: "decoracion", price: 399, compare: 599, colors: ["Madera Natural", "Blanco", "Negro"], sizes: ["30cm", "45cm", "60cm"], tags: ["reloj", "pared", "nordico"] },
    { name: "Almohada Viscoelástica", subcat: "recamara", price: 599, compare: 899, colors: ["Blanco"], sizes: ["Estándar", "Queen", "King"], tags: ["almohada", "viscoelastica", "premium"] },
    { name: "Jarras para Agua Set", subcat: "cocina", price: 249, compare: 369, colors: ["Transparente", "Gris"], sizes: ["1L", "1.5L"], tags: ["jarra", "agua", "vidrio"] },
    { name: "Cesta de Mimbre Storage", subcat: "organizacion", price: 299, compare: 449, colors: ["Natural", "Blanco"], sizes: ["S", "M", "L"], tags: ["cesta", "mimbre", "storage"] },
    { name: "Set Manteles Lino Premium", subcat: "cocina", price: 349, compare: 499, colors: ["Blanco", "Gris", "Beige"], sizes: ["Set 4 piezas", "Set 6 piezas"], tags: ["manteles", "lino", "mesa"] },
  ],
};

// Product image pools per category
const imageUrls = {
  mujeres: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1485518882345-15568b007407?w=600&q=80",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
    "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80",
  ],
  hombres: [
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    "https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=600&q=80",
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
  ],
  ninos: [
    "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
    "https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=600&q=80",
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80",
    "https://images.unsplash.com/photo-1518710843675-2540dd79065c?w=600&q=80",
  ],
  calzado: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80",
    "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&q=80",
    "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
  ],
  accesorios: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&q=80",
    "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfa?w=600&q=80",
    "https://images.unsplash.com/photo-1611923134239-b9be5816ba30?w=600&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  ],
  hogar: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
  ],
};

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin VELORA",
      email: "admin@velora.mx",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create brands
  const brandRecords = await Promise.all(
    brands.map((name) =>
      prisma.brand.create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
      })
    )
  );
  console.log(`✅ ${brandRecords.length} brands created`);

  // Create categories + subcategories
  const categoryMap: Record<string, { id: string; subs: Record<string, string> }> = {};

  for (const cat of categories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        order: cat.order,
        image: imageUrls[cat.slug as keyof typeof imageUrls]?.[0],
      },
    });

    const subMap: Record<string, string> = {};
    const subs = subcategories[cat.slug] || [];
    for (const sub of subs) {
      const createdSub = await prisma.subcategory.create({
        data: { name: sub.name, slug: sub.slug, categoryId: created.id },
      });
      subMap[sub.slug] = createdSub.id;
    }

    categoryMap[cat.slug] = { id: created.id, subs: subMap };
  }
  console.log("✅ Categories and subcategories created");

  // Create products
  let productCount = 0;
  const allCatKeys = Object.keys(productTemplates) as Array<keyof typeof productTemplates>;

  for (const catKey of allCatKeys) {
    const templates = productTemplates[catKey];
    const catData = categoryMap[catKey];
    if (!catData) continue;

    const imgPool = imageUrls[catKey as keyof typeof imageUrls] || [];

    for (let i = 0; i < templates.length; i++) {
      const t = templates[i];
      const brand = brandRecords[Math.floor(Math.random() * brandRecords.length)];
      const isNew = Math.random() > 0.6;
      const isFeatured = Math.random() > 0.7;
      const isBestSeller = Math.random() > 0.75;
      const rating = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
      const reviewCount = Math.floor(Math.random() * 300) + 5;
      const salesCount = Math.floor(Math.random() * 1000) + 10;
      const stock = Math.floor(Math.random() * 100) + 5;

      // Pick images from pool
      const images = [
        imgPool[i % imgPool.length],
        imgPool[(i + 1) % imgPool.length],
      ].filter(Boolean);

      const subcatSlug = t.subcat;
      const subcategoryId = catData.subs[subcatSlug] || undefined;

      await prisma.product.create({
        data: {
          name: t.name,
          slug: `${t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").trim()}-${catKey}-${i}`,
          description: `${t.name} de alta calidad. Perfecto para cualquier ocasión. Material premium, diseño contemporáneo y confort garantizado.`,
          features: [
            "Material de primera calidad",
            "Diseño contemporáneo",
            "Talla regular, modela perfectamente",
            "Fácil de combinar",
            "Lavable a máquina",
          ],
          categoryId: catData.id,
          subcategoryId,
          brandId: brand.id,
          price: t.price,
          comparePrice: t.compare,
          stock,
          images,
          colors: t.colors,
          sizes: t.sizes,
          tags: t.tags,
          isNew,
          isFeatured,
          isBestSeller,
          rating,
          reviewCount,
          salesCount,
        },
      });
      productCount++;
    }
  }
  console.log(`✅ ${productCount} products created`);

  // Coupons
  await prisma.coupon.createMany({
    data: [
      { code: "VELORA10", description: "10% de descuento en primera compra", type: "PERCENTAGE", value: 10, minPurchase: 500, usageLimit: 1000, expiresAt: new Date("2025-12-31") },
      { code: "VERANO20", description: "20% en colección verano", type: "PERCENTAGE", value: 20, minPurchase: 800, usageLimit: 500, expiresAt: new Date("2025-09-30") },
      { code: "ENVIOGRATIS", description: "Envío gratis en tu pedido", type: "FREE_SHIPPING", value: 0, minPurchase: 500 },
      { code: "FLASH50", description: "50% en ofertas del día", type: "PERCENTAGE", value: 50, maxDiscount: 300, usageLimit: 100, expiresAt: new Date("2025-07-31") },
      { code: "NUEVO150", description: "$150 de descuento para nuevos clientes", type: "FIXED", value: 150, minPurchase: 1000 },
    ],
  });
  console.log("✅ Coupons created");

  // Banners
  await prisma.banner.createMany({
    data: [
      { title: "Nueva Colección Primavera", subtitle: "Descubre los últimos estilos", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80", link: "/catalogo/mujeres", buttonText: "Ver Colección", order: 1 },
      { title: "Estilo Masculino Moderno", subtitle: "Para el hombre contemporáneo", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1400&q=80", link: "/catalogo/hombres", buttonText: "Explorar", order: 2 },
      { title: "Hasta 50% en Calzado", subtitle: "Ofertas por tiempo limitado", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80", link: "/catalogo/calzado", buttonText: "Ver Ofertas", order: 3 },
    ],
  });
  console.log("✅ Banners created");

  console.log(`\n🎉 Seed completed! ${productCount} products across ${allCatKeys.length} categories.`);
  console.log("🔑 Admin: admin@velora.mx / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
