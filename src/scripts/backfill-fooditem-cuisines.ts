import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../infrastructure/db/mongoose/connection.js';
import { FoodItemModel } from '../infrastructure/db/mongoose/schemas/foodItem.schema.js';
import { RestaurantModel } from '../infrastructure/db/mongoose/schemas/restaurant.schema.js';

function normalizeCuisine(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCuisinesFromItem(item: any): string[] {
  const candidates: string[] = [];
  const name = (item.name || '').toLowerCase();
  const category = (item.category || '').toLowerCase().replace(/_/g,' ');
  const tags: string[] = Array.isArray(item.tags) ? item.tags.map((t: string) => t.toLowerCase()) : [];

  const hints = [
    'indian','north indian','south indian','punjabi','mughlai','gujarati','bengali','kerala','rajasthani','hyderabadi','kashmiri','chettinad','tamil nadu','coastal',
    'chinese','indo chinese','italian','mexican','thai','japanese','american','mediterranean','continental','spanish','middle eastern','mumbai',
    'biryani','tandoori','kebab','sushi','pasta','pizza','noodles','rice','soup','salad','desserts','beverages','bbq'
  ];

  const sourceStrings = [name, category, ...tags];
  for (const h of hints) {
    if (sourceStrings.some(s => s.includes(h))) {
      candidates.push(h);
    }
  }

  if (/tikka|masala|butter chicken|dal|paneer|biryani|naan|rogan josh/.test(name)) candidates.push('north indian');
  if (/chettinad|madras|idli|dosa|sambar|rasam/.test(name)) candidates.push('south indian');
  if (/momo|hakka|schezwan|manchurian/.test(name)) candidates.push('indo chinese');

  return candidates.map(normalizeCuisine);
}

async function main() {
  const commit = process.argv.includes('--commit');
  await connectDB();

  const items = await FoodItemModel.find({}).lean();
  const restaurants = await RestaurantModel.find({}, { restaurantId: 1, cuisines: 1 }).lean();
  const byRestaurantId = new Map<string, string[]>(
    restaurants.map(r => [r.restaurantId as string, (r.cuisines as string[] | undefined) || []])
  );

  let updates = 0;
  for (const item of items) {
    const existing: string[] = (item.cuisines as string[] | undefined) || [];
    const inferred = inferCuisinesFromItem(item);
    const parentCuisines = byRestaurantId.get(item.restaurantId) || [];

    const merged = Array.from(new Set([
      ...existing.map(normalizeCuisine),
      ...inferred,
      ...parentCuisines.map(normalizeCuisine),
    ])).filter(Boolean);

    if (merged.length === 0) continue;

    const same = existing.length === merged.length && existing.every(e => merged.includes(normalizeCuisine(e)));
    if (same) continue;

    updates += 1;
    console.log(`Will update ${item.foodItemId || item._id}:`, merged);
    if (commit) {
      await FoodItemModel.updateOne({ _id: item._id }, { $set: { cuisines: merged } });
    }
  }

  console.log(`\n${commit ? 'Updated' : 'Would update'} ${updates} item(s).`);
  await mongoose.connection.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


