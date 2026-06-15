import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

const rowToAppt = row => ({ ...row, assigned: JSON.parse(row.assigned) });
const rowToStaff = row => ({ ...row, specialties: JSON.parse(row.specialties), active: !!row.active });

/* ============================ SERVICES ============================ */
app.get("/api/services", (req, res) => {
  res.json(db.prepare("SELECT * FROM services ORDER BY id").all());
});

app.post("/api/services", (req, res) => {
  const { name, price } = req.body;
  const { lastInsertRowid } = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)").run(name, price);
  res.status(201).json(db.prepare("SELECT * FROM services WHERE id = ?").get(lastInsertRowid));
});

app.put("/api/services/:id", (req, res) => {
  const { name, price } = req.body;
  db.prepare("UPDATE services SET name = ?, price = ? WHERE id = ?").run(name, price, req.params.id);
  res.json(db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id));
});

app.delete("/api/services/:id", (req, res) => {
  db.prepare("DELETE FROM services WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

/* ============================ STAFF ============================ */
app.get("/api/staff", (req, res) => {
  res.json(db.prepare("SELECT * FROM staff ORDER BY id").all().map(rowToStaff));
});

app.put("/api/staff/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM staff WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).end();
  const next = { ...rowToStaff(existing), ...req.body };
  db.prepare(`
    UPDATE staff SET name=?, short=?, init=?, role=?, since=?, rating=?, reviews=?, revenue=?, appts=?, color=?, specialties=?, phone=?, email=?, active=?
    WHERE id=?
  `).run(next.name, next.short, next.init, next.role, next.since, next.rating, next.reviews, next.revenue, next.appts, next.color, JSON.stringify(next.specialties), next.phone, next.email, next.active ? 1 : 0, req.params.id);
  res.json(rowToStaff(db.prepare("SELECT * FROM staff WHERE id = ?").get(req.params.id)));
});

/* ============================ APPOINTMENTS ============================ */
app.get("/api/appointments", (req, res) => {
  res.json(db.prepare("SELECT * FROM appointments ORDER BY date, time").all().map(rowToAppt));
});

app.post("/api/appointments", (req, res) => {
  const { date, time, customer, phone, service, price, assigned, status } = req.body;
  const { lastInsertRowid } = db.prepare(`
    INSERT INTO appointments (date, time, customer, phone, service, price, assigned, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, time, customer, phone, service, price, JSON.stringify(assigned || []), status || "pending");
  res.status(201).json(rowToAppt(db.prepare("SELECT * FROM appointments WHERE id = ?").get(lastInsertRowid)));
});

app.put("/api/appointments/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).end();
  const next = { ...rowToAppt(existing), ...req.body };
  db.prepare(`
    UPDATE appointments SET date=?, time=?, customer=?, phone=?, service=?, price=?, assigned=?, status=?
    WHERE id=?
  `).run(next.date, next.time, next.customer, next.phone, next.service, next.price, JSON.stringify(next.assigned), next.status, req.params.id);
  res.json(rowToAppt(db.prepare("SELECT * FROM appointments WHERE id = ?").get(req.params.id)));
});

app.delete("/api/appointments/:id", (req, res) => {
  db.prepare("DELETE FROM appointments WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
