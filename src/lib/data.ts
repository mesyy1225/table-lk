
export interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  categories: string[];
  material: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviews: Review[];
  colors?: string[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

const productDescription = `Made with high-quality melamine table, designed for durability, functionality, and a sleek aesthetic. Crafted from 15mm particle melamine board, 1.5"X1.5" powder coated steel frame and legs. This table is perfect for home, office, or commercial use.

Features:
✔ Sturdy & Durable – Made from premium 15mm melamine-coated particleboard for a smooth, scratch-resistant surface.
✔ Modern Design – Available in White, American Ash White, Black, and Teak finishes to match any décor.
✔ Easy to Clean – Resistant to stains, moisture, and everyday wear.
✔ Multi-Purpose Use – Ideal for dining, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Cash on Delivery (COD) Available!`;

const tableColors = ["White", "American Ash White", "Black", "Teak"];

export const products: Product[] = [
  {
    id: 1,
    name: "5ft x 2ft Smart Table",
    shortDescription: "Modern melamine computer table with steel frame",
    description: productDescription,
    price: 18200,
    images: [
      "https://i.ibb.co/gMcKWyFk/elegance-dining-1.jpg",
      "https://i.ibb.co/Mkpp82D7/elegance-dining-2.jpg",
      "https://i.ibb.co/DnMk7x5/elegance-dining-3.jpg",
      "https://i.ibb.co/p6SVT1Wj/elegance-dining-4.jpg",
      "https://i.ibb.co/N27prg9D/rustic-dining-1.jpg"
    ],
    categories: ["computer", "Modern", "Office"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 24,
      length: 60,
      height: 30
    },
    inStock: true,
    featured: true,
    rating: 4.8,
    colors: tableColors,
    reviews: [
      {
        id: 1,
        userId: 1,
        userName: "Sarath Kumara",
        rating: 5,
        comment: "Absolutely love this table! The quality is exceptional and it looks stunning in our office room.",
        date: "2023-04-15"
      },
      {
        id: 2,
        userId: 2,
        userName: "Anuradha Perera",
        rating: 4,
        comment: "Beautiful table, exactly as described. Took off one star because delivery took longer than expected.",
        date: "2025-05-22"
      }
    ]
  },
  {
    id: 2,
    name: "4ft x 2ft Smart Table",
    shortDescription: "Modern melamine computer table with steel frame",
    description: productDescription,
    price: 16200,
    images: [
      "https://i.ibb.co/GfhnC8Gy/coffee-table-1.jpg",
      "https://i.ibb.co/LdHJRGZY/coffee-table-2.jpg",
      "https://i.ibb.co/HT446tJn/coffee-table-3.jpg",
      "https://i.ibb.co/MWYyYrn/coffee-table-4.jpg",
      "https://i.ibb.co/yFbZFP3C/coffee-table-5.jpg"
    ],
    categories: ["computer", "Modern", "office Room"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 24,
      length: 48,
      height: 30
    },
    inStock: true,
    featured: true,
    rating: 4.9,
    colors: tableColors,
    reviews: [
      {
        id: 3,
        userId: 3,
        userName: "Sahashra Athukorala",
        rating: 5,
        comment: "This computer table exceeded my expectations! The quality is outstanding.",
        date: "2025-03-02"
      }
    ]
  },
  {
    id: 3,
    name: "3ft x 2ft Smart Table",
    shortDescription: "Modern melamine study desk with steel frame",
    description: productDescription,
    price: 14600,
    images: [
      "https://i.ibb.co/997VBVdX/desk-1.jpg",
      "https://i.ibb.co/LXkYMk1S/desk-2.jpg",
      "https://i.ibb.co/GvWKd096/desk-3.jpg",
      "https://i.ibb.co/hFkLF0pG/desk-4.jpg"
    ],
    categories: ["Office", "Modern", "Desk"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 24,
      length: 36,
      height: 30
    },
    inStock: true,
    featured: false,
    rating: 4.9,
    colors: tableColors,
    reviews: [
      {
        id: 4,
        userId: 4,
        userName: "Nandana Silva",
        rating: 5,
        comment: "A truly exceptional desk that transforms my home office. The quality and craftsmanship are outstanding.",
        date: "2025-06-10"
      },
      {
        id: 5,
        userId: 5,
        userName: "Radika Madupani",
        rating: 5,
        comment: "Worth every penny. This desk is both beautiful and functional - I couldn't be happier with my purchase.",
        date: "2025-05-18"
      }
    ]
  },
  {
    id: 4,
    name: "2.5ft x 2ft Smart Table",
    shortDescription: "Modern melamine office table with steel frame",
    description: productDescription,
    price: 12900,
    images: [
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=958&q=80",
      "https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    ],
    categories: ["office", "Modern", "Living Room"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 24,
      length: 32,
      height: 30
    },
    inStock: true,
    featured: true,
    rating: 4.7,
    colors: tableColors,
    reviews: [
      {
        id: 6,
        userId: 6,
        userName: "Udara Gunawardhana",
        rating: 5,
        comment: "This smart table is exactly what I was looking for to complete my entryway. Solid construction and great looks!",
        date: "2023-06-20"
      },
      {
        id: 7,
        userId: 7,
        userName: "Aruni Gamage",
        rating: 4.8,
        comment: "Love the modern look and sturdiness of this table. The finish is exactly as shown in the photos.",
        date: "2025-02-15"
      }
    ]
  },
  {
    id: 5,
    name: "Modern L-Shaped Tables",
    shortDescription: "Modern melamine L-Shaped table with steel frame",
    description: productDescription,
    price: 22000,
    images: [
      "https://images.unsplash.com/photo-1519974719765-e6559eac2575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1457&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    ],
    categories: ["Conference", "Modern", "Office"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 24,
      length: 48,
      height: 36
    },
    inStock: true,
    featured: false,
    rating: 4.7,
    colors: tableColors,
    reviews: [
      {
        id: 8,
        userId: 8,
        userName: "Sumeera Kodithuwakku",
        rating: 5,
        comment: "Transformed our meeting room. Professional, stylish, and extremely well-made.",
        date: "2025-04-30"
      }
    ]
  },
  {
    id: 6,
    name: "Modern Dining Table",
    shortDescription: "Modern melamine dining table with steel frame",
    description: productDescription,
    price: 16500,
    images: [
      "https://images.unsplash.com/photo-1631455853929-ba06397f9a69?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1097&q=80",
      "https://images.unsplash.com/photo-1601590384651-c3aca464b059?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
    ],
    categories: ["dining Table", "Modern", "Living Room"],
    material: "15mm Melamine Particleboard with Steel Frame",
    dimensions: {
      width: 36,
      length: 60,
      height: 30
    },
    inStock: true,
    featured: true,
    rating: 4.9,
    colors: tableColors,
    reviews: [
      {
        id: 9,
        userId: 9,
        userName: "Kavidu Sampath",
        rating: 5,
        comment: "This dining table is perfect! The quality is amazing and it matches perfectly with our decor.",
        date: "2025-02-05"
      },
      {
        id: 10,
        userId: 10,
        userName: "Sihasna Pathirana",
        rating: 5,
        comment: "Absolutely beautiful table that looks even better in person. I'm ordering a second one!",
        date: "2024-08-29"
      }
    ]
  }
];

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getAllProducts = (): Product[] => {
  return products;
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.categories.includes(category));
};

export const getProductsByMaterial = (material: string): Product[] => {
  return products.filter(product => product.material === material);
};

export const getProductsByPriceRange = (min: number, max: number): Product[] => {
  return products.filter(product => product.price >= min && product.price <= max);
};

export const getAllCategories = (): string[] => {
  const categories = new Set<string>();
  products.forEach(product => {
    product.categories.forEach(category => {
      categories.add(category);
    });
  });
  return Array.from(categories).sort();
};

export const getAllMaterials = (): string[] => {
  const materials = new Set<string>();
  products.forEach(product => {
    materials.add(product.material);
  });
  return Array.from(materials).sort();
};
