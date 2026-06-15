import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ============================ SERVICES ============================ */
app.get("/api/services", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY id");
  res.json(rows);
});

app.post("/api/services", async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await pool.query("INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *", [name, price]);
  res.status(201).json(rows[0]);
});

app.put("/api/services/:id", async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await pool.query("UPDATE services SET name = $1, price = $2 WHERE id = $3 RETURNING *", [name, price, req.params.id]);
  res.json(rows[0]);
});

app.delete("/api/services/:id", async (req, res) => {
  await pool.query("DELETE FROM services WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

/* ============================ STAFF ============================ */
app.get("/api/staff", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM staff ORDER BY id");
  res.json(rows);
});

app.put("/api/staff/:id", async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM staff WHERE id = $1", [req.params.id]);
  if (!existingRows[0]) return res.status(404).end();
  const next = { ...existingRows[0], ...req.body };
  const { rows } = await pool.query(
    `UPDATE staff SET name=$1, short=$2, init=$3, role=$4, since=$5, rating=$6, reviews=$7, revenue=$8, appts=$9, color=$10, specialties=$11, phone=$12, email=$13, active=$14
     WHERE id=$15 RETURNING *`,
    [next.name, next.short, next.init, next.role, next.since, next.rating, next.reviews, next.revenue, next.appts, next.color, JSON.stringify(next.specialties), next.phone, next.email, next.active, req.params.id]
  );
  res.json(rows[0]);
});

/* ============================ APPOINTMENTS ============================ */
app.get("/api/appointments", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM appointments ORDER BY date, time");
  res.json(rows);
});

app.post("/api/appointments", async (req, res) => {
  const { date, time, customer, phone, service, price, assigned, status, notes } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO appointments (date, time, customer, phone, service, price, assigned, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [date, time, customer, phone, service, price, JSON.stringify(assigned || []), status || "pending", notes || ""]
  );
  res.status(201).json(rows[0]);
});

app.put("/api/appointments/:id", async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM appointments WHERE id = $1", [req.params.id]);
  if (!existingRows[0]) return res.status(404).end();
  const next = { ...existingRows[0], ...req.body };
  const { rows } = await pool.query(
    `UPDATE appointments SET date=$1, time=$2, customer=$3, phone=$4, service=$5, price=$6, assigned=$7, status=$8, notes=$9
     WHERE id=$10 RETURNING *`,
    [next.date, next.time, next.customer, next.phone, next.service, next.price, JSON.stringify(next.assigned), next.status, next.notes || "", req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/appointments/:id", async (req, res) => {
  await pool.query("DELETE FROM appointments WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
