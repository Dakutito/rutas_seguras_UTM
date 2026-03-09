const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.bzdcoezmvttqanuvymtj:titojair123***@aws-1-sa-east-1.pooler.supabase.com:5432/postgres' });
pool.query("SELECT email, password FROM users WHERE email='test@rutas.com'").then(res => { console.log(JSON.stringify(res.rows)); pool.end(); }).catch(e => console.error(e));
