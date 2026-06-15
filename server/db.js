import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(process.env.DB_PATH || path.join(__dirname, "cutpro.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short TEXT NOT NULL,
    init TEXT NOT NULL,
    role TEXT NOT NULL,
    since TEXT NOT NULL,
    rating REAL NOT NULL,
    reviews INTEGER NOT NULL,
    revenue INTEGER NOT NULL,
    appts INTEGER NOT NULL,
    color TEXT NOT NULL,
    specialties TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    active INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    customer TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    price INTEGER NOT NULL,
    assigned TEXT NOT NULL,
    status TEXT NOT NULL
  );
`);

const seedIfEmpty = (table, rows, insertSql, mapRow) => {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
  if (count > 0) return;
  const stmt = db.prepare(insertSql);
  const insertAll = db.transaction(items => {
    for (const item of items) stmt.run(mapRow(item));
  });
  insertAll(rows);
};

const SERVICES = [
  { id: 1, name: "Haircut", price: 20 },
  { id: 2, name: "Haircut + Wash", price: 30 },
  { id: 3, name: "Skin Fade", price: 25 },
  { id: 4, name: "Beard Trim", price: 10 },
  { id: 5, name: "Hair Coloring", price: 80 },
  { id: 6, name: "Full Service", price: 50 },
  { id: 7, name: "Line-up / Design", price: 15 },
  { id: 8, name: "Kids Cut", price: 18 },
];

const STAFF = [
  { id: 1, name: "Jordan Thompson", short: "Jordan T.", init: "JT", role: "Senior Barber", since: "Mar 2021", rating: 4.9, reviews: 312, revenue: 4820, appts: 127, color: "#d4af45", specialties: ["Skin Fade", "Beard Design", "Line-ups"], phone: "(555) 012-3456", email: "jordan@cutpro.com", active: true },
  { id: 2, name: "Alex Rivera", short: "Alex R.", init: "AR", role: "Master Barber", since: "Jan 2020", rating: 4.8, reviews: 280, revenue: 4450, appts: 119, color: "#6f9bff", specialties: ["Classic Cut", "Hot Towel Shave"], phone: "(555) 012-7788", email: "alex@cutpro.com", active: true },
  { id: 3, name: "Marcus Barnes", short: "Marcus B.", init: "MB", role: "Barber", since: "Jun 2022", rating: 4.7, reviews: 190, revenue: 3680, appts: 98, color: "#b27dff", specialties: ["Fades", "Coloring"], phone: "(555) 012-2211", email: "marcus@cutpro.com", active: true },
  { id: 4, name: "Devon Sanders", short: "Devon S.", init: "DS", role: "Barber", since: "Sep 2022", rating: 4.6, reviews: 150, revenue: 3120, appts: 84, color: "#34d399", specialties: ["Beard Trim", "Kids Cut"], phone: "(555) 012-9090", email: "devon@cutpro.com", active: true },
  { id: 5, name: "Carlos Martinez", short: "Carlos M.", init: "CM", role: "Barber", since: "Feb 2023", rating: 4.5, reviews: 110, revenue: 2780, appts: 73, color: "#f87171", specialties: ["Line-ups", "Designs"], phone: "(555) 012-4545", email: "carlos@cutpro.com", active: true },
  { id: 6, name: "Tyrell Washington", short: "Tyrell W.", init: "TW", role: "Apprentice", since: "Nov 2024", rating: 4.3, reviews: 40, revenue: 1540, appts: 38, color: "#8a8a93", specialties: ["Haircut"], phone: "(555) 012-3232", email: "tyrell@cutpro.com", active: false },
];

const APPOINTMENTS = [
  { id: 1, date: "2026-06-09", time: "10:00", customer: "Amir Hassan", phone: "013-9012345", service: "Full Service", price: 50, assigned: ["Jordan T.", "Alex R."], status: "completed" },
  { id: 2, date: "2026-06-09", time: "14:00", customer: "Farid Yusof", phone: "014-0123456", service: "Haircut", price: 20, assigned: ["Marcus B."], status: "completed" },
  { id: 3, date: "2026-06-10", time: "09:00", customer: "Marcus Webb", phone: "012-3456789", service: "Skin Fade", price: 25, assigned: ["Jordan T."], status: "completed" },
  { id: 4, date: "2026-06-10", time: "09:30", customer: "Darius King", phone: "013-2345678", service: "Beard Trim", price: 10, assigned: ["Alex R."], status: "completed" },
  { id: 5, date: "2026-06-10", time: "10:00", customer: "Terrell Nash", phone: "014-3456789", service: "Haircut + Wash", price: 30, assigned: ["Jordan T."], status: "assigned" },
  { id: 6, date: "2026-06-10", time: "10:30", customer: "Isaiah Cole", phone: "015-4567890", service: "Haircut", price: 20, assigned: ["Marcus B."], status: "assigned" },
  { id: 7, date: "2026-06-10", time: "11:00", customer: "Quincy Adams", phone: "016-5678901", service: "Skin Fade", price: 25, assigned: ["Devon S."], status: "assigned" },
  { id: 8, date: "2026-06-10", time: "11:30", customer: "Leon Pierce", phone: "017-6789012", service: "Hair Coloring", price: 80, assigned: ["Marcus B."], status: "assigned" },
  { id: 9, date: "2026-06-10", time: "13:00", customer: "Omar Diaz", phone: "018-7890123", service: "Line-up / Design", price: 15, assigned: ["Carlos M."], status: "assigned" },
  { id: 10, date: "2026-06-10", time: "14:30", customer: "Noah Baker", phone: "019-8901234", service: "Full Service", price: 50, assigned: ["Jordan T."], status: "assigned" },
  { id: 11, date: "2026-06-10", time: "15:00", customer: "Caleb Stone", phone: "012-1112233", service: "Haircut", price: 20, assigned: ["Alex R."], status: "assigned" },
  { id: 12, date: "2026-06-10", time: "15:30", customer: "Ethan Brooks", phone: "013-4445566", service: "Beard Trim", price: 10, assigned: ["Devon S."], status: "pending" },
  { id: 13, date: "2026-06-10", time: "16:00", customer: "Mason Reed", phone: "014-7778899", service: "Skin Fade", price: 25, assigned: [], status: "pending" },
  { id: 14, date: "2026-06-10", time: "16:30", customer: "Logan Hayes", phone: "015-0001122", service: "Haircut + Wash", price: 30, assigned: [], status: "pending" },
  { id: 15, date: "2026-06-11", time: "10:00", customer: "Aiden Cruz", phone: "016-3334455", service: "Haircut", price: 20, assigned: ["Carlos M."], status: "assigned" },
];

seedIfEmpty(
  "services",
  SERVICES,
  "INSERT INTO services (id, name, price) VALUES (@id, @name, @price)",
  s => s
);

seedIfEmpty(
  "staff",
  STAFF,
  `INSERT INTO staff (id, name, short, init, role, since, rating, reviews, revenue, appts, color, specialties, phone, email, active)
   VALUES (@id, @name, @short, @init, @role, @since, @rating, @reviews, @revenue, @appts, @color, @specialties, @phone, @email, @active)`,
  s => ({ ...s, specialties: JSON.stringify(s.specialties), active: s.active ? 1 : 0 })
);

seedIfEmpty(
  "appointments",
  APPOINTMENTS,
  `INSERT INTO appointments (id, date, time, customer, phone, service, price, assigned, status)
   VALUES (@id, @date, @time, @customer, @phone, @service, @price, @assigned, @status)`,
  a => ({ ...a, assigned: JSON.stringify(a.assigned) })
);

export default db;
