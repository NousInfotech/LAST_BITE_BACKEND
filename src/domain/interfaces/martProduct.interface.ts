export interface IMartProduct {
  martProductId?: string; // public-friendly product ID
  martStoreId: string; // customId from IMartStore (used instead of ObjectId)
  productName: string;
  description?: string;
  price: number; // inclusive of GST
  discountPrice?: number;
  image?: string;
  isAvailable: boolean;
  unit: string; // e.g., "1kg", "500g", "1L", "pack of 6"
  categories: string[]; // e.g., ["vegetables", "organic"]
  stock?: number;
  rating?: number;
  ratingCount?: number;
  tags?: string[]; // e.g., ["seasonal", "imported"]
  createdAt?: Date;
  updatedAt?: Date;
}
