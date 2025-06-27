
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
✔ Easy to Clean – Resistant to stains and everyday wear.
✔ Multi-Purpose Use – Ideal for offices, workstations, study desks, conference rooms, and more.
✔ Customizable Sizes – Various dimensions available to suit your needs.

COLOURS:
⚪ White
🔘 American Ash White
⚫ Black 
🟤 Teak

💳 Free Islandwide Delivery (COD) Available!`;

const tableColors = ["White", "American Ash White", "Black", "Teak"];

export const products: Product[] = [
  {
    id: 1,
    name: "5ft x 2ft Smart Table",
    shortDescription: "Modern melamine computer table with steel frame",
    description: productDescription,
    price: 18200,
    images: [
      "https://u.cubeupload.com/Tablelkk/IMG20250601WA0022.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0009.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250402WA0001.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250501WA0007.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250501WA0006.jpg"
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
      "https://u.cubeupload.com/Tablelkk/IMG20250606WA0017.jpg",
      "https://u.cubeupload.com/Tablelkk/Screenshot2025060516.jpg",
      "https://u.cubeupload.com/Tablelkk/20250321115351.jpg",
      "https://u.cubeupload.com/Tablelkk/1deIMG20250308WA0022.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250308WA0022.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250503WA0012.jpg",
      "https://u.cubeupload.com/Tablelkk/WhatsAppImage2025031.jpg"
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
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0019.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0013.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0021.jpg",
      "https://u.cubeupload.com/Tablelkk/BusinessSuitecreatio.jpeg",
      "https://u.cubeupload.com/Tablelkk/IMG20250528WA0022.jpg"
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
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0020.jpg",
      "https://u.cubeupload.com/Tablelkk/545IMG20250120WA0012.jpg",
      "https://u.cubeupload.com/Tablelkk/VideoCapture20250514.jpg",
      "https://u.cubeupload.com/Tablelkk/20250321121437.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0019.jpg"
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
      "https://u.cubeupload.com/Tablelkk/IMG20250409WA0003.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0011.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250120WA0008.jpg",
      "https://u.cubeupload.com/Tablelkk/9b7WhatsAppImage2025031.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250514WA0006.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250311WA0003.jpg"
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
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0004.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0002.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0003.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0010.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0008.jpg",
      "https://u.cubeupload.com/Tablelkk/IMG20250330WA0013.jpg"
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
