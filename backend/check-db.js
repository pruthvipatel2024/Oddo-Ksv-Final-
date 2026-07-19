const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_C7OZsVWS5zbm@ep-summer-water-az5jqdx8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
(async () => {
  await client.connect();
  const res = await client.query('SELECT email, "organizationId", "lastLogin" FROM "User" ORDER BY "lastLogin" DESC NULLS LAST LIMIT 5');
  console.log(res.rows);
  await client.end();
})();
