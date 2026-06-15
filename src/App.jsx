import React, { useState, useEffect, useMemo } from "react";
import {
  Scissors, LayoutGrid, ClipboardList, CalendarDays, Users, DollarSign,
  BarChart3, Tag, Settings, LogOut, Eye, EyeOff, TrendingUp, Clock,
  UserRound, Plus, Search, Check, ChevronLeft, ChevronRight, Pencil,
  Trash2, Star, Phone, Mail, UserPlus, CheckCircle2, User, Menu, X,
} from "lucide-react";
import "./responsive.css";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, LineChart, Line, Legend, Tooltip,
} from "recharts";

/* ============================ THEME ============================ */
const C = {
  bg: "#0d0d0f",
  panel: "#16161a",
  panelAlt: "#1b1b20",
  card: "#141418",
  line: "#26262c",
  gold: "#d4af45",
  goldSoft: "#caa84a",
  text: "#f4f4f5",
  sub: "#8a8a93",
  faint: "#5d5d66",
  green: "#4ade80",
  red: "#f87171",
};
const API_BASE = import.meta.env.VITE_API_URL || "";
const mono = "'JetBrains Mono','SF Mono',ui-monospace,monospace";
const display = "'Oswald','Arial Narrow',sans-serif";
const body = "'Inter',system-ui,sans-serif";

/* ============================ DATE / TIME HELPERS ============================ */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad2 = n => String(n).padStart(2, "0");
const toDateStr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayStr = () => toDateStr(new Date());
const nowTimeStr = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const addDays = (d, n) => { const copy = new Date(d); copy.setDate(copy.getDate() + n); return copy; };

/* ============================ MOCK DATA ============================ */
const weeklyRevenue = [
  { day: "Mon", v: 420 }, { day: "Tue", v: 390 }, { day: "Wed", v: 560 },
  { day: "Thu", v: 490 }, { day: "Fri", v: 720 }, { day: "Sat", v: 1040 }, { day: "Sun", v: 610 },
];
const apptsPerDay = [
  { day: "Mon", v: 8 }, { day: "Tue", v: 7 }, { day: "Wed", v: 11 },
  { day: "Thu", v: 9 }, { day: "Fri", v: 14 }, { day: "Sat", v: 19 }, { day: "Sun", v: 12 },
];
const revenueTrend = [
  { m: "Jan", rev: 18500, net: 14200 }, { m: "Feb", rev: 16800, net: 13100 },
  { m: "Mar", rev: 23200, net: 17800 }, { m: "Apr", rev: 21500, net: 16400 },
  { m: "May", rev: 26100, net: 19600 }, { m: "Jun", rev: 19800, net: 14900 },
];

/* ============================ SMALL UI ============================ */
const Eyebrow = ({ children }) => (
  <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2, color: C.faint, textTransform: "uppercase", marginBottom: 6 }}>{children}</div>
);
const H1 = ({ children }) => (
  <h1 className="h1-resp" style={{ fontFamily: display, fontWeight: 700, letterSpacing: 1, color: C.text, margin: 0, textTransform: "uppercase", lineHeight: 1 }}>{children}</h1>
);
const Card = ({ children, style }) => (
  <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, padding: 22, ...style }}>{children}</div>
);
const Stat = ({ label, value, sub, subColor, icon }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1.5, color: C.sub, textTransform: "uppercase" }}>{label}</span>
      <span style={{ color: C.faint }}>{icon}</span>
    </div>
    <div style={{ fontFamily: display, fontWeight: 700, fontSize: 34, color: C.text, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ marginTop: 10, fontSize: 13, color: subColor || C.sub }}>{sub}</div>}
  </Card>
);
const Badge = ({ status }) => {
  const map = {
    completed: { c: C.green, bg: "rgba(74,222,128,.12)", t: "✓ COMPLETED" },
    assigned: { c: C.gold, bg: "rgba(212,175,69,.12)", t: "⏱ ASSIGNED" },
    pending: { c: C.red, bg: "rgba(248,113,113,.12)", t: "PENDING" },
    done: { c: C.green, bg: "rgba(74,222,128,.12)", t: "✓ Done" },
  };
  const s = map[status] || map.pending;
  return <span style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: 1, color: s.c, background: s.bg, padding: "4px 9px", borderRadius: 3, whiteSpace: "nowrap" }}>{s.t}</span>;
};
const GoldBtn = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ fontFamily: body, fontWeight: 600, fontSize: 14, color: "#1a1a1a", background: C.gold, border: "none", borderRadius: 4, padding: "11px 18px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, ...style }}>{children}</button>
);

/* ============================ SIDEBAR ============================ */
const NAV_ADMIN = [
  { k: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { k: "appointments", label: "Appointments", icon: ClipboardList },
  { k: "schedule", label: "Schedule", icon: CalendarDays },
  { k: "staff", label: "Staff", icon: Users },
  { k: "earnings", label: "Earnings", icon: DollarSign },
  { k: "analytics", label: "Analytics", icon: BarChart3 },
  { k: "pricing", label: "Pricing", icon: Tag },
];
const NAV_STAFF = [
  { k: "myDashboard", label: "My Dashboard", icon: LayoutGrid },
  { k: "mySchedule", label: "My Schedule", icon: CalendarDays },
  { k: "profile", label: "Profile", icon: User },
];

function Sidebar({ role, page, setPage, user, onLogout, open, onClose }) {
  const nav = role === "admin" ? NAV_ADMIN : NAV_STAFF;
  const go = k => { setPage(k); onClose(); };
  return (
    <aside className={`sidebar${open ? " open" : ""}`} style={{ width: 248, minWidth: 248, background: C.panel, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, background: C.gold, borderRadius: 4, display: "grid", placeItems: "center" }}>
          <Scissors size={20} color="#1a1a1a" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 18, letterSpacing: 1, color: C.text }}>CUTPRO</div>
          <div style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: 1.5, color: C.faint }}>{role === "admin" ? "ADMIN PANEL" : "STAFF PANEL"}</div>
        </div>
        <button onClick={onClose} className="sidebar-close" style={{ display: "none", background: "none", border: "none", color: C.sub, cursor: "pointer" }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 4, background: C.panelAlt, color: C.gold, fontFamily: mono, fontSize: 11, display: "grid", placeItems: "center", border: `1px solid ${C.line}` }}>{user.init}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{user.name}</div>
          <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: role === "admin" ? C.sub : C.gold }}>{role.toUpperCase()}</div>
        </div>
      </div>

      <nav style={{ padding: "14px 12px", flex: 1, overflowY: "auto" }}>
        {nav.map(({ k, label, icon: Icon }) => {
          const on = page === k;
          return (
            <button key={k} onClick={() => go(k)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "11px 14px",
              marginBottom: 4, background: on ? C.panelAlt : "transparent", border: "none",
              borderRadius: 4, cursor: "pointer", color: on ? C.gold : C.sub, fontFamily: body,
              fontSize: 14.5, fontWeight: on ? 600 : 400, position: "relative", textAlign: "left",
            }}>
              <Icon size={18} />
              {label}
              {on && <span style={{ position: "absolute", right: 10, width: 4, height: 16, background: C.gold, borderRadius: 2 }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px", borderTop: `1px solid ${C.line}` }}>
        {role === "admin" && (
          <button style={navBtnStyle}><Settings size={18} /> Settings</button>
        )}
        <button onClick={onLogout} style={navBtnStyle}><LogOut size={18} /> Log Out</button>
      </div>
    </aside>
  );
}
const navBtnStyle = { width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "11px 14px", background: "transparent", border: "none", cursor: "pointer", color: C.sub, fontFamily: body, fontSize: 14.5, textAlign: "left" };

/* ============================ LOGIN ============================ */
function Login({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if (u === "admin" && p === "admin123") return onLogin("admin");
    if (u === "jordan" && p === "pass123") return onLogin("staff");
    setErr("Username or password is incorrect.");
  };
  const field = { width: "100%", background: C.panelAlt, border: `1px solid ${C.line}`, borderRadius: 4, padding: "13px 15px", color: C.text, fontFamily: body, fontSize: 15, outline: "none", boxSizing: "border-box" };
  const lbl = { fontFamily: mono, fontSize: 11, letterSpacing: 1.5, color: C.sub, marginBottom: 8, display: "block" };

  return (
    <div style={{ minHeight: "100%", background: C.bg, display: "grid", gridTemplateColumns: "minmax(0,1fr)", placeItems: "center", padding: 24, boxSizing: "border-box" }}>
      <div style={{ width: 460, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ width: 70, height: 70, background: C.gold, borderRadius: 6, display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Scissors size={34} color="#1a1a1a" />
          </div>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: C.text }}>CUTPRO</div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 3, color: C.faint, marginTop: 4 }}>EMPLOYEE MANAGEMENT SYSTEM</div>
        </div>

        <Card style={{ padding: 30 }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, letterSpacing: 1, color: C.text, marginBottom: 22 }}>SIGN IN</div>
          <label style={lbl}>USERNAME</label>
          <input style={field} placeholder="Enter username" value={u} onChange={e => { setU(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} />
          <label style={{ ...lbl, marginTop: 18 }}>PASSWORD</label>
          <div style={{ position: "relative" }}>
            <input style={field} type={show ? "text" : "password"} placeholder="Enter password" value={p} onChange={e => { setP(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} />
            <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.sub }}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {err && <div style={{ color: C.red, fontSize: 13, marginTop: 12 }}>{err}</div>}
          <GoldBtn onClick={submit} style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "13px" }}>Sign In</GoldBtn>
        </Card>

        <Card style={{ marginTop: 18, padding: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: 2, color: C.faint, marginBottom: 14 }}>DEMO CREDENTIALS</div>
          {[["Admin", "admin / admin123"], ["Staff", "jordan / pass123"]].map(([r, c]) => (
            <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panelAlt, border: `1px solid ${C.line}`, borderRadius: 4, padding: "11px 14px", marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, color: C.text }}>{r}</span>
              <span style={{ fontFamily: mono, fontSize: 12.5, color: C.gold }}>{c}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ============================ CHART HELPERS ============================ */
const axis = { stroke: C.faint, fontSize: 11, fontFamily: mono };
const tipStyle = { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, fontFamily: mono, fontSize: 12 };

/* ============================ ADMIN: DASHBOARD ============================ */
function AdminDashboard({ appts, onNew }) {
  const now = new Date();
  const today = appts.filter(a => a.date === todayStr());
  return (
    <Page>
      <Row between>
        <div><Eyebrow>{WEEKDAYS[now.getDay()].toUpperCase()} — {MONTHS[now.getMonth()].toUpperCase()} {now.getDate()}, {now.getFullYear()}</Eyebrow><H1>Admin Dashboard</H1></div>
        <GoldBtn onClick={onNew}><Plus size={16} /> New Appointment</GoldBtn>
      </Row>
      <Grid4>
        <Stat label="Today's Revenue" value="RM 125" sub="4 completed" subColor={C.green} icon={<TrendingUp size={18} />} />
        <Stat label="Appointments" value="15" sub="3 pending" subColor={C.green} icon={<Scissors size={18} />} />
        <Stat label="Active Staff" value="6" sub="All on duty" subColor={C.green} icon={<Users size={18} />} />
        <Stat label="Avg. Wait Time" value="12 MIN" sub="Down from 18 min" subColor={C.green} icon={<Clock size={18} />} />
      </Grid4>

      <div className="charts-row">
        <Card>
          <Eyebrow>WEEKLY REVENUE</Eyebrow>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={weeklyRevenue}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.35} /><stop offset="100%" stopColor={C.gold} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="day" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Area type="monotone" dataKey="v" stroke={C.gold} strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Eyebrow>APPOINTMENTS / DAY</Eyebrow>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={apptsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="day" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(212,175,69,.06)" }} />
                <Bar dataKey="v" fill={C.gold} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 18, padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: `1px solid ${C.line}` }}>
          <Eyebrow>TODAY'S APPOINTMENTS — LIVE</Eyebrow>
          <Badge status="completed" />
        </div>
        <Table head={["TIME", "CUSTOMER", "SERVICE", "ASSIGNED TO", "STATUS", "PRICE"]}>
          {today.map(a => (
            <tr key={a.id} style={trStyle}>
              <Td mono>{a.time}</Td>
              <Td bold>{a.customer}</Td>
              <Td>{a.service}</Td>
              <Td sub>{a.assigned.join(", ") || "—"}</Td>
              <Td><Badge status={a.status} /></Td>
              <Td gold mono>RM {a.price}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </Page>
  );
}

/* ============================ ADMIN: APPOINTMENTS ============================ */
function Appointments({ appts, setAppts, onNew }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const total = appts.length;
  const pending = appts.filter(a => a.status === "pending").length;
  const assigned = appts.filter(a => a.status === "assigned").length;
  const revenue = appts.filter(a => a.status === "completed").reduce((s, a) => s + a.price, 0);
  const rows = appts.filter(a => (filter === "all" || a.status === filter) &&
    (a.customer.toLowerCase().includes(q.toLowerCase()) || a.phone.includes(q)));
  const del = id => {
    setAppts(p => p.filter(a => a.id !== id));
    fetch(`${API_BASE}/api/appointments/${id}`, { method: "DELETE" });
  };

  return (
    <Page>
      <Row between>
        <div><Eyebrow>ADMIN · APPOINTMENT MANAGEMENT</Eyebrow><H1>Appointments</H1></div>
        <GoldBtn onClick={onNew}><Plus size={16} /> New Appointment</GoldBtn>
      </Row>
      <Grid4>
        <Stat label="Total" value={total} />
        <Stat label="Pending" value={<span style={{ color: C.red }}>{pending}</span>} />
        <Stat label="Assigned" value={<span style={{ color: C.gold }}>{assigned}</span>} />
        <Stat label="Revenue (Done)" value={<span style={{ color: C.green }}>RM {revenue}</span>} />
      </Grid4>

      <div style={{ display: "flex", gap: 12, margin: "18px 0", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={16} color={C.faint} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or phone…" style={{ width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, padding: "12px 12px 12px 40px", color: C.text, fontFamily: body, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        {["all", "pending", "assigned", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: body, fontSize: 13.5, padding: "10px 18px", borderRadius: 4, cursor: "pointer", textTransform: "capitalize",
            border: `1px solid ${filter === f ? C.gold : C.line}`, background: filter === f ? C.gold : C.card, color: filter === f ? "#1a1a1a" : C.sub, fontWeight: filter === f ? 600 : 400,
          }}>{f}</button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <Table head={["DATE/TIME", "CUSTOMER", "SERVICE", "ASSIGNED TO", "STATUS", "PRICE", "ACTIONS"]}>
          {rows.map(a => (
            <tr key={a.id} style={trStyle}>
              <Td mono><div>{a.date}</div><div style={{ color: C.faint, fontSize: 12 }}>{a.time}</div></Td>
              <Td bold>{a.customer}<div style={{ fontFamily: mono, color: C.faint, fontSize: 12, fontWeight: 400 }}>{a.phone}</div></Td>
              <Td>{a.service}</Td>
              <Td sub>{a.assigned.join(", ") || "—"}</Td>
              <Td><Badge status={a.status} /></Td>
              <Td gold mono>RM {a.price}</Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <IconBtn><Pencil size={14} /></IconBtn>
                  <IconBtn onClick={() => del(a.id)}><Trash2 size={14} /></IconBtn>
                </div>
              </Td>
            </tr>
          ))}
          {rows.length === 0 && <tr><Td sub>No appointments match your search.</Td></tr>}
        </Table>
      </Card>
    </Page>
  );
}
const IconBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{ width: 30, height: 30, display: "grid", placeItems: "center", background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, color: C.sub, cursor: "pointer" }}>{children}</button>
);

/* ============================ ADMIN: SCHEDULE ============================ */
function Schedule({ appts }) {
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(new Date(), i)), []);
  const [sel, setSel] = useState(() => toDateStr(days[0]));
  const selDate = days.find(d => toDateStr(d) === sel) || days[0];
  const dayAppts = appts.filter(a => a.date === sel);
  const pending = dayAppts.filter(a => a.status === "pending").length;
  const assigned = dayAppts.filter(a => a.status === "assigned").length;
  const completed = dayAppts.filter(a => a.status === "completed").length;
  return (
    <Page>
      <Row between>
        <div><Eyebrow>ADMIN · SCHEDULE MANAGEMENT</Eyebrow><H1>Daily Schedule</H1></div>
        <div style={{ display: "flex", gap: 8 }}><IconBtn><ChevronLeft size={16} /></IconBtn><IconBtn><ChevronRight size={16} /></IconBtn></div>
      </Row>
      <div className="days-grid-6">
        {days.map(date => {
          const ds = toDateStr(date);
          const on = sel === ds;
          const count = appts.filter(a => a.date === ds).length;
          return (
            <button key={ds} onClick={() => setSel(ds)} style={{
              background: on ? C.gold : C.card, border: `1px solid ${on ? C.gold : C.line}`, borderRadius: 4, padding: "16px 8px", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: on ? "#1a1a1a" : C.sub }}>{WEEKDAYS_SHORT[date.getDay()]}</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 26, color: on ? "#1a1a1a" : C.text }}>{date.getDate()}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: on ? "#3a3320" : C.faint }}>{count} apts</div>
            </button>
          );
        })}
      </div>
      <Grid4 style={{ marginTop: 16 }}>
        <Stat label="Total" value={dayAppts.length} />
        <Stat label="Pending" value={<span style={{ color: C.red }}>{pending}</span>} />
        <Stat label="Assigned" value={<span style={{ color: C.gold }}>{assigned}</span>} />
        <Stat label="Completed" value={<span style={{ color: C.green }}>{completed}</span>} />
      </Grid4>

      <Card style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}>
          <Eyebrow>{WEEKDAYS_SHORT[selDate.getDay()].toUpperCase()} {MONTHS_SHORT[selDate.getMonth()].toUpperCase()} {selDate.getDate()} — APPOINTMENTS</Eyebrow>
        </div>
        <div>
          {dayAppts.map(a => (
            <div key={a.id} className="row-wrap" style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", borderBottom: `1px solid ${C.line}` }}>
              <div style={{ fontFamily: mono, fontSize: 15, color: C.text, width: 54 }}>{a.time}</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: C.text }}>{a.customer}</span><Badge status={a.status} />
                </div>
                <div style={{ color: C.sub, fontSize: 13 }}>{a.service} · RM{a.price} · {a.phone}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  {(a.assigned.length ? a.assigned : ["Unassigned"]).map(s => (
                    <span key={s} style={{ fontFamily: mono, fontSize: 11, color: C.gold, border: `1px solid ${C.line}`, background: C.panelAlt, padding: "4px 9px", borderRadius: 3 }}>{s}</span>
                  ))}
                </div>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 7, background: C.card, border: `1px solid ${C.line}`, color: C.text, borderRadius: 4, padding: "9px 16px", fontFamily: body, fontSize: 13, cursor: "pointer" }}><UserPlus size={15} /> Edit</button>
            </div>
          ))}
          {dayAppts.length === 0 && <div style={{ padding: 30, color: C.sub, textAlign: "center" }}>No appointments scheduled for this day.</div>}
        </div>
      </Card>
    </Page>
  );
}

/* ============================ ADMIN: STAFF ============================ */
function StaffPage({ staff }) {
  const [sel, setSel] = useState(staff[0]);
  return (
    <Page>
      <Eyebrow>TEAM MANAGEMENT</Eyebrow><H1>Staff</H1>
      <div className="staff-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {staff.map(s => {
            const on = sel.id === s.id;
            return (
              <button key={s.id} onClick={() => setSel(s)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: 16, cursor: "pointer", textAlign: "left",
                background: C.card, border: `1px solid ${on ? C.gold : C.line}`, borderRadius: 4,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 4, background: s.color + "22", color: s.color, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 13 }}>{s.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.text }}>{s.name}</div>
                  <div style={{ color: C.sub, fontSize: 13 }}>{s.role}</div>
                </div>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.active ? C.green : C.faint }} />
              </button>
            );
          })}
        </div>

        <Card>
          <Row between>
            <div style={{ display: "flex", gap: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: 4, background: sel.color + "22", color: sel.color, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 18 }}>{sel.init}</div>
              <div>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 28, color: C.text, textTransform: "uppercase" }}>{sel.name}</div>
                <div style={{ color: C.sub, fontSize: 14 }}>{sel.role} · Since {sel.since}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}><Star size={14} color={C.gold} fill={C.gold} /><span style={{ color: C.text, fontSize: 14 }}>{sel.rating}</span><span style={{ color: C.faint, fontSize: 13 }}>({sel.reviews} reviews)</span></div>
              </div>
            </div>
          </Row>
          <div className="grid-3" style={{ gap: 14, marginTop: 22 }}>
            <MiniStat icon={<TrendingUp size={14} />} label="MONTHLY REVENUE" value={`$${sel.revenue.toLocaleString()}`} />
            <MiniStat icon={<Scissors size={14} />} label="APPOINTMENTS" value={sel.appts} />
            <MiniStat icon={<Star size={14} />} label="RATING" value={`${sel.rating} / 5.0`} />
          </div>
          <div style={{ marginTop: 24 }}>
            <Eyebrow>SPECIALTIES</Eyebrow>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {sel.specialties.map(sp => <Pill key={sp}>{sp}</Pill>)}
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Eyebrow>CONTACT</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ color: C.text, display: "flex", gap: 10, alignItems: "center" }}><Phone size={15} color={C.faint} /> {sel.phone}</span>
              <span style={{ color: C.text, display: "flex", gap: 10, alignItems: "center" }}><Mail size={15} color={C.faint} /> {sel.email}</span>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 24, paddingTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <GoldBtn>Edit Profile</GoldBtn>
            <OutlineBtn>View Schedule</OutlineBtn>
            <OutlineBtn>Pay History</OutlineBtn>
          </div>
        </Card>
      </div>
    </Page>
  );
}
const MiniStat = ({ icon, label, value }) => (
  <div style={{ background: C.panelAlt, border: `1px solid ${C.line}`, borderRadius: 4, padding: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.sub, fontFamily: mono, fontSize: 10.5, letterSpacing: 1, marginBottom: 10 }}>{icon}{label}</div>
    <div style={{ fontFamily: display, fontWeight: 700, fontSize: 24, color: C.text }}>{value}</div>
  </div>
);
const Pill = ({ children }) => <span style={{ border: `1px solid ${C.line}`, background: C.panelAlt, color: C.text, fontSize: 13, padding: "7px 14px", borderRadius: 4 }}>{children}</span>;
const OutlineBtn = ({ children }) => <button style={{ background: C.card, border: `1px solid ${C.line}`, color: C.text, borderRadius: 4, padding: "11px 18px", fontFamily: body, fontSize: 14, cursor: "pointer" }}>{children}</button>;

/* ============================ ADMIN: EARNINGS ============================ */
function Earnings({ staff }) {
  const monthName = MONTHS[new Date().getMonth()];
  const payroll = staff.map(s => ({
    name: s.short, cuts: s.appts, gross: s.revenue, rate: s.role === "Senior Barber" ? 60 : s.role === "Master Barber" ? 55 : s.role === "Apprentice" ? 40 : 50,
  })).map(p => ({ ...p, payout: Math.round(p.gross * p.rate / 100) }));
  return (
    <Page>
      <Eyebrow>FINANCIAL OVERVIEW</Eyebrow><H1>Earnings</H1>
      <Grid4 style={{ marginTop: 18 }}>
        <Stat label={`${monthName} Revenue`} value="$19,800" sub="To date" />
        <Stat label="Shop Net" value="$8,961" sub="After commissions" />
        <Stat label="Commissions Paid" value="$10,839" sub="To staff" />
        <Stat label="Avg Per Client" value="$38.50" sub="This month" />
      </Grid4>

      <div className="charts-row-wide">
        <Card>
          <Eyebrow>6-MONTH REVENUE TREND</Eyebrow>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="m" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip contentStyle={tipStyle} formatter={v => `$${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontFamily: mono, fontSize: 12 }} />
                <Line name="Revenue" type="monotone" dataKey="rev" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold }} />
                <Line name="Net" type="monotone" dataKey="net" stroke={C.green} strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4, fill: C.green }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Eyebrow>REVENUE SHARE</Eyebrow>
          <div style={{ marginTop: 8 }}>
            {staff.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, color: C.text, fontSize: 14 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />{s.short}</span>
                <span style={{ fontFamily: mono, color: C.text }}>${s.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}><Eyebrow>{monthName.toUpperCase()} PAYROLL SUMMARY</Eyebrow></div>
        <Table head={["BARBER", "CUTS", "GROSS", "COMMISSION RATE", "PAYOUT", "STATUS"]}>
          {payroll.map(p => (
            <tr key={p.name} style={trStyle}>
              <Td bold>{p.name}</Td><Td mono>{p.cuts}</Td><Td mono>${p.gross.toLocaleString()}</Td>
              <Td sub>{p.rate}%</Td><Td gold mono>${p.payout.toLocaleString()}</Td>
              <Td><Badge status="completed" /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </Page>
  );
}

/* ============================ ADMIN: ANALYTICS ============================ */
function Analytics() {
  const svc = [
    { name: "Skin Fade", n: 42 }, { name: "Haircut", n: 38 }, { name: "Haircut + Wash", n: 29 },
    { name: "Full Service", n: 21 }, { name: "Beard Trim", n: 18 }, { name: "Hair Coloring", n: 9 },
  ];
  return (
    <Page>
      <Eyebrow>PERFORMANCE INSIGHTS</Eyebrow><H1>Analytics</H1>
      <Grid4 style={{ marginTop: 18 }}>
        <Stat label="Total Clients" value="1,284" sub="+8% vs last month" subColor={C.green} icon={<Users size={18} />} />
        <Stat label="Retention Rate" value="71%" sub="Returning clients" subColor={C.green} icon={<TrendingUp size={18} />} />
        <Stat label="Busiest Day" value="SAT" sub="19 avg appointments" icon={<CalendarDays size={18} />} />
        <Stat label="Peak Hour" value="14:00" sub="Most bookings" icon={<Clock size={18} />} />
      </Grid4>
      <div className="charts-row-even">
        <Card>
          <Eyebrow>TOP SERVICES (THIS MONTH)</Eyebrow>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={svc} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} horizontal={false} />
                <XAxis type="number" {...axis} tickLine={false} />
                <YAxis type="category" dataKey="name" {...axis} width={100} tickLine={false} />
                <Tooltip contentStyle={tipStyle} cursor={{ fill: "rgba(212,175,69,.06)" }} />
                <Bar dataKey="n" fill={C.gold} radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Eyebrow>WEEKLY APPOINTMENT VOLUME</Eyebrow>
          <div style={{ height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={apptsPerDay}>
                <defs><linearGradient id="vol" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={0.3} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                <XAxis dataKey="day" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Area type="monotone" dataKey="v" stroke={C.green} strokeWidth={2.5} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </Page>
  );
}

/* ============================ ADMIN: PRICING ============================ */
function Pricing({ services, setServices }) {
  const avg = Math.round(services.reduce((s, x) => s + x.price, 0) / services.length);
  const del = id => {
    setServices(p => p.filter(s => s.id !== id));
    fetch(`${API_BASE}/api/services/${id}`, { method: "DELETE" });
  };
  const add = () => {
    const name = prompt("Service name?");
    if (!name) return;
    const price = parseInt(prompt("Price (RM)?") || "0", 10);
    fetch(`${API_BASE}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    })
      .then(r => r.json())
      .then(created => setServices(p => [...p, created]));
  };
  return (
    <Page>
      <Row between>
        <div><Eyebrow>ADMIN · REVENUE PRICING</Eyebrow><H1>Service Pricing</H1></div>
        <GoldBtn onClick={add}><Plus size={16} /> Add Service</GoldBtn>
      </Row>
      <div style={{ background: "rgba(212,175,69,.07)", border: `1px solid ${C.gold}55`, borderRadius: 4, padding: "14px 18px", margin: "16px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <Tag size={16} color={C.gold} />
        <span style={{ color: C.sub, fontSize: 13.5 }}>These prices are used across the system for revenue calculations and appointment creation. Changes take effect immediately.</span>
      </div>
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}>
          <Eyebrow>SERVICE PRICE LIST — {services.length} SERVICES</Eyebrow>
          <span style={{ fontFamily: mono, fontSize: 11, color: C.faint }}>AVG RM {avg}</span>
        </div>
        {services.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 38, height: 38, borderRadius: 4, background: C.panelAlt, display: "grid", placeItems: "center" }}><Tag size={16} color={C.gold} /></div>
            <span style={{ flex: 1, color: C.text, fontSize: 15.5 }}>{s.name}</span>
            <span style={{ fontFamily: display, fontWeight: 700, color: C.gold, fontSize: 19 }}>RM {s.price}</span>
            <IconBtn><Pencil size={14} /></IconBtn>
            <IconBtn onClick={() => del(s.id)}><Trash2 size={14} /></IconBtn>
          </div>
        ))}
      </Card>
    </Page>
  );
}

/* ============================ STAFF: DASHBOARD ============================ */
function StaffDashboard({ appts, setAppts, user }) {
  const now = new Date();
  const mine = appts.filter(a => a.assigned.includes(user.short) && a.date === todayStr());
  const done = mine.filter(a => a.status === "completed");
  const upcoming = mine.filter(a => a.status !== "completed");
  const markDone = id => {
    setAppts(p => p.map(a => a.id === id ? { ...a, status: "completed" } : a));
    fetch(`${API_BASE}/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
  };
  return (
    <Page>
      <Eyebrow>{WEEKDAYS[now.getDay()].toUpperCase()} — {MONTHS[now.getMonth()].toUpperCase()} {now.getDate()}, {now.getFullYear()}</Eyebrow>
      <H1>Good Day, {user.name.split(" ")[0]}</H1>
      <div className="grid-3" style={{ gap: 18, marginTop: 18 }}>
        <Stat label="Total Today" value={mine.length} sub="appointments assigned" />
        <Stat label="Completed" value={<span style={{ color: C.gold }}>{done.length}</span>} sub="customers served today" />
        <Stat label="Remaining" value={<span style={{ color: C.gold }}>{upcoming.length}</span>} sub="to go" />
      </div>

      <div style={{ marginTop: 26 }}><Eyebrow>UPCOMING / IN PROGRESS</Eyebrow></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {upcoming.map(a => (
          <Card key={a.id} className="row-wrap" style={{ display: "flex", alignItems: "center", gap: 20, padding: 20 }}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 26, color: C.text }}>{a.time}</div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontWeight: 700, color: C.text }}>{a.customer}</span><Badge status={a.status} /></div>
              <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{a.service} · RM {a.price}</div>
            </div>
            <GoldBtn onClick={() => markDone(a.id)}><Check size={16} /> Mark Done</GoldBtn>
          </Card>
        ))}
        {upcoming.length === 0 && <Card><span style={{ color: C.sub }}>All done for today. Nice work.</span></Card>}
      </div>

      <div style={{ marginTop: 26 }}><Eyebrow>COMPLETED TODAY</Eyebrow></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {done.map(a => (
          <Card key={a.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: 18, opacity: 0.75 }}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, color: C.faint }}>{a.time}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: C.sub }}>{a.customer}</div><div style={{ color: C.faint, fontSize: 13 }}>{a.service}</div></div>
            <span style={{ fontFamily: mono, fontSize: 13, color: C.green, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={15} /> DONE · RM {a.price}</span>
          </Card>
        ))}
        {done.length === 0 && <Card><span style={{ color: C.sub }}>No completed appointments yet.</span></Card>}
      </div>
    </Page>
  );
}

/* ============================ STAFF: SCHEDULE ============================ */
function MySchedule({ appts, user }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);
  const [sel, setSel] = useState(() => toDateStr(days[0]));
  const selDate = days.find(d => toDateStr(d) === sel) || days[0];
  const mine = appts.filter(a => a.assigned.includes(user.short) && a.date === sel);
  const jobCount = ds => appts.filter(a => a.assigned.includes(user.short) && a.date === ds).length;
  return (
    <Page>
      <Row between>
        <div><Eyebrow>MY SCHEDULE</Eyebrow><H1>Week of {MONTHS_SHORT[days[0].getMonth()]} {days[0].getDate()}</H1></div>
        <div style={{ display: "flex", gap: 8 }}><IconBtn><ChevronLeft size={16} /></IconBtn><IconBtn><ChevronRight size={16} /></IconBtn></div>
      </Row>
      <div className="days-grid-7">
        {days.map(date => {
          const ds = toDateStr(date);
          const on = sel === ds;
          const j = jobCount(ds);
          return (
            <button key={ds} onClick={() => setSel(ds)} style={{ background: on ? C.gold : C.card, border: `1px solid ${on ? C.gold : C.line}`, borderRadius: 4, padding: "16px 6px", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: on ? "#1a1a1a" : C.sub }}>{WEEKDAYS_SHORT[date.getDay()]}</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 24, color: on ? "#1a1a1a" : C.text }}>{date.getDate()}</div>
              <div style={{ fontFamily: mono, fontSize: 10.5, color: on ? "#3a3320" : C.faint }}>{j ? `${j} job${j > 1 ? "s" : ""}` : "—"}</div>
            </button>
          );
        })}
      </div>

      <Row between style={{ marginTop: 22 }}>
        <span style={{ fontFamily: mono, fontSize: 13, letterSpacing: 1, color: C.sub }}>{WEEKDAYS_SHORT[selDate.getDay()].toUpperCase()} · {MONTHS_SHORT[selDate.getMonth()].toUpperCase()} {selDate.getDate()}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.gold, border: `1px solid ${C.line}`, background: C.panelAlt, padding: "5px 11px", borderRadius: 3 }}>{mine.length} APPOINTMENTS</span>
      </Row>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
        {mine.map((a, i) => (
          <div key={a.id} className="row-wrap" style={{ display: "flex", alignItems: "center", gap: 18, background: C.card, border: `1px solid ${C.line}`, borderLeft: `3px solid ${a.status === "completed" ? C.green : C.gold}`, borderRadius: 4, padding: "18px 20px" }}>
            <div style={{ width: 30, height: 30, borderRadius: 4, background: C.panelAlt, color: C.sub, fontFamily: mono, fontSize: 12, display: "grid", placeItems: "center" }}>{i + 1}</div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, color: C.text, width: 70 }}>{a.time}</div>
            <div style={{ flex: 1, minWidth: 160 }}><div style={{ fontWeight: 700, color: C.text }}>{a.customer}</div><div style={{ color: C.sub, fontSize: 13 }}>{a.service} · RM {a.price}</div></div>
            <Badge status={a.status} />
          </div>
        ))}
        {mine.length === 0 && <Card><span style={{ color: C.sub }}>No jobs scheduled for this day.</span></Card>}
      </div>

      <Card style={{ marginTop: 22, padding: 20 }}>
        <Eyebrow>WEEK OVERVIEW</Eyebrow>
        <div className="days-grid-7" style={{ marginTop: 0 }}>
          {days.map(date => {
            const j = jobCount(toDateStr(date));
            return (
              <div key={toDateStr(date)} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: mono, fontSize: 11, color: C.sub, marginBottom: 6 }}>{WEEKDAYS_SHORT[date.getDay()]}</div>
                <div style={{ background: j ? "rgba(212,175,69,.12)" : C.panelAlt, border: `1px solid ${C.line}`, borderRadius: 4, padding: "14px 0", fontFamily: display, fontWeight: 700, fontSize: 20, color: j ? C.gold : C.faint }}>{j || "—"}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </Page>
  );
}

/* ============================ STAFF: PROFILE ============================ */
function Profile({ appts, user, staff }) {
  const mine = appts.filter(a => a.assigned.includes(user.short));
  const completed = mine.filter(a => a.status === "completed");
  const todayDone = mine.filter(a => a.status === "completed" && a.date === todayStr());
  const contribution = todayDone.reduce((s, a) => s + a.price, 0);
  const me = staff.find(s => s.short === user.short) || staff[0];
  return (
    <Page>
      <Eyebrow>STAFF · MY PROFILE</Eyebrow><H1>Profile</H1>
      <Card style={{ marginTop: 18 }}>
        <Row between>
          <div style={{ display: "flex", gap: 18 }}>
            <div style={{ width: 80, height: 80, borderRadius: 4, background: me.color + "22", color: me.color, display: "grid", placeItems: "center", fontFamily: mono, fontSize: 22 }}>{me.init}</div>
            <div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: 28, color: C.text, textTransform: "uppercase" }}>{user.name}</div>
              <div style={{ color: C.sub, fontSize: 14, marginBottom: 12 }}>Barber · Since {me.since} · Staff ID #{me.id}</div>
              <div style={{ display: "flex", gap: 10 }}>{me.specialties.map(s => <Pill key={s}>{s}</Pill>)}</div>
            </div>
          </div>
          <OutlineBtn>Edit Profile</OutlineBtn>
        </Row>
      </Card>
      <Grid4 style={{ marginTop: 18 }}>
        <Stat label="Total Appointments" value={mine.length} icon={<CalendarDays size={16} />} />
        <Stat label="Completed" value={completed.length} icon={<CheckCircle2 size={16} />} />
        <Stat label="Today Done" value={todayDone.length} icon={<Scissors size={16} />} />
        <Stat label="Total Contribution" value={`RM ${contribution}`} icon={<Star size={16} />} />
      </Grid4>
      <Card style={{ marginTop: 18 }}>
        <Eyebrow>ACCOUNT INFO</Eyebrow>
        <div className="info-grid">
          <Info label="USERNAME" value="jordan" />
          <Info label="ROLE" value="Staff / Barber" />
          <Info label="PHONE" value={me.phone} />
          <Info label="EMAIL" value={me.email} />
          <Info label="STATUS" value="Active" />
          <Info label="HIRE DATE" value={me.since} />
        </div>
      </Card>
    </Page>
  );
}
const Info = ({ label, value }) => (
  <div><div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 1, color: C.faint, marginBottom: 5 }}>{label}</div><div style={{ color: C.text, fontSize: 15 }}>{value}</div></div>
);

/* ============================ NEW APPOINTMENT MODAL ============================ */
function NewApptModal({ services, staff, onClose, onSave }) {
  const [f, setF] = useState({ customer: "", phone: "", service: services[0].name, time: nowTimeStr(), assigned: staff[0].short });
  const price = services.find(s => s.name === f.service)?.price || 0;
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const field = { width: "100%", background: C.panelAlt, border: `1px solid ${C.line}`, borderRadius: 4, padding: "11px 13px", color: C.text, fontFamily: body, fontSize: 14, outline: "none", boxSizing: "border-box" };
  const lbl = { fontFamily: mono, fontSize: 11, letterSpacing: 1, color: C.sub, marginBottom: 6, display: "block" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: 26, boxSizing: "border-box" }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: 22, color: C.text, marginBottom: 20, textTransform: "uppercase" }}>New Appointment</div>
        <label style={lbl}>CUSTOMER NAME</label>
        <input style={field} value={f.customer} onChange={e => set("customer", e.target.value)} placeholder="e.g. James Lee" />
        <label style={{ ...lbl, marginTop: 14 }}>PHONE</label>
        <input style={field} value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="012-3456789" />
        <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>SERVICE</label>
            <select style={field} value={f.service} onChange={e => set("service", e.target.value)}>
              {services.map(s => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ width: 110 }}><label style={lbl}>TIME</label><input style={field} value={f.time} onChange={e => set("time", e.target.value)} /></div>
        </div>
        <label style={{ ...lbl, marginTop: 14 }}>ASSIGN TO</label>
        <select style={field} value={f.assigned} onChange={e => set("assigned", e.target.value)}>
          {staff.map(s => <option key={s.id}>{s.short}</option>)}
        </select>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          <span style={{ color: C.sub, fontSize: 14 }}>Price: <span style={{ color: C.gold, fontFamily: mono }}>RM {price}</span></span>
          <div style={{ display: "flex", gap: 10 }}>
            <OutlineBtn onClick={onClose}>Cancel</OutlineBtn>
            <GoldBtn onClick={() => { if (f.customer) { onSave({ ...f, price }); onClose(); } }}>Create</GoldBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ LAYOUT PRIMITIVES ============================ */
const Page = ({ children }) => <div className="page-resp">{children}</div>;
const Row = ({ children, between, style }) => <div style={{ display: "flex", alignItems: "center", justifyContent: between ? "space-between" : "flex-start", flexWrap: "wrap", gap: 12, ...style }}>{children}</div>;
const Grid4 = ({ children, style }) => <div className="grid-4" style={style}>{children}</div>;
const Grid3 = ({ children, style }) => <div className="grid-3" style={style}>{children}</div>;
const Table = ({ head, children }) => (
  <div className="table-scroll">
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
      <thead><tr>{head.map(h => <th key={h} style={{ textAlign: "left", padding: "14px 22px", fontFamily: mono, fontSize: 11, letterSpacing: 1, color: C.faint, fontWeight: 400, borderBottom: `1px solid ${C.line}` }}>{h}</th>)}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);
const trStyle = { borderBottom: `1px solid ${C.line}` };
const Td = ({ children, bold, sub, gold, mono: m }) => (
  <td style={{ padding: "16px 22px", fontSize: 14, fontFamily: m ? mono : body, fontWeight: bold ? 700 : 400, color: gold ? C.gold : sub ? C.sub : C.text }}>{children}</td>
);

/* ============================ ROOT ============================ */
export default function App() {
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [appts, setAppts] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/appointments`).then(r => r.json()).then(setAppts),
      fetch(`${API_BASE}/api/services`).then(r => r.json()).then(setServices),
      fetch(`${API_BASE}/api/staff`).then(r => r.json()).then(setStaff),
    ]).then(() => setLoaded(true));
  }, []);

  const user = role === "admin"
    ? { name: "Admin", init: "AD", short: "Admin" }
    : { name: "Jordan T.", init: "JO", short: "Jordan T." };

  const login = r => { setRole(r); setPage(r === "admin" ? "dashboard" : "myDashboard"); };
  const logout = () => { setRole(null); };

  const addAppt = data => {
    fetch(`${API_BASE}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayStr(), time: data.time, customer: data.customer,
        phone: data.phone, service: data.service, price: data.price,
        assigned: [data.assigned], status: "assigned",
      }),
    })
      .then(r => r.json())
      .then(created => setAppts(p => [...p, created]));
  };

  if (!role) return <Shell><Login onLogin={login} /></Shell>;

  if (!loaded) return (
    <Shell>
      <div style={{ minHeight: "100%", display: "grid", placeItems: "center", color: C.sub, fontFamily: mono, fontSize: 13, letterSpacing: 1 }}>
        LOADING…
      </div>
    </Shell>
  );

  const view = {
    dashboard: <AdminDashboard appts={appts} onNew={() => setModal(true)} />,
    appointments: <Appointments appts={appts} setAppts={setAppts} onNew={() => setModal(true)} />,
    schedule: <Schedule appts={appts} />,
    staff: <StaffPage staff={staff} />,
    earnings: <Earnings staff={staff} />,
    analytics: <Analytics />,
    pricing: <Pricing services={services} setServices={setServices} />,
    myDashboard: <StaffDashboard appts={appts} setAppts={setAppts} user={user} />,
    mySchedule: <MySchedule appts={appts} user={user} />,
    profile: <Profile appts={appts} user={user} staff={staff} />,
  }[page];

  return (
    <Shell>
      <div className="app-shell">
        <Sidebar role={role} page={page} setPage={setPage} user={user} onLogout={logout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <main className="main-content" style={{ background: C.bg }}>
          <div className="mobile-topbar" style={{ alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: `1px solid ${C.line}`, background: C.panel }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: C.text, cursor: "pointer", display: "flex" }}>
              <Menu size={22} />
            </button>
            <div style={{ width: 30, height: 30, background: C.gold, borderRadius: 4, display: "grid", placeItems: "center" }}>
              <Scissors size={16} color="#1a1a1a" />
            </div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 16, letterSpacing: 1, color: C.text }}>CUTPRO</div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, transparent 60%)` }} />
          {view}
        </main>
        {modal && services.length > 0 && staff.length > 0 && <NewApptModal services={services} staff={staff} onClose={() => setModal(false)} onSave={addAppt} />}
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ height: "100vh", background: C.bg, color: C.text, fontFamily: body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 5px; }
        select option { background: ${C.panel}; }
        button:focus-visible, input:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 1px; }
      `}</style>
      {children}
    </div>
  );
}
