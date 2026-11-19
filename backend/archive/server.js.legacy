require("dotenv").config();

const express = require("express");
const { Client } = require("pg");

const app = express();

// This verifier intentionally defaults to port 3000 so /test-db matches the requested URL.
const PORT = Number(process.env.TEST_DB_PORT || 3000);

function parseDatabaseUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getBaseConnectionConfig() {
  const url = parseDatabaseUrl(process.env.DATABASE_URL);

  if (url) {
    return {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: decodeURIComponent(url.pathname.replace(/^\//, "")) || undefined,
      ssl: false,
    };
  }

  return {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "1234",
    database: process.env.PGDATABASE || process.env.DB_NAME || undefined,
    ssl: false,
  };
}

function buildConnectionConfig(databaseName) {
  const baseConfig = getBaseConnectionConfig();

  return {
    host: baseConfig.host,
    port: baseConfig.port,
    user: baseConfig.user,
    password: baseConfig.password,
    database: databaseName || baseConfig.database || "testdb",
    ssl: false,
  };
}

async function detectDatabaseName() {
  const baseConfig = getBaseConnectionConfig();

  if (baseConfig.database) {
    return baseConfig.database;
  }

  const adminClient = new Client(buildConnectionConfig("postgres"));

  try {
    await adminClient.connect();

    const testDbCheck = await adminClient.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false AND datname = $1 LIMIT 1;",
      ["testdb"],
    );

    if (testDbCheck.rows[0]?.datname) {
      return testDbCheck.rows[0].datname;
    }

    const fallbackDb = await adminClient.query(
      `
        SELECT datname
        FROM pg_database
        WHERE datistemplate = false
          AND datallowconn = true
          AND datname NOT IN ('postgres')
        ORDER BY datname
        LIMIT 1;
      `,
    );

    return fallbackDb.rows[0]?.datname || "postgres";
  } finally {
    await adminClient.end().catch(() => undefined);
  }
}

async function runDatabaseTest() {
  let client;

  try {
    const databaseName = await detectDatabaseName();
    const connectionConfig = buildConnectionConfig(databaseName);

    client = new Client(connectionConfig);
    await client.connect();

    console.log("✅ DB Connected");
    console.log(`Connected database: ${databaseName}`);

    const nowResult = await client.query("SELECT NOW();");
    console.log("SELECT NOW() result:", nowResult.rows[0]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT
      );
    `);

    await client.query("INSERT INTO test_connection (message) VALUES ($1);", ["DB is working"]);

    const dataResult = await client.query("SELECT * FROM test_connection ORDER BY id DESC;");
    console.log("Fetched rows from test_connection:");
    console.table(dataResult.rows);

    return {
      status: "success",
      message: "Database is working",
      database: databaseName,
      data: dataResult.rows,
      now: nowResult.rows[0],
    };
  } catch (error) {
    console.error("❌ Connection Failed");
    console.error(error.message);

    return {
      status: "error",
      message: "Database not connected",
      error: error.message,
    };
  } finally {
    if (client) {
      await client.end().catch(() => undefined);
    }
  }
}

app.get("/", (_req, res) => {
  res.json({
    status: "ready",
    message: "Open /test-db to verify PostgreSQL connectivity.",
  });
});

app.get("/test-db", async (_req, res) => {
  const result = await runDatabaseTest();

  if (result.status === "success") {
    return res.status(200).json(result);
  }

  return res.status(500).json(result);
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Running startup database verification...");
  await runDatabaseTest();
});
