import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to fix the cart.foodItemId unique index issue
 * This script removes the problematic unique index if it exists
 */
async function fixCartIndex() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/last-bite';
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get the users collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Check if the problematic index exists
        const indexes = await usersCollection.indexes();
        console.log('🔍 Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key, unique: idx.unique })));

        const cartFoodItemIdIndex = indexes.find(index => 
            index.key && index.key['cart.foodItemId'] === 1
        );

        if (cartFoodItemIdIndex) {
            console.log('🔍 Found problematic index:', cartFoodItemIdIndex);
            
            // Check if it's a unique index
            if (cartFoodItemIdIndex.unique) {
                console.log('⚠️  Found unique index on cart.foodItemId - removing it...');
                
                // Drop the problematic index
                await usersCollection.dropIndex(cartFoodItemIdIndex.name);
                console.log('✅ Successfully removed unique index on cart.foodItemId');
            } else {
                console.log('ℹ️  Found non-unique index on cart.foodItemId - keeping it');
            }
        } else {
            console.log('ℹ️  No index found on cart.foodItemId');
        }

        // Close the connection
        await mongoose.connection.close();
        console.log('✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error fixing cart index:', error);
        process.exit(1);
    }
}

// Run the script
fixCartIndex()
    .then(() => {
        console.log('✅ Cart index fix completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Cart index fix failed:', error);
        process.exit(1);
    });
