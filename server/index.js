import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const app = express();
const isProd = !!process.env.RENDER;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const STATUSES = ["pending", "assigned", "in_progress", "completed"];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = user => jwt.sign(
  { id: user.id, username: user.username, role: user.role, staffId: user.staff_id },
  JWT_SECRET,
  { expiresIn: "7d" }
);

const auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

const loadUserPayload = async user => {
  let staff = null;
  if (user.staff_id) {
    const { rows } = await pool.query("SELECT * FROM staff WHERE id = $1", [user.staff_id]);
    staff = rows[0] || null;
  }
  return { id: user.id, username: user.username, role: user.role, staff };
};

app.get("/api/health", (req, res) => res.json({ ok: true }));

/* ============================ AUTH ============================ */
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Username or password is incorrect." });
  }

  const payload = await loadUserPayload(user);
  if (payload.staff && !payload.staff.active) {
    return res.status(403).json({ error: "This account has been disabled. Contact an administrator." });
  }

  res.cookie("token", signToken(user), COOKIE_OPTS);
  res.json(payload);
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTS);
  res.status(204).end();
});

app.get("/api/auth/me", auth, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Not authenticated" });

  const payload = await loadUserPayload(user);
  if (payload.staff && !payload.staff.active) {
    return res.status(403).json({ error: "This account has been disabled. Contact an administrator." });
  }
  res.json(payload);
});

app.put("/api/auth/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });

  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
  const user = rows[0];
  if (!bcrypt.compareSync(currentPassword || "", user.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }

  await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [bcrypt.hashSync(newPassword, 10), req.user.id]);
  res.status(204).end();
});

/* All routes below require authentication */
app.use("/api", auth);

/* ============================ SERVICES ============================ */
app.get("/api/services", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM services ORDER BY id");
  res.json(rows);
});

app.post("/api/services", requireAdmin, async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await pool.query("INSERT INTO services (name, price) VALUES ($1, $2) RETURNING *", [name, price]);
  res.status(201).json(rows[0]);
});

app.put("/api/services/:id", requireAdmin, async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await pool.query("UPDATE services SET name = $1, price = $2 WHERE id = $3 RETURNING *", [name, price, req.params.id]);
  res.json(rows[0]);
});

app.delete("/api/services/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM services WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

/* ============================ STAFF ============================ */
app.get("/api/staff", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM staff ORDER BY id");
  res.json(rows);
});

app.post("/api/staff", requireAdmin, async (req, res) => {
  const { name, short, init, role, since, rating, reviews, revenue, appts, color, specialties, phone, email, active, username, password } = req.body;

  if (!username) return res.status(400).json({ error: "Username cannot be empty." });
  if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const { rows: existingUser } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
  if (existingUser[0]) return res.status(409).json({ error: "Username is already taken." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: staffRows } = await client.query(
      `INSERT INTO staff (name, short, init, role, since, rating, reviews, revenue, appts, color, specialties, phone, email, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [name, short, init, role, since, rating, reviews, revenue, appts, color, JSON.stringify(specialties || []), phone, email, active]
    );
    const staff = staffRows[0];
    await client.query(
      "INSERT INTO users (username, password_hash, role, staff_id) VALUES ($1, $2, 'staff', $3)",
      [username, bcrypt.hashSync(password, 10), staff.id]
    );
    await client.query("COMMIT");
    res.status(201).json(staff);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
});

app.put("/api/staff/:id", async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM staff WHERE id = $1", [req.params.id]);
  if (!existingRows[0]) return res.status(404).end();
  const existing = existingRows[0];

  const isSelf = req.user.role === "staff" && String(req.user.staffId) === String(existing.id);
  if (req.user.role !== "admin" && !isSelf) return res.status(403).json({ error: "Forbidden" });

  const next = req.user.role === "admin"
    ? { ...existing, ...req.body }
    : { ...existing, phone: req.body.phone ?? existing.phone, email: req.body.email ?? existing.email, specialties: req.body.specialties ?? existing.specialties };

  const { rows } = await pool.query(
    `UPDATE staff SET name=$1, short=$2, init=$3, role=$4, since=$5, rating=$6, reviews=$7, revenue=$8, appts=$9, color=$10, specialties=$11, phone=$12, email=$13, active=$14
     WHERE id=$15 RETURNING *`,
    [next.name, next.short, next.init, next.role, next.since, next.rating, next.reviews, next.revenue, next.appts, next.color, JSON.stringify(next.specialties), next.phone, next.email, next.active, req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/staff/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM staff WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

app.put("/api/staff/:id/username", requireAdmin, async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username cannot be empty." });

  const { rows: existingUser } = await pool.query("SELECT id FROM users WHERE username = $1 AND staff_id <> $2", [username, req.params.id]);
  if (existingUser[0]) return res.status(409).json({ error: "Username is already taken." });

  const { rows } = await pool.query("UPDATE users SET username = $1 WHERE staff_id = $2 RETURNING username", [username, req.params.id]);
  if (!rows[0]) return res.status(404).end();
  res.json(rows[0]);
});

app.put("/api/staff/:id/reset-password", requireAdmin, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const { rowCount } = await pool.query("UPDATE users SET password_hash = $1 WHERE staff_id = $2", [bcrypt.hashSync(password, 10), req.params.id]);
  if (!rowCount) return res.status(404).end();
  res.status(204).end();
});

/* ============================ APPOINTMENTS ============================ */
app.get("/api/appointments", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM appointments ORDER BY date, time");
  res.json(rows);
});

app.post("/api/appointments", async (req, res) => {
  const { date, time, customer, phone, service, price, notes } = req.body;
  let assigned = req.body.assigned || [];
  let status = req.body.status || "pending";

  if (req.user.role !== "admin") {
    // Staff can only log a walk-in for themselves, not assign other barbers.
    const { rows: staffRows } = await pool.query("SELECT short FROM staff WHERE id = $1", [req.user.staffId]);
    const me = staffRows[0];
    if (!me) return res.status(403).json({ error: "Forbidden" });
    assigned = [me.short];
    status = "in_progress";
  }

  const { rows } = await pool.query(
    `INSERT INTO appointments (date, time, customer, phone, service, price, assigned, status, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [date, time, customer, phone, service, price, JSON.stringify(assigned), status, notes || ""]
  );
  res.status(201).json(rows[0]);
});

app.put("/api/appointments/:id", async (req, res) => {
  const { rows: existingRows } = await pool.query("SELECT * FROM appointments WHERE id = $1", [req.params.id]);
  if (!existingRows[0]) return res.status(404).end();
  const existing = existingRows[0];

  if (req.user.role !== "admin") {
    const { rows: staffRows } = await pool.query("SELECT short FROM staff WHERE id = $1", [req.user.staffId]);
    const mine = staffRows[0] && existing.assigned.includes(staffRows[0].short);
    if (!mine) return res.status(403).json({ error: "Forbidden" });
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid status." });
    const { rows } = await pool.query("UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *", [req.body.status, req.params.id]);
    return res.json(rows[0]);
  }

  const next = { ...existing, ...req.body };
  const { rows } = await pool.query(
    `UPDATE appointments SET date=$1, time=$2, customer=$3, phone=$4, service=$5, price=$6, assigned=$7, status=$8, notes=$9
     WHERE id=$10 RETURNING *`,
    [next.date, next.time, next.customer, next.phone, next.service, next.price, JSON.stringify(next.assigned), next.status, next.notes || "", req.params.id]
  );
  res.json(rows[0]);
});

app.delete("/api/appointments/:id", requireAdmin, async (req, res) => {
  await pool.query("DELETE FROM appointments WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
