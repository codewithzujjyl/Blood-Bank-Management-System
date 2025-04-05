 const createInventoryTableSQL = `
  CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    inventoryType ENUM('in', 'out') NOT NULL,
    bloodGroup ENUM('O+', 'O-', 'AB+', 'AB-', 'A+', 'A-', 'B+', 'B-') NOT NULL,
    quantity INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    organisation INT NOT NULL,
    hospital INT DEFAULT NULL,
    donar INT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_organisation FOREIGN KEY (organisation) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_hospital FOREIGN KEY (hospital) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_donar FOREIGN KEY (donar) REFERENCES users(id) ON DELETE SET NULL
  );
`;
module.exports = { createInventoryTableSQL };