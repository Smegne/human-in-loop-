const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3309,
      user: 'smegn',
      password: '123456@Sm',
      database: 'loopydb'
    });
    console.log('Successfully connected to loopydb on port 3309!');
    await connection.end();
  } catch (err) {
    console.error('Failed to connect:', err);
  }
}
main();
