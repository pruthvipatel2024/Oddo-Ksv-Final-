const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_C7OZsVWS5zbm@ep-summer-water-az5jqdx8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
(async () => {
  await client.connect();
  const res = await client.query('SELECT id, "pickupAddress", "destinationAddress", "pickupLat", "pickupLng", "destinationLat", "destinationLng" FROM "Ride" WHERE id = \'ca4bbdf0-44d1-404b-abc9-e816c6df43e2\'');
  console.log(res.rows[0]);
  await client.end();
})();
