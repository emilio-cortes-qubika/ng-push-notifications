import pg from 'pg';
import pgConnectionString from 'pg-connection-string';

const { Pool } = pg;
const { parse } = pgConnectionString;


let pool = null;

export function initDb() {
  const connectionString = process.env.DB;
  const config = parse(connectionString);
  pool = new Pool(config);
}

export async function insertSubscription(subscription) {
  try {
    const res = await pool.query('INSERT INTO subscriptions(data) VALUES($1) RETURNING *', [JSON.stringify(subscription)]);
    console.log('Subscription added to database');
    return res.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetchSubscriptions() {
  try {
    const res = await pool.query('SELECT * FROM subscriptions');
    console.log('Subscriptions fetched from database');
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteSubscription(subscriptionId) {
  try {
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [subscriptionId]);
    console.log('Subscription deleted from database');
  } catch (err) {
    console.error(err);
    throw err;
  }
}