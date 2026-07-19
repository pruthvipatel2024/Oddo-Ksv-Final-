const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_C7OZsVWS5zbm@ep-summer-water-az5jqdx8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
(async () => {
  await client.connect();
  const res = await client.query('SELECT id, "organizationId", "driverId", date, status, "availableSeats" FROM "Ride"');
  console.log('Rides:', res.rows);
  const users = await client.query('SELECT id, email, "organizationId" FROM "User"');
  console.log('Users:', users.rows);
  await client.end();
})();
