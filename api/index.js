import express from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

console.log("DB_HOST", process.env.DB_HOST)

async function initDb() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS Items(
      id serial primary key,
      name text not null,
      created_at timestamp not null default now()
    );`);
    console.log("Items table created");
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/ping", async (req, res) => {
  const now = await pool.query('select now() as now;')
  res.status(202).json({ message: "pong", now: now.rows[0].now });
});

app.get("/items", async (req, res) => {
  const items = await pool.query('select * from items order by id desc;');
  res.status(200).json({ items: items.rows });
});

app.post("/items", async (req, res) => {
  const { name } = req.body;
  if (!name || typeof (name) !== "string") {
    return res.status(400).json({ message: "Name is required and must be a string" });
  }
  const result = await pool.query('insert into items (name) values ($1) returning *;', [name]);
  res.status(201).json({ item: result.rows[0] });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

initDb().then(() => {
  app.listen(5000, "0.0.0.0", () => {
    console.log("Server is running on port 5000");
  });
}).catch((error) => {
  console.error("Failed to start server", error);
});
