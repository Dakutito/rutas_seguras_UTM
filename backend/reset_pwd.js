const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: 'postgresql://postgres.bzdcoezmvttqanuvymtj:titojair123***@aws-1-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function run() {
    try {
        const hash = await bcrypt.hash('123456', 10);
        const result = await pool.query(
            "UPDATE users SET password = $1 WHERE email = 'test@rutas.com'",
            [hash]
        );
        console.log('Password reset successfully. Rows affected:', result.rowCount);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

run();
