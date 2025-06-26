import { FoodType } from "./utils.interface.js";

export interface IAddon {
  name: string;
  price: number;
}

export interface IFoodItem {
  foodItemId?: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  isAvailable?: boolean;
  typeOfFood: FoodType[];
  tags?: string[];
  category: string;
  rating?: number;
  ratingCount?: number;
  stock?: number;
  addons?: IAddon[];
}
