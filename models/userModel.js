// create_tables.js

 const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('admin', 'organisation', 'donar', 'hospital') NOT NULL,
  name VARCHAR(255),
  organisation_name VARCHAR(255),
  hospital_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  address VARCHAR(255) NULL,
  phone VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_name CHECK (
    (role IN ('admin', 'donar') AND name IS NOT NULL) OR
    (role NOT IN ('admin', 'donar') AND name IS NULL)
  ),
  CONSTRAINT chk_organisation_name CHECK (
    (role = 'organisation' AND organisation_name IS NOT NULL) OR
    (role != 'organisation' AND organisation_name IS NULL)
  ),
  CONSTRAINT chk_hospital_name CHECK (
    (role = 'hospital' AND hospital_name IS NOT NULL) OR
    (role != 'hospital' AND hospital_name IS NULL)
  )
);
`;

module.exports = { createUsersTableSQL };
