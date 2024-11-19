const pg = require("pg");
const uuid = require("uuid");

const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost/acme_reservation_db");

const createTables = async () => {
  const SQL = /* sql */ `
    DROP TABLE IF EXISTS tables;
    DROP TABLE IF EXISTS customer;
    DROP TABLE IF EXISTS restaurant;
    DROP TABLE IF EXISTS reservations;

    CREATE TABLE tables (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      number INTEGER NOT NULL UNIQUE
    );

    CREATE TABLE customer (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE restaurant (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE reservations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      customer_id UUID REFERENCES customer(id) NOT NULL,
      table_id UUID REFERENCES tables(id) NOT NULL,
      restaurant_id UUID REFERENCES restaurant(id) NOT NULL,
      reservation_date DATE NOT NULL
    );
  `;
  await client.query(SQL);
};

// Function to create a customer
const createCustomer = async (name) => {
  const { rows: [customer] } = await client.query(`
    INSERT INTO customer (name) VALUES ($1) RETURNING *;
  `, [name]);
  return customer;
};

// Function to create a restaurant
const createRestaurant = async (name) => {
  const { rows: [restaurant] } = await client.query(`
    INSERT INTO restaurant (name) VALUES ($1) RETURNING *;
  `, [name]);
  return restaurant;
};

// Function to create a table
const createTable = async (number) => {
  const { rows: [table] } = await client.query(`
    INSERT INTO tables (number) VALUES ($1) RETURNING *;
  `, [number]);
  return table;
};

// Fetch all customers
const fetchCustomers = async () => {
  const { rows } = await client.query(`SELECT * FROM customer`);
  return rows;
};

// Fetch all restaurants
const fetchRestaurants = async () => {
  const { rows } = await client.query(`SELECT * FROM restaurant`);
  return rows;
};

// Fetch all tables
const fetchTables = async () => {
  const { rows } = await client.query(`SELECT * FROM tables`);
  return rows;
};

// Function to create a reservation
const createReservation = async (customerId, tableId, restaurantId, reservationDate) => {
  const { rows: [reservation] } = await client.query(`
    INSERT INTO reservations (customer_id, table_id, restaurant_id, reservation_date)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `, [customerId, tableId, restaurantId, reservationDate]);
  return reservation;
};

// Function to destroy a reservation
const destroyReservation = async (id) => {
  await client.query(`DELETE FROM reservations WHERE id = $1`, [id]);
};

module.exports = {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createTable,
  fetchCustomers,
  fetchRestaurants,
  fetchTables,
  createReservation,
  destroyReservation,
};
