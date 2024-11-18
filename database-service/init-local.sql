IF NOT EXISTS (
  SELECT name FROM sys.databases WHERE name = 'local-avoca'
)
  BEGIN
    CREATE DATABASE 'local-avoca';
  END;

-- -- Switch to your target database
-- USE [local-avoca];

-- -- Step 1: Create a Login at the Server Level
-- CREATE LOGIN sa WITH PASSWORD = 'YourStrong!Passw0rd';

-- -- Step 2: Create a User in the Target Database
-- CREATE USER sa FOR LOGIN sa;

-- -- Step 3: Grant User All Permissions in the Database
-- ALTER ROLE db_owner ADD MEMBER sa;