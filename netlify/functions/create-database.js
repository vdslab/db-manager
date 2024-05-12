import pg from "pg";

const pool = new pg.Pool();

function generatePassword() {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 20; ++i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export async function handler(event) {
  try {
    const { databaseName, userName } = JSON.parse(event.body);
    const password = generatePassword();
    console.log(databaseName, userName, password);
    await pool.query(
      `CREATE USER ${pg.escapeIdentifier(userName)} WITH PASSWORD '${pg.escapeIdentifier(password)}'`,
    );
    await pool.query(`GRANT ${pg.escapeIdentifier(userName)} TO db_manager`);
    await pool.query(
      `CREATE DATABASE ${pg.escapeIdentifier(databaseName)} WITH OWNER ${pg.escapeIdentifier(userName)}`,
    );
    return {
      body: JSON.stringify({
        databaseName,
        userName,
        password,
      }),
      statusCode: 200,
    };
  } catch (e) {
    console.error(e);
    return {
      body: JSON.stringify({
        message: "failed to create",
      }),
      statusCode: 500,
    };
  }
}
