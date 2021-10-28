const mysql = require('mysql2');

// creates our connnection with sql 
// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // Your MySQL username,
    user: 'root',
    // Your MySQL password
    password: 'Samison12',
    database: 'team'
  },
  console.log('Connected to the companies database.')
);

module.exports = db;