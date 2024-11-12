# PostgreSQL Database Setup



## Setup Steps

### 1. Start PostgreSQL Service
```bash
brew services start postgresql
```

### 2. Create Database User
```bash
sudo -u postgres psql

CREATE USER ringi WITH PASSWORD 'your_password_here';
```

### 3. Create Database
```bash
CREATE DATABASE ringi;
```

### 4. Grant Privileges
```bash
GRANT ALL PRIVILEGES ON DATABASE ringi TO ringi;

ALTER DATABASE ringi OWNER TO ringi;
```

### 5. Connect to Database
```bash
psql -U ringi -d ringi -h localhost
```