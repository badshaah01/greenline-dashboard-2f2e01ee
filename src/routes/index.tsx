import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Greenline Associates — Operations Dashboard" },
      { name: "description", content: "Enterprise operations dashboard for Greenline Associates." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
});

// ─── DATA ──────────────────────────────────────────────
type Milestone = { name: string; amount: number; date: string; status: "done" | "overdue" | "upcoming" };
type Category = { name: string; budget: number; spent: number };
type Material = { name: string; unit: string; dispatched: number; accounted: number; vendor: string };
type Vendor = { name: string; invoice: string; date: string; due: string; amount: number; status: "paid" | "due" | "overdue" };
type Salary = { name: string; role: string; amount: number; month: string; paid: boolean };
type Petty = { date: string; desc: string; amount: number; flag: "ok" | "warn" | "risk" };
type Project = {
  id: number; name: string; client: string; location: string;
  status: "healthy" | "warning" | "danger"; statusLabel: string; stage: string;
  startDate: string; endDate: string; contractValue: number; received: number; spent: number;
  completion: number; alertMsg: string; alertType: "safe" | "warning" | "danger";
  milestones: Milestone[]; categories: Category[]; materials: Material[];
  vendors: Vendor[]; salary: Salary[]; pettyCash: Petty[];
};

const projects: Project[] = [
  {
    id: 0, name: "Zara — Orion Mall", client: "Zara India Pvt Ltd", location: "Orion Mall, Bengaluru",
    status: "healthy", statusLabel: "On Track", stage: "Execution",
    startDate: "10 Jan 2025", endDate: "30 Jun 2025",
    contractValue: 3800000, received: 2280000, spent: 1820000, completion: 62,
    alertMsg: "All systems healthy", alertType: "safe",
    milestones: [
      { name: "Advance (30%)", amount: 1140000, date: "15 Jan 2025", status: "done" },
      { name: "Mobilisation & Demolition", amount: 570000, date: "10 Feb 2025", status: "done" },
      { name: "First Fix (Civil + Electrical)", amount: 760000, date: "20 Mar 2025", status: "done" },
      { name: "Second Fix & Finishing", amount: 760000, date: "25 May 2025", status: "upcoming" },
      { name: "Handover", amount: 380000, date: "28 Jun 2025", status: "upcoming" },
      { name: "Retention Release (10%)", amount: 190000, date: "28 Sep 2025", status: "upcoming" },
    ],
    categories: [
      { name: "Civil Works", budget: 650000, spent: 620000 },
      { name: "Electrical & Lighting", budget: 780000, spent: 745000 },
      { name: "False Ceiling", budget: 420000, spent: 398000 },
      { name: "Flooring", budget: 350000, spent: 310000 },
      { name: "Furniture & Fixtures", budget: 680000, spent: 580000 },
      { name: "Labour", budget: 400000, spent: 387000 },
    ],
    materials: [
      { name: "GI Sections (False Ceiling)", unit: "kg", dispatched: 1200, accounted: 1185, vendor: "Shree Steel" },
      { name: "Gypsum Boards", unit: "sheets", dispatched: 320, accounted: 318, vendor: "Saint Gobain" },
      { name: "Electrical Cables (1.5mm)", unit: "mtrs", dispatched: 2400, accounted: 2390, vendor: "Polycab" },
      { name: "LED Strip Lights", unit: "mtrs", dispatched: 180, accounted: 165, vendor: "Philips" },
      { name: "Ceramic Tiles (Floor)", unit: "sqft", dispatched: 2800, accounted: 2800, vendor: "Kajaria" },
      { name: "Plywood 18mm", unit: "sheets", dispatched: 95, accounted: 88, vendor: "Century Ply" },
    ],
    vendors: [
      { name: "Shree Steel & Co.", invoice: "INV-2501", date: "05 Feb 2025", due: "07 Mar 2025", amount: 185000, status: "paid" },
      { name: "Polycab Wires", invoice: "INV-2534", date: "18 Feb 2025", due: "20 Mar 2025", amount: 210000, status: "paid" },
      { name: "Saint Gobain", invoice: "INV-2567", date: "01 Mar 2025", due: "01 Apr 2025", amount: 142000, status: "paid" },
      { name: "Kajaria Ceramics", invoice: "INV-2589", date: "15 Mar 2025", due: "15 Apr 2025", amount: 168000, status: "paid" },
      { name: "Philips Lighting", invoice: "INV-2612", date: "02 Apr 2025", due: "02 May 2025", amount: 94000, status: "paid" },
      { name: "Century Ply", invoice: "INV-2645", date: "18 Apr 2025", due: "18 May 2025", amount: 76000, status: "due" },
    ],
    salary: [
      { name: "Ravi Kumar", role: "Site Supervisor", amount: 45000, month: "Apr 2025", paid: true },
      { name: "Suresh M.", role: "Electrician (Sr.)", amount: 32000, month: "Apr 2025", paid: true },
      { name: "Mahesh R.", role: "Civil Foreman", amount: 28000, month: "Apr 2025", paid: true },
      { name: "Anil T.", role: "Helper", amount: 18000, month: "Apr 2025", paid: true },
    ],
    pettyCash: [
      { date: "28 Apr", desc: "Site consumables & hardware", amount: 3200, flag: "ok" },
      { date: "29 Apr", desc: "Auto fare for material pickup", amount: 850, flag: "ok" },
      { date: "30 Apr", desc: "Snacks & chai for workers", amount: 1100, flag: "ok" },
      { date: "01 May", desc: "Adhesive & screws — urgent", amount: 4800, flag: "warn" },
      { date: "02 May", desc: "Site safety equipment", amount: 2400, flag: "ok" },
    ],
  },
  {
    id: 1, name: "Max Fashion — Phoenix", client: "Max Retail Pvt Ltd", location: "Phoenix Marketcity, Bengaluru",
    status: "warning", statusLabel: "Attention", stage: "Procurement",
    startDate: "01 Mar 2025", endDate: "31 Aug 2025",
    contractValue: 2900000, received: 870000, spent: 940000, completion: 28,
    alertMsg: "Electrical spend exceeding budget", alertType: "warning",
    milestones: [
      { name: "Advance (30%)", amount: 870000, date: "05 Mar 2025", status: "done" },
      { name: "Mobilisation & Demolition", amount: 435000, date: "01 Apr 2025", status: "done" },
      { name: "First Fix (Civil + Electrical)", amount: 580000, date: "30 May 2025", status: "upcoming" },
      { name: "Second Fix & Finishing", amount: 580000, date: "15 Jul 2025", status: "upcoming" },
      { name: "Handover", amount: 290000, date: "29 Aug 2025", status: "upcoming" },
      { name: "Retention Release (10%)", amount: 145000, date: "29 Nov 2025", status: "upcoming" },
    ],
    categories: [
      { name: "Civil Works", budget: 520000, spent: 498000 },
      { name: "Electrical & Lighting", budget: 620000, spent: 710000 },
      { name: "False Ceiling", budget: 340000, spent: 180000 },
      { name: "Flooring", budget: 280000, spent: 120000 },
      { name: "Furniture & Fixtures", budget: 550000, spent: 95000 },
      { name: "Labour", budget: 350000, spent: 210000 },
    ],
    materials: [
      { name: "GI Sections (False Ceiling)", unit: "kg", dispatched: 800, accounted: 800, vendor: "Shree Steel" },
      { name: "Electrical Cables (2.5mm)", unit: "mtrs", dispatched: 1800, accounted: 1760, vendor: "Finolex" },
      { name: "MCB Distribution Boards", unit: "nos", dispatched: 12, accounted: 10, vendor: "Legrand" },
      { name: "Concrete Blocks", unit: "nos", dispatched: 1200, accounted: 1190, vendor: "Local Supplier" },
      { name: "Binding Wire", unit: "kg", dispatched: 80, accounted: 62, vendor: "Local Supplier" },
      { name: "PVC Conduits", unit: "mtrs", dispatched: 950, accounted: 920, vendor: "Supreme" },
    ],
    vendors: [
      { name: "Legrand India", invoice: "INV-2701", date: "10 Mar 2025", due: "10 Apr 2025", amount: 285000, status: "paid" },
      { name: "Finolex Cables", invoice: "INV-2734", date: "22 Mar 2025", due: "22 Apr 2025", amount: 198000, status: "paid" },
      { name: "Shree Steel & Co.", invoice: "INV-2756", date: "05 Apr 2025", due: "05 May 2025", amount: 124000, status: "overdue" },
      { name: "Supreme Industries", invoice: "INV-2789", date: "15 Apr 2025", due: "15 May 2025", amount: 67000, status: "due" },
      { name: "Legrand India", invoice: "INV-2812", date: "28 Apr 2025", due: "28 May 2025", amount: 162000, status: "due" },
    ],
    salary: [
      { name: "Prakash S.", role: "Site Supervisor", amount: 45000, month: "Apr 2025", paid: true },
      { name: "Dinesh K.", role: "Electrician (Sr.)", amount: 32000, month: "Apr 2025", paid: true },
      { name: "Venkat R.", role: "Civil Foreman", amount: 28000, month: "Apr 2025", paid: false },
    ],
    pettyCash: [
      { date: "28 Apr", desc: "Hardware & fasteners", amount: 2800, flag: "ok" },
      { date: "29 Apr", desc: "Electrical consumables", amount: 6200, flag: "warn" },
      { date: "30 Apr", desc: "Cab fare — site to warehouse", amount: 1400, flag: "ok" },
      { date: "01 May", desc: "Extra conduits — unplanned", amount: 8500, flag: "risk" },
      { date: "02 May", desc: "Drinking water & misc", amount: 600, flag: "ok" },
    ],
  },
  {
    id: 2, name: "H&M — Mantri Square", client: "H&M Hennes & Mauritz", location: "Mantri Square Mall, Bengaluru",
    status: "danger", statusLabel: "At Risk", stage: "Pending PO",
    startDate: "15 Apr 2025", endDate: "30 Sep 2025",
    contractValue: 3050000, received: 915000, spent: 420000, completion: 12,
    alertMsg: "Client milestone payment 18 days overdue", alertType: "danger",
    milestones: [
      { name: "Advance (30%)", amount: 915000, date: "20 Apr 2025", status: "done" },
      { name: "Mobilisation & Demolition", amount: 457500, date: "15 May 2025", status: "overdue" },
      { name: "First Fix (Civil + Electrical)", amount: 610000, date: "30 Jun 2025", status: "upcoming" },
      { name: "Second Fix & Finishing", amount: 610000, date: "10 Aug 2025", status: "upcoming" },
      { name: "Handover", amount: 305000, date: "28 Sep 2025", status: "upcoming" },
      { name: "Retention Release (10%)", amount: 152500, date: "28 Dec 2025", status: "upcoming" },
    ],
    categories: [
      { name: "Civil Works", budget: 540000, spent: 210000 },
      { name: "Electrical & Lighting", budget: 680000, spent: 85000 },
      { name: "False Ceiling", budget: 360000, spent: 42000 },
      { name: "Flooring", budget: 290000, spent: 28000 },
      { name: "Furniture & Fixtures", budget: 590000, spent: 18000 },
      { name: "Labour", budget: 360000, spent: 125000 },
    ],
    materials: [
      { name: "RCC Shuttering Ply", unit: "sheets", dispatched: 60, accounted: 60, vendor: "Century Ply" },
      { name: "TMT Steel Bars", unit: "kg", dispatched: 650, accounted: 638, vendor: "JSW Steel" },
      { name: "OPC Cement", unit: "bags", dispatched: 280, accounted: 275, vendor: "UltraTech" },
      { name: "M-Sand", unit: "cft", dispatched: 420, accounted: 420, vendor: "Local Supplier" },
      { name: "Binding Wire", unit: "kg", dispatched: 45, accounted: 38, vendor: "Local Supplier" },
    ],
    vendors: [
      { name: "JSW Steel", invoice: "INV-2901", date: "20 Apr 2025", due: "20 May 2025", amount: 142000, status: "due" },
      { name: "UltraTech Cement", invoice: "INV-2923", date: "28 Apr 2025", due: "28 May 2025", amount: 84000, status: "due" },
      { name: "Century Ply", invoice: "INV-2945", date: "02 May 2025", due: "02 Jun 2025", amount: 68000, status: "due" },
    ],
    salary: [
      { name: "Kiran B.", role: "Site Supervisor", amount: 45000, month: "Apr 2025", paid: true },
      { name: "Sanjay D.", role: "Civil Foreman", amount: 28000, month: "Apr 2025", paid: true },
    ],
    pettyCash: [
      { date: "28 Apr", desc: "Site setup & safety signs", amount: 3800, flag: "ok" },
      { date: "29 Apr", desc: "Hardware tools purchase", amount: 5200, flag: "warn" },
      { date: "30 Apr", desc: "Cement & aggregate — urgent", amount: 4100, flag: "ok" },
      { date: "02 May", desc: "Misc labour advance", amount: 9800, flag: "risk" },
    ],
  },
];

type Alert = { type: "danger" | "warning" | "safe"; title: string; desc: string; project: string };
const allAlerts: Alert[] = [
  { type: "danger", title: "Client Payment Overdue — 18 Days", desc: "Mobilisation milestone of ₹4,57,500 not received from H&M. Follow up immediately.", project: "H&M — Mantri Square" },
  { type: "danger", title: "Electrical Budget Overrun — ₹90,000", desc: "Electrical & Lighting spend at ₹7,10,000 against budget of ₹6,20,000 for Max Fashion project.", project: "Max Fashion — Phoenix" },
  { type: "danger", title: "Vendor Invoice Overdue — Shree Steel", desc: "Invoice INV-2756 of ₹1,24,000 is 10 days past 30-day payment window. Risk to vendor trust.", project: "Max Fashion — Phoenix" },
  { type: "warning", title: "Material Gap — LED Strip Lights", desc: "15 metres of LED strip lights dispatched but unaccounted on site. Verify with supervisor.", project: "Zara — Orion Mall" },
  { type: "warning", title: "Material Gap — Binding Wire", desc: "18 kg binding wire dispatched, only 62 kg accounted vs 80 kg sent. Difference of 18 kg unexplained.", project: "Max Fashion — Phoenix" },
  { type: "warning", title: "Petty Cash — Unusual Spend (01 May)", desc: "₹8,500 unplanned petty cash for extra conduits. Supervisor approval not on record.", project: "Max Fashion — Phoenix" },
  { type: "warning", title: "Salary Pending — Venkat R.", desc: "April salary of ₹28,000 for Civil Foreman not yet processed.", project: "Max Fashion — Phoenix" },
  { type: "safe", title: "Zara Project — All Payments Current", desc: "All vendor invoices within 30-day window. No overdue payments.", project: "Zara — Orion Mall" },
  { type: "safe", title: "H&M — Civil Budget Under Control", desc: "Civil works spend at ₹2,10,000 vs budget of ₹5,40,000. Well within limits.", project: "H&M — Mantri Square" },
];

// ─── HELPERS ───────────────────────────────────────────
const fmt = (n: number) => "₹" + (n >= 100000 ? (n / 100000).toFixed(1) + "L" : (n / 1000).toFixed(0) + "K");
const fmtFull = (n: number) => "₹" + n.toLocaleString("en-IN");
const pct = (a: number, b: number) => Math.min(100, Math.round((a / b) * 100));

const STYLES = `
:root {
  --bg:        #f6f7f9;
  --surface:   #ffffff;
  --surface-2: #fafbfc;
  --surface-3: #f3f4f6;
  --border:    #e5e7eb;
  --border-2:  #d1d5db;
  --text:      #111827;
  --text-2:    #4b5563;
  --text-3:    #6b7280;
  --text-4:    #9ca3af;
  --green:     #15803d;
  --green-2:   #16a34a;
  --green-soft:#ecfdf5;
  --green-line:#bbf7d0;
  --amber:     #b45309;
  --amber-soft:#fffbeb;
  --amber-line:#fde68a;
  --red:       #b91c1c;
  --red-soft:  #fef2f2;
  --red-line:  #fecaca;
  --gold:      #92400e;
  --r:         10px;
  --shadow:    0 1px 2px rgba(16,24,40,0.04);
  --shadow-2:  0 4px 12px rgba(16,24,40,0.06);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:'Inter',ui-sans-serif,system-ui,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  font-feature-settings:"cv11","ss01";
}
.mono{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums}

::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:8px;border:2px solid var(--bg)}
::-webkit-scrollbar-thumb:hover{background:#9ca3af}

/* ── HEADER ── */
.gl-header{
  position:sticky;top:0;z-index:200;
  height:60px;
  background:rgba(255,255,255,0.92);
  backdrop-filter:saturate(140%) blur(8px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 1.75rem;
}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
.logo-box{
  width:30px;height:30px;border-radius:8px;
  background:var(--green);
  color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;font-weight:700;
}
.logo-name{font-size:.92rem;font-weight:700;letter-spacing:-0.01em;color:var(--text)}
.logo-name span{color:var(--green-2);font-weight:700}
.header-center{display:flex;align-items:center;gap:.25rem;background:var(--surface-3);padding:4px;border-radius:8px}
.nav-btn{
  font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:500;
  padding:6px 14px;border-radius:6px;
  border:1px solid transparent;
  background:transparent;
  color:var(--text-2);
  cursor:pointer;transition:all .15s;
}
.nav-btn:hover{color:var(--text)}
.nav-btn.active{background:var(--surface);color:var(--text);box-shadow:var(--shadow);border-color:var(--border)}
.header-right{display:flex;align-items:center;gap:1rem}
.live-pill{
  display:flex;align-items:center;gap:6px;
  font-family:'JetBrains Mono',monospace;font-size:.68rem;font-weight:500;
  color:var(--green);
  background:var(--green-soft);
  border:1px solid var(--green-line);
  padding:4px 10px;border-radius:999px;
}
.pulse{width:6px;height:6px;border-radius:50%;background:var(--green-2);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.hdate{font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-3)}

/* ── MAIN ── */
main.gl-main{position:relative;z-index:1;padding:1.5rem 1.75rem 4rem;max-width:1440px;margin:0 auto}
.screen{display:none}
.screen.active{display:block}

/* ── SECTION HEADER ── */
.sh{display:flex;align-items:baseline;gap:12px;margin-bottom:1rem}
.sh-label{
  font-family:'Inter',sans-serif;
  font-size:.78rem;font-weight:600;
  letter-spacing:-0.005em;
  color:var(--text);
}
.sh-line{flex:1;height:1px;background:var(--border)}
.sh-sub{font-size:.72rem;color:var(--text-3);font-family:'JetBrains Mono',monospace}

.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.g21{display:grid;grid-template-columns:2fr 1fr;gap:1rem}
.mb{margin-bottom:1.5rem}

/* ── CARD ── */
.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:1.15rem 1.3rem;
  position:relative;
  transition:border-color .15s,box-shadow .15s;
}
.card:hover{border-color:var(--border-2)}

/* ── STAT CARD ── */
.stat-lbl{
  font-family:'JetBrains Mono',monospace;
  font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;
  color:var(--text-3);margin-bottom:.55rem;font-weight:500;
}
.stat-val{font-size:1.6rem;font-weight:700;line-height:1.1;margin-bottom:.35rem;letter-spacing:-0.02em;font-family:'JetBrains Mono',monospace;font-variant-numeric:tabular-nums}
.stat-hint{font-size:.72rem;color:var(--text-3)}
.stat-icon{display:none}

.c-green{color:var(--green)}
.c-gold{color:var(--text)}
.c-red{color:var(--red)}
.c-amber{color:var(--amber)}

/* ── MINI PROGRESS ── */
.mini-prog{margin-top:.85rem}
.mini-prog-meta{
  display:flex;justify-content:space-between;
  font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-3);
  margin-bottom:5px;
}
.prog-track{height:6px;background:var(--surface-3);border-radius:999px;overflow:hidden}
.prog-fill{height:100%;border-radius:999px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.pf-green{background:var(--green-2)}
.pf-gold{background:#374151}
.pf-red{background:var(--red)}
.pf-amber{background:#d97706}

/* ── PROJECT CARDS ── */
.project-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:1.25rem;
  cursor:pointer;
  transition:all .15s;
  position:relative;
}
.project-card:hover{border-color:var(--border-2);box-shadow:var(--shadow-2)}
.project-card::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;
  border-radius:3px 0 0 3px;
}
.project-card.healthy::before{background:var(--green-2)}
.project-card.warning::before{background:#d97706}
.project-card.danger::before{background:var(--red)}
.pc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.85rem;gap:.5rem}
.pc-name{font-size:.95rem;font-weight:600;letter-spacing:-0.01em}
.pc-client{font-size:.72rem;color:var(--text-3);margin-top:2px}
.status-pill{
  font-family:'Inter',sans-serif;font-size:.66rem;font-weight:500;
  padding:3px 9px;border-radius:999px;white-space:nowrap;
  border:1px solid transparent;
}
.sp-green{background:var(--green-soft);color:var(--green);border-color:var(--green-line)}
.sp-amber{background:var(--amber-soft);color:var(--amber);border-color:var(--amber-line)}
.sp-red{background:var(--red-soft);color:var(--red);border-color:var(--red-line)}
.sp-neutral{background:var(--surface-3);color:var(--text-2);border-color:var(--border)}
.pc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:.8rem}
.pc-stat-item{background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:.55rem .7rem}
.pc-stat-lbl{font-family:'JetBrains Mono',monospace;font-size:.58rem;color:var(--text-3);margin-bottom:3px;letter-spacing:.06em;text-transform:uppercase}
.pc-stat-val{font-family:'JetBrains Mono',monospace;font-size:.85rem;font-weight:600;font-variant-numeric:tabular-nums}
.pc-alert{
  display:flex;align-items:center;gap:8px;
  font-size:.72rem;color:var(--text-2);
  background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:.5rem .75rem;
}
.pc-alert-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.view-btn{
  margin-top:.85rem;width:100%;
  font-family:'Inter',sans-serif;font-size:.74rem;font-weight:500;
  padding:8px;border-radius:7px;
  border:1px solid var(--border);
  background:var(--surface);color:var(--text);
  cursor:pointer;transition:all .15s;
}
.view-btn:hover{background:var(--surface-3);border-color:var(--border-2)}
.view-btn.primary{background:var(--green);color:#fff;border-color:var(--green)}
.view-btn.primary:hover{background:var(--green-2);border-color:var(--green-2)}

/* ── ALERTS ── */
.alert-item{
  display:flex;align-items:flex-start;gap:10px;
  padding:.85rem 1rem;
  border-radius:9px;
  margin-bottom:.55rem;
  background:var(--surface);
  border:1px solid var(--border);
  border-left:3px solid var(--border-2);
}
.alert-item:last-child{margin-bottom:0}
.ai-danger{border-left-color:var(--red)}
.ai-warning{border-left-color:#d97706}
.ai-safe{border-left-color:var(--green-2)}
.ai-icon{
  width:22px;height:22px;border-radius:50%;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-size:.66rem;font-weight:700;color:#fff;margin-top:1px;
}
.ai-danger .ai-icon{background:var(--red)}
.ai-warning .ai-icon{background:#d97706}
.ai-safe .ai-icon{background:var(--green-2)}
.ai-title{font-size:.8rem;font-weight:600;margin-bottom:3px;color:var(--text);letter-spacing:-0.005em}
.ai-desc{font-size:.72rem;color:var(--text-2);line-height:1.5}
.ai-project{
  font-family:'JetBrains Mono',monospace;font-size:.62rem;
  color:var(--text-4);margin-top:5px;
}

/* ── BACK BTN ── */
.back-btn{
  display:inline-flex;align-items:center;gap:6px;
  font-family:'Inter',sans-serif;font-size:.75rem;font-weight:500;
  color:var(--text-2);background:var(--surface);
  border:1px solid var(--border);border-radius:7px;
  padding:6px 12px;cursor:pointer;
  transition:all .15s;margin-bottom:1.2rem;
}
.back-btn:hover{color:var(--text);border-color:var(--border-2);background:var(--surface-3)}

/* ── PROJECT TABS ── */
.proj-selector{display:flex;gap:.4rem;margin-bottom:1.4rem;flex-wrap:wrap;background:var(--surface-3);padding:4px;border-radius:9px;width:fit-content}
.proj-tab{
  font-family:'Inter',sans-serif;font-size:.76rem;font-weight:500;
  padding:6px 14px;border-radius:6px;
  border:1px solid transparent;background:transparent;
  color:var(--text-2);cursor:pointer;transition:all .15s;
}
.proj-tab:hover{color:var(--text)}
.proj-tab.active{background:var(--surface);color:var(--text);box-shadow:var(--shadow);border-color:var(--border)}

/* ── MILESTONE ── */
.milestone-track{position:relative;padding-left:22px;margin-top:.6rem}
.milestone-track::before{
  content:'';position:absolute;left:7px;top:8px;bottom:8px;width:2px;
  background:var(--border);
}
.ms-item{position:relative;display:flex;align-items:flex-start;gap:12px;padding:.6rem 0}
.ms-dot{
  position:absolute;left:-19px;top:11px;
  width:12px;height:12px;border-radius:50%;
  flex-shrink:0;border:2px solid var(--border);
  background:var(--surface);z-index:1;
}
.ms-dot.done{background:var(--green-2);border-color:var(--green-2)}
.ms-dot.overdue{background:var(--red);border-color:var(--red)}
.ms-dot.upcoming{background:var(--surface);border-color:var(--border-2)}
.ms-body{flex:1}
.ms-name{font-size:.82rem;font-weight:600;color:var(--text)}
.ms-date{font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--text-3);margin-top:2px}
.ms-right{text-align:right;flex-shrink:0}
.ms-amount{font-family:'JetBrains Mono',monospace;font-size:.82rem;font-weight:600;font-variant-numeric:tabular-nums}
.ms-status{font-family:'Inter',sans-serif;font-size:.66rem;margin-top:3px;font-weight:500}

/* ── CATEGORY ── */
.cat-row{margin-bottom:1rem}
.cat-row:last-child{margin-bottom:0}
.cat-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.cat-name{font-size:.8rem;font-weight:500;color:var(--text)}
.cat-right{display:flex;align-items:center;gap:8px}
.cat-vals{font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--text-3);font-variant-numeric:tabular-nums}
.over-tag{
  font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:600;
  padding:2px 7px;border-radius:4px;
  background:var(--red-soft);color:var(--red);
  border:1px solid var(--red-line);
}
.ok-tag{
  font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:500;
  padding:2px 7px;border-radius:4px;
  background:var(--surface-3);color:var(--text-3);
  border:1px solid var(--border);
}

/* ── TABLE ── */
.tbl{width:100%;border-collapse:collapse}
.tbl th{
  font-family:'JetBrains Mono',monospace;
  font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;
  color:var(--text-3);font-weight:500;
  padding:.55rem .85rem;text-align:left;
  border-bottom:1px solid var(--border);
  background:var(--surface-2);
}
.tbl td{
  font-size:.78rem;padding:.7rem .85rem;
  border-bottom:1px solid var(--border);
  vertical-align:middle;color:var(--text);
}
.tbl tr:last-child td{border-bottom:none}
.tbl tbody tr:hover td{background:var(--surface-2)}
.flag{
  font-family:'Inter',sans-serif;font-size:.66rem;font-weight:500;
  padding:2px 8px;border-radius:999px;
  border:1px solid transparent;display:inline-block;
}
.flag-ok,.flag-paid{background:var(--green-soft);color:var(--green);border-color:var(--green-line)}
.flag-warn,.flag-due{background:var(--amber-soft);color:var(--amber);border-color:var(--amber-line)}
.flag-risk,.flag-overdue{background:var(--red-soft);color:var(--red);border-color:var(--red-line)}

.card-title{font-size:.88rem;font-weight:600;margin-bottom:.15rem;color:var(--text);letter-spacing:-0.01em}
.card-sub{font-size:.7rem;color:var(--text-3);margin-bottom:1rem}

.sal-row{display:flex;align-items:center;justify-content:space-between;padding:.65rem 0;border-bottom:1px solid var(--border)}
.sal-row:last-child{border-bottom:none}
.sal-name{font-size:.8rem;font-weight:500;color:var(--text)}
.sal-role{font-size:.68rem;color:var(--text-3);margin-top:1px}
.sal-right{text-align:right}
.sal-amount{font-family:'JetBrains Mono',monospace;font-size:.8rem;font-weight:600;font-variant-numeric:tabular-nums}
.sal-date{font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--text-3);margin-top:2px}

/* ── DETAIL HEADER ── */
.detail-header{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:1.4rem 1.5rem;margin-bottom:1.5rem;
}

.summary-row{display:flex;justify-content:space-between;padding:.7rem 0;border-bottom:1px solid var(--border);font-size:.8rem}
.summary-row:last-child{border-bottom:none}

@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .3s ease forwards}
.delay-1{animation-delay:.04s}
.delay-2{animation-delay:.08s}
.delay-3{animation-delay:.12s}
.delay-4{animation-delay:.16s}

@media(max-width:900px){
  .g4{grid-template-columns:repeat(2,1fr)}
  .g3{grid-template-columns:1fr}
  .g21{grid-template-columns:1fr}
  main.gl-main{padding:1rem}
  .gl-header{padding:0 1rem}
  .header-center{display:none}
}
@media(max-width:600px){
  .g4,.g2{grid-template-columns:1fr}
}
`;

// ─── COMPONENTS ────────────────────────────────────────
function Header({ screen, setScreen }: { screen: string; setScreen: (s: "home" | "detail" | "alerts") => void }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
  }, []);
  return (
    <header className="gl-header">
      <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setScreen("home"); }}>
        <div className="logo-box">G</div>
        <div className="logo-name">Greenline <span>Associates</span></div>
      </a>
      <div className="header-center">
        <button className={`nav-btn ${screen === "home" ? "active" : ""}`} onClick={() => setScreen("home")}>Command Centre</button>
        <button className={`nav-btn ${screen === "detail" ? "active" : ""}`} onClick={() => setScreen("detail")}>Project Detail</button>
        <button className={`nav-btn ${screen === "alerts" ? "active" : ""}`} onClick={() => setScreen("alerts")}>Alerts</button>
      </div>
      <div className="header-right">
        <div className="live-pill"><div className="pulse"></div>Live</div>
        <div className="hdate mono">{date}</div>
      </div>
    </header>
  );
}

function HomeScreen({ open }: { open: (id: number) => void }) {
  return (
    <div className="screen active">
      <div className="sh mb" style={{ marginTop: ".25rem" }}>
        <span className="sh-label">Business Overview</span>
        <div className="sh-line"></div>
        <span className="sh-sub">All Projects · May 2025</span>
      </div>

      <div className="g4 mb fade-up">
        <div className="card">
          <div className="stat-lbl">Total Contract Value</div>
          <div className="stat-val">₹87.5L</div>
          <div className="stat-hint">Across 3 active projects</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Received</span><span>₹52.1L</span></div>
            <div className="prog-track"><div className="prog-fill pf-gold" style={{ width: "59.5%" }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Money Received</div>
          <div className="stat-val c-green">₹52.1L</div>
          <div className="stat-hint">From clients this year</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of total contract</span><span>59.5%</span></div>
            <div className="prog-track"><div className="prog-fill pf-green" style={{ width: "59.5%" }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Money Spent</div>
          <div className="stat-val">₹41.8L</div>
          <div className="stat-hint">Vendors + Labour + Materials</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of received</span><span>80.2%</span></div>
            <div className="prog-track"><div className="prog-fill pf-amber" style={{ width: "80.2%" }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Net Cash Position</div>
          <div className="stat-val c-green">+₹10.3L</div>
          <div className="stat-hint">Received minus spent</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Health</span><span>Positive</span></div>
            <div className="prog-track"><div className="prog-fill pf-green" style={{ width: "100%" }}></div></div>
          </div>
        </div>
      </div>

      <div className="g21 fade-up delay-1">
        <div>
          <div className="sh mb"><span className="sh-label">Active Projects</span><div className="sh-line"></div></div>
          <div className="g3">
            {projects.map((p) => {
              const net = p.received - p.spent;
              const netStr = net >= 0 ? "+" + fmt(net) : "-" + fmt(Math.abs(net));
              const netColor = net >= 0 ? "c-green" : "c-red";
              const sp = p.status === "healthy" ? "sp-green" : p.status === "warning" ? "sp-amber" : "sp-red";
              const pf = p.status === "healthy" ? "pf-green" : p.status === "warning" ? "pf-amber" : "pf-red";
              const dotCol = p.alertType === "safe" ? "var(--green-2)" : p.alertType === "warning" ? "#d97706" : "var(--red)";
              return (
                <div key={p.id} className={`project-card ${p.status}`} onClick={() => open(p.id)}>
                  <div className="pc-top">
                    <div>
                      <div className="pc-name">{p.name}</div>
                      <div className="pc-client">{p.client}</div>
                    </div>
                    <span className={`status-pill ${sp}`}>{p.statusLabel}</span>
                  </div>
                  <div className="pc-stats">
                    <div className="pc-stat-item">
                      <div className="pc-stat-lbl">Contract</div>
                      <div className="pc-stat-val">{fmt(p.contractValue)}</div>
                    </div>
                    <div className="pc-stat-item">
                      <div className="pc-stat-lbl">Received</div>
                      <div className="pc-stat-val c-green">{fmt(p.received)}</div>
                    </div>
                    <div className="pc-stat-item">
                      <div className="pc-stat-lbl">Net</div>
                      <div className={`pc-stat-val ${netColor}`}>{netStr}</div>
                    </div>
                  </div>
                  <div className="mini-prog">
                    <div className="mini-prog-meta"><span>Completion</span><span>{p.completion}%</span></div>
                    <div className="prog-track"><div className={`prog-fill ${pf}`} style={{ width: `${p.completion}%` }}></div></div>
                  </div>
                  <div className="pc-alert" style={{ marginTop: ".7rem" }}>
                    <div className="pc-alert-dot" style={{ background: dotCol }}></div>
                    <span>{p.alertMsg}</span>
                  </div>
                  <button className="view-btn">View full project →</button>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="sh mb"><span className="sh-label">Alerts · Action Needed</span><div className="sh-line"></div></div>
          <div>
            {allAlerts.slice(0, 5).map((a, i) => (
              <div key={i} className={`alert-item ai-${a.type}`}>
                <div className="ai-icon">{a.type === "danger" ? "!" : a.type === "warning" ? "!" : "✓"}</div>
                <div>
                  <div className="ai-title">{a.title}</div>
                  <div className="ai-desc">{a.desc}</div>
                  <div className="ai-project">{a.project}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailScreen({ id, setId, back }: { id: number; setId: (i: number) => void; back: () => void }) {
  const p = projects[id];
  const net = p.received - p.spent;
  const netStr = (net >= 0 ? "+" : "") + fmtFull(net);
  const totalBudget = p.categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent = p.categories.reduce((s, c) => s + c.spent, 0);
  const totalSalary = p.salary.reduce((s, e) => s + e.amount, 0);
  const sp = p.status === "healthy" ? "sp-green" : p.status === "warning" ? "sp-amber" : "sp-red";
  const pf = p.status === "healthy" ? "pf-green" : p.status === "warning" ? "pf-amber" : "pf-red";

  return (
    <div className="screen active">
      <button className="back-btn" onClick={back}>← Back to Command Centre</button>

      <div className="proj-selector">
        {projects.map((pp) => (
          <button key={pp.id} className={`proj-tab ${pp.id === id ? "active" : ""}`} onClick={() => setId(pp.id)}>{pp.name}</button>
        ))}
      </div>

      <div className="detail-header fade-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.02em" }}>{p.name}</div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: 4 }}>{p.client} · {p.location}</div>
            <div style={{ display: "flex", gap: ".4rem", marginTop: ".75rem", flexWrap: "wrap" }}>
              <span className={`status-pill ${sp}`}>{p.statusLabel}</span>
              <span className="status-pill sp-neutral">Stage: {p.stage}</span>
              <span className="status-pill sp-neutral">Completion: {p.completion}%</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div className="stat-lbl">Start Date</div>
              <div className="mono" style={{ fontSize: ".82rem", fontWeight: 500 }}>{p.startDate}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-lbl">End Date</div>
              <div className="mono" style={{ fontSize: ".82rem", fontWeight: 500 }}>{p.endDate}</div>
            </div>
          </div>
        </div>
        <div className="mini-prog" style={{ marginTop: "1.1rem" }}>
          <div className="mini-prog-meta"><span>Overall Completion</span><span>{p.completion}%</span></div>
          <div className="prog-track" style={{ height: 8 }}>
            <div className={`prog-fill ${pf}`} style={{ width: `${p.completion}%` }}></div>
          </div>
        </div>
      </div>

      {/* A · Money Summary */}
      <div className="sh mb"><span className="sh-label">A · Money Summary</span><div className="sh-line"></div></div>
      <div className="g4 mb fade-up delay-1">
        <div className="card">
          <div className="stat-lbl">Contract Value</div>
          <div className="stat-val">{fmtFull(p.contractValue)}</div>
          <div className="stat-hint">Signed PO from client</div>
        </div>
        <div className="card">
          <div className="stat-lbl">Received from Client</div>
          <div className="stat-val c-green">{fmtFull(p.received)}</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of contract</span><span>{pct(p.received, p.contractValue)}%</span></div>
            <div className="prog-track"><div className="prog-fill pf-green" style={{ width: `${pct(p.received, p.contractValue)}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Spent</div>
          <div className="stat-val">{fmtFull(p.spent)}</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of received</span><span>{pct(p.spent, p.received)}%</span></div>
            <div className="prog-track"><div className={`prog-fill ${pct(p.spent, p.received) > 90 ? "pf-red" : "pf-amber"}`} style={{ width: `${pct(p.spent, p.received)}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Net Cash Position</div>
          <div className={`stat-val ${net >= 0 ? "c-green" : "c-red"}`}>{netStr}</div>
          <div className="stat-hint">{net >= 0 ? "You are cash positive" : "Spent more than received"}</div>
        </div>
      </div>

      {/* B · Milestone */}
      <div className="sh mb"><span className="sh-label">B · Milestone & Payment Tracker</span><div className="sh-line"></div></div>
      <div className="g2 mb fade-up delay-2">
        <div className="card">
          <div className="card-title">Billing Milestones</div>
          <div className="card-sub">Track each stage — billed & collected</div>
          <div className="milestone-track">
            {p.milestones.map((m, i) => {
              const amtColor = m.status === "done" ? "c-green" : m.status === "overdue" ? "c-red" : "";
              const statusLabel = m.status === "done" ? "Collected" : m.status === "overdue" ? "Overdue" : "Upcoming";
              const statusColor = m.status === "done" ? "c-green" : m.status === "overdue" ? "c-red" : "";
              return (
                <div className="ms-item" key={i}>
                  <div className={`ms-dot ${m.status}`}></div>
                  <div className="ms-body">
                    <div className="ms-name">{m.name}</div>
                    <div className="ms-date">{m.date}</div>
                  </div>
                  <div className="ms-right">
                    <div className={`ms-amount ${amtColor}`}>{fmtFull(m.amount)}</div>
                    <div className={`ms-status ${statusColor}`} style={{ color: m.status === "upcoming" ? "var(--text-3)" : undefined }}>{statusLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Payment Health</div>
          <div className="card-sub">Outstanding vs collected</div>
          <div style={{ marginTop: ".5rem" }}>
            {(["done", "overdue", "upcoming"] as const).map((s) => {
              const items = p.milestones.filter((m) => m.status === s);
              const total = items.reduce((a, m) => a + m.amount, 0);
              const label = s === "done" ? "Collected" : s === "overdue" ? "Overdue" : "Upcoming";
              const col = s === "done" ? "c-green" : s === "overdue" ? "c-red" : "";
              return (
                <div className="summary-row" key={s}>
                  <span>{label} ({items.length} milestone{items.length !== 1 ? "s" : ""})</span>
                  <span className={`mono ${col}`} style={{ fontWeight: 600 }}>{fmtFull(total)}</span>
                </div>
              );
            })}
            <div className="summary-row" style={{ borderBottom: "none", paddingTop: ".9rem" }}>
              <span style={{ fontWeight: 600 }}>Total Contract</span>
              <span className="mono" style={{ fontSize: ".9rem", fontWeight: 700 }}>{fmtFull(p.contractValue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* C · Materials */}
      <div className="sh mb"><span className="sh-label">C · Procurement & Material Control</span><div className="sh-line"></div></div>
      <div className="card mb fade-up delay-3" style={{ padding: 0 }}>
        <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
          <div className="card-title">Material Dispatch vs Site Accountability</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>Gap between dispatched and accounted = theft/loss risk indicator</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Material</th><th>Vendor</th><th>Dispatched</th><th>Accounted</th><th>Gap</th><th>Status</th></tr></thead>
            <tbody>
              {p.materials.map((m, i) => {
                const gap = m.dispatched - m.accounted;
                const gapPct = Math.round((gap / m.dispatched) * 100);
                let flagClass = "flag-ok", flagLabel = "OK";
                if (gap > 0 && gapPct <= 2) { flagClass = "flag-warn"; flagLabel = `Gap: ${gap}`; }
                else if (gap > 0 && gapPct > 2) { flagClass = "flag-risk"; flagLabel = `Risk: ${gap} missing`; }
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: "var(--text-2)" }}>{m.vendor}</td>
                    <td className="mono">{m.dispatched} {m.unit}</td>
                    <td className="mono">{m.accounted} {m.unit}</td>
                    <td className={`mono ${gap > 0 ? (gapPct > 2 ? "c-red" : "c-amber") : "c-green"}`}>{gap}</td>
                    <td><span className={`flag ${flagClass}`}>{flagLabel}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* D · Budget */}
      <div className="sh mb"><span className="sh-label">D · Expense vs Budget</span><div className="sh-line"></div></div>
      <div className="g2 mb fade-up delay-4">
        <div className="card">
          <div className="card-title">Category-wise Breakdown</div>
          <div className="card-sub">Budget vs actual spend per work category</div>
          {p.categories.map((c, i) => {
            const perc = pct(c.spent, c.budget);
            const over = c.spent > c.budget;
            const fillClass = over ? "pf-red" : perc > 80 ? "pf-amber" : "pf-green";
            return (
              <div className="cat-row" key={i}>
                <div className="cat-meta">
                  <span className="cat-name">{c.name}</span>
                  <div className="cat-right">
                    <span className="cat-vals">{fmtFull(c.spent)} / {fmtFull(c.budget)}</span>
                    {over ? <span className="over-tag">OVER ▲{fmtFull(c.spent - c.budget)}</span> : <span className="ok-tag">OK</span>}
                  </div>
                </div>
                <div className="prog-track">
                  <div className={`prog-fill ${fillClass}`} style={{ width: `${Math.min(perc, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title">Project Budget Summary</div>
          <div className="card-sub">Overall financial health</div>
          <div style={{ marginTop: ".5rem" }}>
            <div className="summary-row"><span>Total Budget (all categories)</span><span className="mono" style={{ fontWeight: 600 }}>{fmtFull(totalBudget)}</span></div>
            <div className="summary-row"><span>Total Spent</span><span className={`mono ${totalSpent > totalBudget ? "c-red" : "c-green"}`} style={{ fontWeight: 600 }}>{fmtFull(totalSpent)}</span></div>
            <div className="summary-row"><span>Remaining Budget</span><span className="mono" style={{ fontWeight: 600 }}>{fmtFull(totalBudget - totalSpent)}</span></div>
            <div className="summary-row" style={{ borderBottom: "none", paddingTop: ".9rem" }}>
              <span style={{ fontWeight: 600 }}>Budget Used</span>
              <span className={`mono ${totalSpent / totalBudget > 1 ? "c-red" : totalSpent / totalBudget > 0.85 ? "c-amber" : "c-green"}`} style={{ fontSize: ".9rem", fontWeight: 700 }}>
                {Math.round((totalSpent / totalBudget) * 100)}%
              </span>
            </div>
          </div>
          <div className="mini-prog" style={{ marginTop: ".9rem" }}>
            <div className="prog-track" style={{ height: 8 }}>
              <div className={`prog-fill ${totalSpent > totalBudget ? "pf-red" : totalSpent / totalBudget > 0.85 ? "pf-amber" : "pf-green"}`} style={{ width: `${Math.min(100, Math.round((totalSpent / totalBudget) * 100))}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* E · Vendors */}
      <div className="sh mb"><span className="sh-label">E · Vendor Payments</span><div className="sh-line"></div></div>
      <div className="card mb fade-up" style={{ padding: 0 }}>
        <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
          <div className="card-title">Invoice Tracker — 30-Day Payment Window</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>Overdue = vendor relationship at risk</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Vendor</th><th>Invoice No.</th><th>Invoice Date</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {p.vendors.map((v, i) => {
                const sc = v.status === "paid" ? "flag-paid" : v.status === "overdue" ? "flag-overdue" : "flag-due";
                const sl = v.status === "paid" ? "Paid" : v.status === "overdue" ? "Overdue" : "Due";
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{v.name}</td>
                    <td className="mono" style={{ color: "var(--text-3)" }}>{v.invoice}</td>
                    <td className="mono" style={{ color: "var(--text-2)" }}>{v.date}</td>
                    <td className="mono" style={{ color: "var(--text-2)" }}>{v.due}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{fmtFull(v.amount)}</td>
                    <td><span className={`flag ${sc}`}>{sl}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* F · Salary + Petty */}
      <div className="sh mb"><span className="sh-label">F · Salary Register & Petty Cash</span><div className="sh-line"></div></div>
      <div className="g2 mb fade-up">
        <div className="card">
          <div className="card-title">Monthly Salary Register</div>
          <div className="card-sub">Staff assigned to this project · {fmtFull(totalSalary)}/month total</div>
          {p.salary.map((s, i) => (
            <div className="sal-row" key={i}>
              <div>
                <div className="sal-name">{s.name}</div>
                <div className="sal-role">{s.role}</div>
              </div>
              <div className="sal-right">
                <div className="sal-amount">{fmtFull(s.amount)}</div>
                <div className="sal-date">{s.month} · <span className={s.paid ? "c-green" : "c-red"}>{s.paid ? "Paid" : "Pending"}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
            <div className="card-title">Petty Cash Log</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Daily site expenses — flag if unusual</div>
          </div>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Flag</th></tr></thead>
            <tbody>
              {p.pettyCash.map((pc, i) => (
                <tr key={i}>
                  <td className="mono" style={{ color: "var(--text-3)" }}>{pc.date}</td>
                  <td>{pc.desc}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{fmtFull(pc.amount)}</td>
                  <td>
                    <span className={`flag ${pc.flag === "ok" ? "flag-ok" : pc.flag === "warn" ? "flag-due" : "flag-overdue"}`}>
                      {pc.flag === "ok" ? "Normal" : pc.flag === "warn" ? "Watch" : "Verify"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AlertsScreen() {
  const groups = useMemo(() => ({
    danger: allAlerts.filter((a) => a.type === "danger"),
    warning: allAlerts.filter((a) => a.type === "warning"),
    safe: allAlerts.filter((a) => a.type === "safe"),
  }), []);
  const renderGroup = (items: Alert[]) => items.map((a, i) => (
    <div key={i} className={`alert-item ai-${a.type}`}>
      <div className="ai-icon">{a.type === "danger" ? "!" : a.type === "warning" ? "!" : "✓"}</div>
      <div>
        <div className="ai-title">{a.title}</div>
        <div className="ai-desc">{a.desc}</div>
        <div className="ai-project">{a.project}</div>
      </div>
    </div>
  ));
  return (
    <div className="screen active">
      <div className="sh mb" style={{ marginTop: ".25rem" }}>
        <span className="sh-label">All Alerts · All Projects</span>
        <div className="sh-line"></div>
      </div>
      <div className="g2">
        <div>
          <div className="sh mb"><span className="sh-label" style={{ color: "var(--red)" }}>Critical — Act Today</span><div className="sh-line"></div></div>
          {renderGroup(groups.danger)}
        </div>
        <div>
          <div className="sh mb"><span className="sh-label" style={{ color: "var(--amber)" }}>Watch Closely</span><div className="sh-line"></div></div>
          {renderGroup(groups.warning)}
          <div className="sh mb" style={{ marginTop: "1.5rem" }}><span className="sh-label" style={{ color: "var(--green)" }}>All Clear</span><div className="sh-line"></div></div>
          {renderGroup(groups.safe)}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [screen, setScreen] = useState<"home" | "detail" | "alerts">("home");
  const [projectId, setProjectId] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const open = (id: number) => { setProjectId(id); setScreen("detail"); };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Header screen={screen} setScreen={setScreen} />
      <main className="gl-main">
        {screen === "home" && <HomeScreen open={open} />}
        {screen === "detail" && <DetailScreen id={projectId} setId={setProjectId} back={() => setScreen("home")} />}
        {screen === "alerts" && <AlertsScreen />}
      </main>
    </>
  );
}
