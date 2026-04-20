require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log('Seeding database with 100,000 rows. This may take a few minutes...');
  const client = await pool.connect();

  try {
    // 1. Create schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Clear out testing items if they exist
    await client.query('TRUNCATE TABLE items RESTART IDENTITY;');

    // 2. Insert 100k rows in batches
    console.log("Starting bulk insert...");
    const batchSize = 1000; // Optimal batch size for typical Node/Postgres setup without params overload
    const totalItems = 100000;
    
    for (let i = 0; i < totalItems; i += batchSize) {
      let valuesString = '';
      
      for (let j = 0; j < batchSize; j++) {
        const index = i + j + 1;
        const separator = j === batchSize - 1 ? '' : ', ';
        valuesString += `('Sanal Blok #${index}', 'DOM ağacı kararlılığını kusursuz şekilde koruyan optimize edilmiş sanal bileşen aktarımı.')${separator}`;
      }
      
      // Batch execute
      await client.query(`INSERT INTO items (title, description) VALUES ${valuesString};`);
      
      if ((i + batchSize) % 10000 === 0) {
        console.log(`Inserted ${i + batchSize} / ${totalItems} rows...`);
      }
    }

    // 3. Create index for performance
    console.log("Creating optimized cursor index...");
    await client.query('CREATE INDEX IF NOT EXISTS idx_items_id_desc ON items(id DESC);');

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
