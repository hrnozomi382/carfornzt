const mysql = require('mysql2/promise');

async function createMaintenanceTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'carbookingsystem'
    });

    console.log('Connected to database');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Maintenance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        carId INT NOT NULL,
        serviceDate DATE NOT NULL,
        serviceType VARCHAR(100) NOT NULL,
        description TEXT,
        cost DECIMAL(10,2) DEFAULT 0,
        mileage INT DEFAULT 0,
        nextServiceDate DATE,
        nextServiceMileage INT,
        createdBy INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE CASCADE,
        FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE SET NULL
      )
    `;

    await connection.execute(createTableSQL);
    console.log('Maintenance table created successfully');

    await connection.end();
  } catch (error) {
    console.error('Error creating Maintenance table:', error);
  }
}

createMaintenanceTable();