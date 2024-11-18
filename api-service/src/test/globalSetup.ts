/* eslint-disable no-console */
import { execSync } from 'child_process';
import * as mssql from 'mssql';

const testContainerName = 'test-avoca-mssql-container';

export default async function () {
  console.log('Pulling the latest SQL Server image...');
  execSync('docker pull mcr.microsoft.com/azure-sql-edge', {
    stdio: 'inherit',
  });

  console.log(
    `Checking if the test SQL Server container ${testContainerName} is already running...`
  );
  try {
    execSync(`docker inspect --format="{{.State.Running}}" ${testContainerName}`, {
      stdio: 'ignore',
    });
    console.log(`Container ${testContainerName} is already running.`);
  } catch {
    console.log(`Starting a new test SQL Server container: ${testContainerName}...`);
    execSync(
      `docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 --name ${testContainerName} -d mcr.microsoft.com/azure-sql-edge`,
      {
        stdio: 'inherit',
      }
    );
  }
  console.log('Test SQL Server container is running...');

  let dbReadyCount = 0;
  async function waitForDb() {
    try {
      dbReadyCount++;

      console.log(`Waiting for the SQL Server container to start... ${dbReadyCount}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Connect to the master database to create a new database
      console.log('Connecting to the master database...');
      const pool = await mssql.connect({
        port: 1433,
        password: 'YourStrong!Passw0rd',
        user: 'sa',
        database: 'master',
        server: 'localhost',
        options: {
          trustServerCertificate: true,
        },
      });

      // Check if the database exists; create it if not
      console.log('Creating the test database if it does not already exist...');
      await mssql.query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'test')
        BEGIN
          CREATE DATABASE test;
        END;
      `);

      // Reconfigure to use the new database
      console.log('Closing the mssql connection so Sequelize can run in tests...');
      await pool.close();
    } catch (error) {
      if (dbReadyCount > 10) {
        console.log('Failed to connect to the master database after 10 attempts.');
        throw error;
      }
      await waitForDb();
    }
  }
  await waitForDb();
}
