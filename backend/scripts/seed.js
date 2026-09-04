const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Sample users
    const users = [
      {
        fullName: 'John Doe',
        email: 'john@debesmscat.edu.ph',
        password: await bcrypt.hash('password123', 10),
        phone: '09123456789',
        role: 'customer',
      },
      {
        fullName: 'Maria Santos',
        email: 'maria@debesmscat.edu.ph',
        password: await bcrypt.hash('password123', 10),
        phone: '09987654321',
        role: 'seller',
      },
      {
        fullName: 'Ryan Cruz',
        email: 'ryan@debesmscat.edu.ph',
        password: await bcrypt.hash('password123', 10),
        phone: '09555555555',
        role: 'seller',
      },
    ];

    console.log('Seeding users...');
    const createdUsers = [];
    for (const user of users) {
      try {
        const result = await db.one(
          `INSERT INTO users (full_name, email, password, phone, role, email_verified, verified_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW())
           ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
           RETURNING id`,
          [user.fullName, user.email, user.password, user.phone, user.role]
        );
        createdUsers.push({ id: result.id, ...user });
        console.log(`  ✅ Created user: ${user.email}`);
      } catch (error) {
        console.log(`  ⚠️  User ${user.email} already exists`);
      }
    }

    // Sample sellers
    console.log('\nSeeding sellers...');
    const sellers = [
      {
        userId: 2,
        storeName: 'MRS Corner',
        description: 'Fresh snacks, drinks, and breakfast meals for students',
        category: 'Food & Snacks',
        location: 'Main Gate',
        phone: '09987654321',
        email: 'maria@debesmscat.edu.ph',
      },
      {
        userId: 3,
        storeName: 'RDC Stationery',
        description: 'Quality school supplies and student essentials',
        category: 'Stationery',
        location: 'Student Center',
        phone: '09555555555',
        email: 'ryan@debesmscat.edu.ph',
      },
    ];

    for (const seller of sellers) {
      try {
        await db.one(
          `INSERT INTO sellers (user_id, store_name, description, category, location, phone, email, status, is_verified, verified_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'Approved', true, NOW())
           ON CONFLICT (user_id) DO UPDATE SET store_name = EXCLUDED.store_name
           RETURNING id`,
          [
            seller.userId,
            seller.storeName,
            seller.description,
            seller.category,
            seller.location,
            seller.phone,
            seller.email,
          ]
        );
        console.log(`  ✅ Created seller: ${seller.storeName}`);
      } catch (error) {
        console.log(`  ⚠️  Seller ${seller.storeName} already exists`);
      }
    }

    // Sample products
    console.log('\nSeeding products...');
    const products = [
      {
        sellerId: 1,
        productName: 'Chicken Rice Meal',
        description: 'Delicious chicken, rice, and vegetable meal',
        category: 'Food & Snacks',
        price: 45,
        stock: 50,
      },
      {
        sellerId: 1,
        productName: 'Bottled Juice',
        description: 'Fresh fruit juice in bottles',
        category: 'Beverages',
        price: 25,
        stock: 100,
      },
      {
        sellerId: 2,
        productName: 'Notebook Set',
        description: 'Premium notebooks for students',
        category: 'Stationery',
        price: 120,
        stock: 75,
      },
      {
        sellerId: 2,
        productName: 'Pen Set (12 pcs)',
        description: 'Assorted ballpoint pens',
        category: 'Stationery',
        price: 99,
        stock: 60,
      },
    ];

    for (const product of products) {
      try {
        await db.one(
          `INSERT INTO products (seller_id, product_name, description, category, price, stock, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'Active')
           RETURNING id`,
          [
            product.sellerId,
            product.productName,
            product.description,
            product.category,
            product.price,
            product.stock,
          ]
        );
        console.log(`  ✅ Created product: ${product.productName}`);
      } catch (error) {
        console.log(`  ⚠️  Product ${product.productName} seeding failed`);
      }
    }

    // Sample address for customer
    console.log('\nSeeding user addresses...');
    try {
      await db.one(
        `INSERT INTO user_addresses (user_id, label, address_line_1, city, province, postal_code, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [1, 'Home', '123 Campus Street', 'Makati City', 'Metro Manila', '1234']
      );
      console.log('  ✅ Created user address');
    } catch (error) {
      console.log('  ⚠️  Address seeding skipped');
    }

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📝 Sample login credentials:');
    console.log('   Email: john@debesmscat.edu.ph (Customer)');
    console.log('   Email: maria@debesmscat.edu.ph (Seller)');
    console.log('   Email: ryan@debesmscat.edu.ph (Seller)');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
