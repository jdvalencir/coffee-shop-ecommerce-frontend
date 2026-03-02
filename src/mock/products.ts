import type { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    name: "Ethiopian Yirgacheffe",
    description:
      "A bright, complex light roast from the birthplace of coffee. Layers of jasmine, bergamot and ripe blueberry with a silky, tea-like body.",
    price: 65_000,
    stock: 15,
    image:
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=600&q=80",
    roastLevel: "light",
    origin: "Ethiopia",
    weight: 500,
    notes: ["Blueberry", "Jasmine", "Bergamot"],
  },
  {
    id: "prod-002",
    name: "Colombian Supremo",
    description:
      "A classic medium roast from the high-altitude farms of Huila. Perfectly balanced with notes of caramel, hazelnut and a subtle citrus finish.",
    price: 48_000,
    stock: 23,
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    roastLevel: "medium",
    origin: "Colombia",
    weight: 500,
    notes: ["Caramel", "Hazelnut", "Citrus"],
  },
  {
    id: "prod-003",
    name: "Sumatra Mandheling",
    description:
      "Bold and earthy with a full, syrupy body. This wet-hulled dark roast delivers notes of dark chocolate, cedar and a lingering smoky finish.",
    price: 55_000,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=600&q=80",
    roastLevel: "dark",
    origin: "Indonesia",
    weight: 500,
    notes: ["Dark Chocolate", "Cedar", "Earthy"],
  },
  {
    id: "prod-004",
    name: "Guatemala Antigua",
    description:
      "Grown in the shadow of three volcanoes, this medium-dark roast is rich and spicy with notes of milk chocolate, brown sugar and toasted almond.",
    price: 52_000,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
    roastLevel: "medium-dark",
    origin: "Guatemala",
    weight: 500,
    notes: ["Milk Chocolate", "Brown Sugar", "Almond"],
  },
  {
    id: "prod-005",
    name: "Kenya AA",
    description:
      "An exceptional washed light-medium with vibrant, wine-like acidity. Bursts with black currant, tomato and red plum — unlike any coffee you've had.",
    price: 72_000,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1561478908-d067fe75a553?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    roastLevel: "light",
    origin: "Kenya",
    weight: 500,
    notes: ["Black Currant", "Red Plum", "Tomato"],
  },
  {
    id: "prod-006",
    name: "Brazil Santos",
    description:
      "The quintessential everyday espresso base. Low acidity, full body, and comforting notes of milk chocolate, peanut butter and subtle vanilla sweetness.",
    price: 43_000,
    stock: 30,
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80",
    roastLevel: "medium",
    origin: "Brazil",
    weight: 500,
    notes: ["Milk Chocolate", "Peanut Butter", "Vanilla"],
  },
];
