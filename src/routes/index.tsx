import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import logo from "../assets/logo.png";

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
type Milestone = { name: string; amount: number | ""; date: string; status: "done" | "overdue" | "upcoming" };
type Category = { name: string; budget: number; spent: number };
type Material = { id: string; name: string; unit: string; dispatched: number; accounted: number; vendor?: string; unitCost?: number; unitPrice?: number; gap?: number; totalCost?: number; category?: string };
type Vendor = { name: string; invoice: string; date: string; due: string; amount: number; status: "paid" | "due" | "overdue" };
type Salary = { name: string; role: string; amount: number; month: string; paid: boolean };
type Petty = { date: string; desc: string; amount: number; flag: "ok" | "warn" | "risk" };

const DEFAULT_UNIT_COSTS: Record<string, { unit: string; cost: number }> = {
  // Zara
  "GI Sections (False Ceiling)": { unit: "kg", cost: 75 },
  "Gypsum Boards": { unit: "sheets", cost: 350 },
  "Electrical Cables (1.5mm)": { unit: "mtrs", cost: 25 },
  "LED Strip Lights": { unit: "mtrs", cost: 185 },
  "Ceramic Tiles (Floor)": { unit: "sqft", cost: 60 },
  "Plywood 18mm": { unit: "sheets", cost: 1850 },
  // Max Fashion
  "Electrical Cables (2.5mm)": { unit: "mtrs", cost: 40 },
  "MCB Distribution Boards": { unit: "nos", cost: 4500 },
  "Concrete Blocks": { unit: "nos", cost: 45 },
  "Binding Wire": { unit: "kg", cost: 95 },
  "PVC Conduits": { unit: "mtrs", cost: 15 },
  // H&M
  "RCC Shuttering Ply": { unit: "sheets", cost: 950 },
  "TMT Steel Bars": { unit: "kg", cost: 65 },
  "OPC Cement": { unit: "bags", cost: 420 },
  "M-Sand": { unit: "cft", cost: 80 },
};

const CATEGORY_ITEMS: Record<string, Array<{ name: string; unit: string; cost: number }>> = {
  "Electrical": [
    { name: "LED Strip Lights", unit: "mtrs", cost: 185 },
    { name: "Electrical Cables 1.5mm", unit: "mtrs", cost: 25 },
    { name: "Electrical Cables 2.5mm", unit: "mtrs", cost: 40 },
    { name: "MCB Switches", unit: "nos", cost: 120 },
    { name: "Junction Boxes", unit: "nos", cost: 45 },
    { name: "DB Panels", unit: "nos", cost: 12500 },
    { name: "MCB Distribution Boards", unit: "nos", cost: 4500 },
    { name: "PVC Conduits", unit: "mtrs", cost: 15 },
  ],
  "Civil Works": [
    { name: "Cement Bags", unit: "bags", cost: 420 },
    { name: "Steel Rods", unit: "kg", cost: 65 },
    { name: "River Sand", unit: "cft", cost: 80 },
    { name: "Bricks", unit: "nos", cost: 8 },
    { name: "Concrete Blocks", unit: "nos", cost: 45 },
    { name: "Binding Wire", unit: "kg", cost: 95 },
  ],
  "Flooring": [
    { name: "Ceramic Tiles", unit: "sqft", cost: 60 },
    { name: "Vitrified Tiles", unit: "sqft", cost: 85 },
    { name: "Wooden Flooring", unit: "sqft", cost: 220 },
    { name: "Epoxy Flooring", unit: "sqft", cost: 180 },
  ],
  "False Ceiling": [
    { name: "GI Sections", unit: "kg", cost: 75 },
    { name: "Gypsum Boards", unit: "sheets", cost: 350 },
    { name: "Grid Tiles", unit: "sqft", cost: 45 },
    { name: "Perforated Panels", unit: "sqft", cost: 120 },
  ],
  "Plumbing": [
    { name: "PVC Pipes", unit: "mtrs", cost: 90 },
    { name: "CPVC Pipes", unit: "mtrs", cost: 140 },
    { name: "Brass Valves", unit: "nos", cost: 350 },
    { name: "Elbow Joints", unit: "nos", cost: 35 },
  ],
  "Carpentry": [
    { name: "Plywood 18mm", unit: "sheets", cost: 1850 },
    { name: "Plywood 12mm", unit: "sheets", cost: 1350 },
    { name: "Laminate Sheets", unit: "sheets", cost: 850 },
    { name: "Wooden Beams", unit: "cft", cost: 650 },
    { name: "MDF Boards", unit: "sheets", cost: 950 },
  ],
  "Glass & Glazing": [
    { name: "Toughened Glass 12mm", unit: "sqft", cost: 250 },
    { name: "Clear Glass 5mm", unit: "sqft", cost: 90 },
    { name: "Aluminium Frame Channels", unit: "mtrs", cost: 180 },
    { name: "Silicon Sealant", unit: "tubes", cost: 280 },
  ],
  "HVAC": [
    { name: "Copper Piping", unit: "mtrs", cost: 450 },
    { name: "Ducting Sheets", unit: "sqft", cost: 320 },
    { name: "Grilles & Diffusers", unit: "nos", cost: 650 },
    { name: "AC Brackets", unit: "pairs", cost: 850 },
  ],
};
type Project = {
  id: number; name: string; client: string; location: string;
  status: "healthy" | "warning" | "danger"; statusLabel: string; stage: string;
  startDate: string; endDate: string; contractValue: number;
  completion: number; alertMsg: string; alertType: "safe" | "warning" | "danger";
  milestones: Milestone[]; categories?: Category[]; materials: Material[];
  vendors: Vendor[]; salary: Salary[]; pettyCash: Petty[];
  totalBudget?: number;
  categoryBudgets?: Record<string, number>;
};

const projects: Project[] = [
  {
    id: 0, name: "Zara — Orion Mall", client: "Zara India Pvt Ltd", location: "Orion Mall, Bengaluru",
    status: "healthy", statusLabel: "On Track", stage: "Execution",
    startDate: "10 Jan 2025", endDate: "30 Jun 2025",
    contractValue: 3800000, completion: 62,
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
      { id: "zara-1", name: "GI Sections (False Ceiling)", category: "False Ceiling", unit: "kg", dispatched: 1200, accounted: 1185, unitPrice: 75, vendor: "Shree Steel" },
      { id: "zara-2", name: "Gypsum Boards", category: "False Ceiling", unit: "sheets", dispatched: 320, accounted: 318, unitPrice: 350, vendor: "Saint Gobain" },
      { id: "zara-3", name: "Electrical Cables (1.5mm)", category: "Electrical & Lighting", unit: "mtrs", dispatched: 2400, accounted: 2390, unitPrice: 25, vendor: "Polycab" },
      { id: "zara-4", name: "LED Strip Lights", category: "Electrical & Lighting", unit: "mtrs", dispatched: 180, accounted: 165, unitPrice: 185, vendor: "Philips" },
      { id: "zara-5", name: "Ceramic Tiles (Floor)", category: "Flooring", unit: "sqft", dispatched: 2800, accounted: 2800, unitPrice: 60, vendor: "Kajaria" },
      { id: "zara-6", name: "Plywood 18mm", category: "Furniture & Fixtures", unit: "sheets", dispatched: 95, accounted: 88, unitPrice: 1850, vendor: "Century Ply" },
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
    contractValue: 2900000, completion: 28,
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
      { id: "max-1", name: "GI Sections (False Ceiling)", category: "False Ceiling", unit: "kg", dispatched: 800, accounted: 800, unitPrice: 75, vendor: "Shree Steel" },
      { id: "max-2", name: "Electrical Cables (2.5mm)", category: "Electrical & Lighting", unit: "mtrs", dispatched: 1800, accounted: 1760, unitPrice: 40, vendor: "Finolex" },
      { id: "max-3", name: "MCB Distribution Boards", category: "Electrical & Lighting", unit: "nos", dispatched: 12, accounted: 10, unitPrice: 4500, vendor: "Legrand" },
      { id: "max-4", name: "Concrete Blocks", category: "Civil Works", unit: "nos", dispatched: 1200, accounted: 1190, unitPrice: 45, vendor: "Local Supplier" },
      { id: "max-5", name: "Binding Wire", category: "Civil Works", unit: "kg", dispatched: 80, accounted: 62, unitPrice: 95, vendor: "Local Supplier" },
      { id: "max-6", name: "PVC Conduits", category: "Electrical & Lighting", unit: "mtrs", dispatched: 950, accounted: 920, unitPrice: 15, vendor: "Supreme" },
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
    contractValue: 3050000, completion: 12,
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
      { id: "hm-1", name: "RCC Shuttering Ply", category: "Civil Works", unit: "sheets", dispatched: 60, accounted: 60, unitPrice: 950, vendor: "Century Ply" },
      { id: "hm-2", name: "TMT Steel Bars", category: "Civil Works", unit: "kg", dispatched: 650, accounted: 638, unitPrice: 65, vendor: "JSW Steel" },
      { id: "hm-3", name: "OPC Cement", category: "Civil Works", unit: "bags", dispatched: 280, accounted: 275, unitPrice: 420, vendor: "UltraTech" },
      { id: "hm-4", name: "M-Sand", category: "Civil Works", unit: "cft", dispatched: 420, accounted: 420, unitPrice: 80, vendor: "Local Supplier" },
      { id: "hm-5", name: "Binding Wire", category: "Civil Works", unit: "kg", dispatched: 45, accounted: 38, unitPrice: 95, vendor: "Local Supplier" },
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

const getSectionForAlert = (a: Alert): string | null => {
  const title = a.title.toLowerCase();
  const desc = a.desc.toLowerCase();
  
  if (title.includes("payment overdue") || title.includes("milestone") || desc.includes("milestone")) {
    return "section-b";
  }
  if (title.includes("budget") || title.includes("overrun") || title.includes("overspend") || desc.includes("budget") || desc.includes("spend at")) {
    return "section-d";
  }
  if (title.includes("material gap") || title.includes("procurement") || desc.includes("dispatched but unaccounted") || desc.includes("dispatched, only")) {
    return "section-c";
  }
  if (title.includes("salary") || title.includes("petty cash") || desc.includes("salary") || desc.includes("petty cash") || title.includes("unusual spend")) {
    return "section-f";
  }
  if (title.includes("invoice") || title.includes("vendor") || desc.includes("invoice") || desc.includes("payments current")) {
    return "section-e";
  }
  return null;
};

const DEFAULT_CATEGORIES = [
  "Civil Works",
  "Electrical & Lighting",
  "False Ceiling",
  "Flooring",
  "Furniture & Fixtures",
  "Labour",
  "Plumbing",
  "Glass & Glazing",
  "HVAC",
  "Uncategorised"
];

const getGlobalMaterialsLibrary = (): Array<{ name: string; unit: string; category: string; cost: number }> => {
  if (typeof window === "undefined") {
    return [];
  }
  const stored = localStorage.getItem("greenline_materials_library");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse library", e);
    }
  }

  // Seed with default CATEGORY_ITEMS
  const initialList: Array<{ name: string; unit: string; category: string; cost: number }> = [];
  Object.entries(CATEGORY_ITEMS).forEach(([category, items]) => {
    let cat = category;
    if (cat === "Electrical") cat = "Electrical & Lighting";
    if (cat === "Carpentry") cat = "Furniture & Fixtures";
    items.forEach((item) => {
      initialList.push({ name: item.name, unit: item.unit, category: cat, cost: item.cost });
    });
  });

  localStorage.setItem("greenline_materials_library", JSON.stringify(initialList));
  return initialList;
};

let MASTER_CATEGORIES = [...DEFAULT_CATEGORIES];

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("gl_master_categories");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        MASTER_CATEGORIES = Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
      }
    } catch (e) {
      console.error("Error loading master categories:", e);
    }
  }
}

const getCategoryForMaterialName = (name: string): string => {
  const normalized = name.toLowerCase();
  for (const [catName, items] of Object.entries(CATEGORY_ITEMS)) {
    if (items.some(item => normalized.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(normalized))) {
      if (catName === "Electrical") return "Electrical & Lighting";
      if (catName === "Carpentry") return "Furniture & Fixtures";
      return catName;
    }
  }
  if (normalized.includes("plywood") || normalized.includes("shuttering ply") || normalized.includes("century ply") || normalized.includes("board")) return "Furniture & Fixtures";
  if (normalized.includes("cement") || normalized.includes("steel bar") || normalized.includes("m-sand") || normalized.includes("binding wire") || normalized.includes("concrete block") || normalized.includes("brick")) return "Civil Works";
  if (normalized.includes("gi section") || normalized.includes("gypsum")) return "False Ceiling";
  if (normalized.includes("electrical") || normalized.includes("cable") || normalized.includes("led") || normalized.includes("mcb") || normalized.includes("conduit") || normalized.includes("light") || normalized.includes("switch")) return "Electrical & Lighting";
  if (normalized.includes("tile") || normalized.includes("floor") || normalized.includes("wooden flooring") || normalized.includes("epoxy")) return "Flooring";
  if (normalized.includes("pipe") || normalized.includes("valve") || normalized.includes("joint") || normalized.includes("plumb")) return "Plumbing";
  if (normalized.includes("glass") || normalized.includes("glazing") || normalized.includes("channel") || normalized.includes("sealant")) return "Glass & Glazing";
  if (normalized.includes("copper piping") || normalized.includes("ducting") || normalized.includes("grille") || normalized.includes("diffuser") || normalized.includes("bracket") || normalized.includes("ac")) return "HVAC";
  return "Uncategorised";
};

const updateMaterial = (m: any): Material => {
  const id = m.id || `mat-${Math.random().toString(36).substring(2, 9)}`;
  const name = m.name || "";
  const category = m.category || getCategoryForMaterialName(name);
  const dispatched = m.dispatched ?? 0;
  const accounted = m.accounted ?? 0;
  const unitPrice = m.unitPrice ?? 0;
  const unit = m.unit || "nos";
  const accountedVal = accounted === "" ? 0 : Number(accounted);
  
  return {
    ...m,
    id,
    name,
    category,
    unit,
    dispatched,
    accounted,
    unitPrice,
    gap: dispatched - accountedVal,
    totalCost: dispatched * unitPrice
  };
};

const migrateCategoryBudgets = (categories?: Category[]): Record<string, number> => {
  const budgets: Record<string, number> = {};
  if (!categories) return budgets;
  categories.forEach((c) => {
    let name = c.name;
    if (name === "Electrical" || name === "Electrical & Lighting") {
      name = "Electrical & Lighting";
    } else if (name === "Carpentry" || name === "Furniture & Fixtures") {
      name = "Furniture & Fixtures";
    }
    budgets[name] = (budgets[name] || 0) + c.budget;
  });
  return budgets;
};

const getDynamicCategories = (p: Project) => {
  const categoriesList = [...MASTER_CATEGORIES];
  (p.materials || []).forEach((m) => {
    const cat = m.category || "Uncategorised";
    if (!categoriesList.includes(cat)) {
      categoriesList.push(cat);
    }
  });

  const categoriesMap: Record<string, { name: string; spent: number; budget: number }> = {};
  categoriesList.forEach((cat) => {
    categoriesMap[cat] = {
      name: cat,
      spent: 0,
      budget: p.categoryBudgets?.[cat] ?? 0,
    };
  });

  (p.materials || []).forEach((m) => {
    const cat = m.category || "Uncategorised";
    if (cat === "Labour") {
      return;
    }
    if (categoriesMap[cat]) {
      categoriesMap[cat].spent += (m.dispatched ?? 0) * (m.unitPrice ?? 0);
    }
  });

  const totalLabourCost = (p.salary || []).reduce((sum, s) => sum + (s.amount === "" ? 0 : Number(s.amount)), 0);
  if (categoriesMap["Labour"]) {
    categoriesMap["Labour"].spent = totalLabourCost;
  }

  const sortedNormalCategories = Object.values(categoriesMap).sort((a, b) => a.name.localeCompare(b.name));

  const totalPettyCash = (p.pettyCash || []).reduce((sum, entry) => sum + (entry.amount === "" ? 0 : Number(entry.amount)), 0);
  const pettyCashCategory = {
    name: "Petty Cash",
    spent: totalPettyCash,
    budget: p.categoryBudgets?.["Petty Cash"] ?? 0,
  };

  return [...sortedNormalCategories, pettyCashCategory];
};

const cleanCategoryBudgets = (p: Project): Record<string, number> => {
  const budgets: Record<string, number> = {};
  const activeCategories = new Set<string>(MASTER_CATEGORIES);
  activeCategories.add("Petty Cash");
  
  (p.materials || []).forEach((m) => {
    activeCategories.add(m.category || "Uncategorised");
  });
  
  const currentBudgets = p.categoryBudgets || {};
  activeCategories.forEach((cat) => {
    budgets[cat] = currentBudgets[cat] ?? 0;
  });
  
  return budgets;
};

const getProjectReceived = (p: Project): number => {
  return p.milestones
    .filter((m) => m.status === "done")
    .reduce((sum, m) => sum + (m.amount === "" ? 0 : Number(m.amount)), 0);
};

const getProjectSpent = (p: Project): number => {
  const cats = getDynamicCategories(p);
  return cats.reduce((sum, c) => sum + c.spent, 0);
};

const getProjectNet = (p: Project): number => {
  return getProjectReceived(p) - getProjectSpent(p);
};

const parseAnyDate = (dateStr: string, isEnd: boolean): Date => {
  if (!dateStr || dateStr.trim() === "") {
    return isEnd ? new Date("2999-12-31") : new Date("1970-01-01");
  }
  const trimmed = dateStr.trim();
  
  // Check if it's YYYY-MM-DD
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (isEnd) {
          date.setHours(23, 59, 59, 999);
        } else {
          date.setHours(0, 0, 0, 0);
        }
        return date;
      }
    }
  }

  // Check if it's DD Month YYYY
  const parts = trimmed.split(/\s+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    const months: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      january: 0, february: 1, march: 2, april: 3, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const month = months[monthStr.substring(0, 3)] !== undefined ? months[monthStr.substring(0, 3)] : 0;
    if (!isNaN(day) && !isNaN(year)) {
      const date = new Date(year, month, day);
      if (isEnd) {
        date.setHours(23, 59, 59, 999);
      } else {
        date.setHours(0, 0, 0, 0);
      }
      return date;
    }
  }

  const fallback = new Date(trimmed);
  if (isNaN(fallback.getTime())) {
    return isEnd ? new Date("2999-12-31") : new Date("1970-01-01");
  }
  if (isEnd) {
    fallback.setHours(23, 59, 59, 999);
  } else {
    fallback.setHours(0, 0, 0, 0);
  }
  return fallback;
};

const parseProjectDate = (dateStr: string, isEnd: boolean): Date => parseAnyDate(dateStr, isEnd);
const parseInputDate = (dateStr: string, isEnd: boolean): Date => parseAnyDate(dateStr, isEnd);

const parseAnyDateForDisplay = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.trim() === "") return null;
  const parsed = parseAnyDate(dateStr, false);
  if (parsed.getFullYear() === 1970 && parsed.getMonth() === 0 && parsed.getDate() === 1) {
    return null;
  }
  return parsed;
};

const formatProjectDate = (dateStr: string): string => {
  const date = parseAnyDateForDisplay(dateStr);
  if (!date) return "Set date";
  const day = date.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const padDay = day < 10 ? "0" + day : day;
  return `${padDay} ${month} ${year}`;
};

const toISODateString = (dateStr: string | number): string => {
  if (!dateStr) return "";
  const date = parseAnyDateForDisplay(String(dateStr));
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysRemainingOrDuration = (p: Project): string => {
  const start = parseAnyDateForDisplay(p.startDate);
  const end = parseAnyDateForDisplay(p.endDate);
  
  if (!start || !end) {
    return "Dates not set";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startMs = start.getTime();
  const endMs = end.getTime();
  const todayMs = today.getTime();

  const msPerDay = 24 * 60 * 60 * 1000;

  if (todayMs < startMs) {
    const diffDays = Math.ceil((startMs - todayMs) / msPerDay);
    return `Starts in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  } else if (todayMs <= endMs) {
    const diffDays = Math.ceil((endMs - todayMs) / msPerDay);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} remaining`;
  } else {
    const diffDays = Math.floor((todayMs - endMs) / msPerDay);
    return `Ended ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }
};

const isProjectInRange = (p: Project, fromDate: string, toDate: string): boolean => {
  const pStart = parseProjectDate(p.startDate, false);
  const pEnd = parseProjectDate(p.endDate, true);
  const selStart = fromDate ? parseInputDate(fromDate, false) : new Date("1970-01-01");
  const selEnd = toDate ? parseInputDate(toDate, true) : new Date("2999-12-31");
  return pStart <= selEnd && pEnd >= selStart;
};

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

/* ── DATE RANGE PICKER ── */
.date-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.date-picker-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: .68rem;
  color: var(--text-3);
  margin-right: 4px;
}
.date-input-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 4px 8px;
  border-radius: 6px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.date-input-container:focus-within {
  border-color: var(--green-2);
  box-shadow: 0 0 0 2px var(--green-soft);
}
.date-input-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: .58rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}
.date-input {
  font-family: 'JetBrains Mono', monospace;
  font-size: .7rem;
  border: none;
  background: transparent;
  color: var(--text);
  outline: none;
  padding: 0;
  cursor: pointer;
}
.date-clear-btn {
  font-family: 'Inter', sans-serif;
  font-size: .68rem;
  font-weight: 500;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.date-clear-btn:hover {
  color: var(--text);
  border-color: var(--border-2);
  background: var(--surface-3);
}
.no-projects-msg {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r);
  color: var(--text-3);
  font-size: .88rem;
}

/* ── PROJECT DETAIL ACTION BUTTON ── */
.proj-new-btn {
  font-family: 'Inter', sans-serif;
  font-size: .76rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px dashed var(--green-2);
  background: var(--green-soft);
  color: var(--green);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}
.proj-new-btn:hover {
  background: var(--green-line);
  color: var(--green);
}

/* ── MODAL STYLES ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  min-width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  position: relative;
}
@media (max-width: 533px) {
  .modal-content {
    min-width: unset;
    width: 90vw;
  }
}
.modal-header {
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.modal-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}
.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--text-3);
  cursor: pointer;
  transition: color 0.15s;
  padding: 4px;
}
.modal-close-btn:hover {
  color: var(--text);
}
.modal-body {
  padding: 2rem 1.5rem;
}
.modal-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  border: 1px dashed var(--border-2);
  border-radius: var(--r);
  background: var(--surface-2);
}
.modal-placeholder-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}
.modal-placeholder-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: var(--text-2);
  line-height: 1.5;
}
.modal-footer {
  position: sticky;
  bottom: 0;
  background: var(--surface);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 1rem;
  border-top: 1px solid var(--border);
}
.modal-btn-secondary {
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.modal-btn-secondary:hover {
  background: var(--surface-3);
  color: var(--text);
  border-color: var(--border-2);
}
.modal-btn-primary {
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--green);
  background: var(--green);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;
}
.modal-btn-primary:hover {
  background: var(--green-2);
  border-color: var(--green-2);
}
.modal-btn-primary:disabled {
  background: var(--surface-3);
  border-color: var(--border-2);
  color: var(--text-3);
  cursor: not-allowed;
}
.editable-field {
  cursor: pointer;
  border-bottom: 1px dotted transparent;
  transition: border-bottom-color 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.editable-field:hover {
  border-bottom: 1px dotted var(--green-2);
}
.editable-field::after {
  content: " ✎";
  font-size: 0.7em;
  color: var(--text-3);
  opacity: 0;
  transition: opacity 0.15s;
  font-weight: normal;
}
.editable-field:hover::after {
  opacity: 0.6;
}

.inline-edit-input {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  width: 100%;
}
.inline-edit-input:focus {
  border-color: var(--green-2);
  box-shadow: 0 0 0 2px var(--green-soft);
}

select.status-pill-select {
  font-family: 'Inter', sans-serif;
  font-size: .66rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--border-2);
  background: var(--surface);
  color: var(--text);
  outline: none;
  cursor: pointer;
}

input.inline-pill-input {
  font-family: 'Inter', sans-serif;
  font-size: .66rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(--border-2);
  background: var(--surface);
  color: var(--text);
  outline: none;
  max-width: 120px;
}
.modal-form-group {
  margin-bottom: 1.25rem;
}
.modal-form-group:last-child {
  margin-bottom: 0;
}
.modal-form-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.modal-form-input, .modal-form-select {
  font-family: 'Inter', sans-serif;
  width: 100%;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border-2);
  border-radius: 6px;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
}
.modal-form-input:focus, .modal-form-select:focus {
  border-color: var(--green-2);
  background: var(--surface-3);
  box-shadow: 0 0 0 2px var(--green-soft);
}
.dispatched-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}
.qty-controls {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease-in-out;
  display: inline-flex;
  gap: 4px;
}
tr:hover .qty-controls {
  opacity: 1;
  pointer-events: auto;
}
.qty-btn {
  background: var(--surface-3);
  border: 1px solid var(--border-2);
  color: var(--text);
  border-radius: 4px;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.8rem;
  transition: all 0.1s ease;
  user-select: none;
  line-height: 1;
  padding: 0;
}
.qty-btn:hover {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}
.row-delete-container .row-delete-btn {
  opacity: 0;
  pointer-events: none;
  background: none;
  border: none;
  color: var(--red);
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: opacity 0.15s ease-in-out;
}
.row-delete-container:hover .row-delete-btn {
  opacity: 0.7;
  pointer-events: auto;
}
.row-delete-container .row-delete-btn:hover {
  opacity: 1;
}
.material-add-btn {
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px dashed var(--green-2);
  background: var(--green-soft);
  color: var(--green-2);
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.material-add-btn:hover {
  background: var(--green-2);
  color: #fff;
}
.autocomplete-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border-2);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1050;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 4px;
}
.autocomplete-suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.autocomplete-suggestion-item:last-child {
  border-bottom: none;
}
.autocomplete-suggestion-item:hover {
  background: var(--surface-3);
}
.autocomplete-suggestion-name {
  font-weight: 500;
  color: var(--text);
}
.autocomplete-suggestion-category {
  font-size: 0.72rem;
  color: var(--text-3);
  background: var(--surface-2);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}
.autocomplete-no-results {
  padding: 12px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-3);
}
.autocomplete-custom-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--green-2);
  font-weight: 500;
  border-top: 1px dashed var(--border-2);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--green-soft);
  transition: background 0.15s;
}
.autocomplete-custom-option:hover {
  background: rgba(16, 185, 129, 0.15);
}
.dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}
.dialog-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.75rem 0;
}
.dialog-message {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: var(--text-2);
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  white-space: pre-line;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.dialog-btn-cancel {
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.dialog-btn-cancel:hover {
  background: var(--surface-3);
  color: var(--text);
  border-color: var(--border-2);
}
.dialog-btn-confirm {
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--red, #ef4444);
  background: var(--red, #ef4444);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;
}
.dialog-btn-confirm:hover {
  background: #dc2626;
  border-color: #dc2626;
}
.dialog-btn-ok {
  font-family: 'Inter', sans-serif;
  font-size: 0.76rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid var(--green);
  background: var(--green);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s;
}
.dialog-btn-ok:hover {
  background: var(--green-2);
  border-color: var(--green-2);
}
.highlight-flash {
  animation: section-flash 2s ease-out;
  border-radius: 8px;
}
@keyframes section-flash {
  0% {
    outline: 2px solid var(--green);
    outline-offset: 4px;
    background-color: var(--green-soft);
  }
  100% {
    outline: 2px solid transparent;
    outline-offset: 4px;
    background-color: transparent;
  }
}
.context-menu-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--red);
  padding: 8px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s;
}
.context-menu-item:hover {
  background: var(--red-soft);
}
`;


// ─── COMPONENTS ────────────────────────────────────────
function InlineEdit({
  value,
  onSave,
  type = "text",
  options,
  formatValue,
  isNumeric = false,
  className = "",
  style,
  inputClassName = "",
  emptyOnZero = false,
  placeholder,
}: {
  value: string | number;
  onSave: (val: any) => void;
  type?: "text" | "number" | "select" | "date";
  options?: { value: string; label: string }[];
  formatValue?: (val: any) => string;
  isNumeric?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputClassName?: string;
  emptyOnZero?: boolean;
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      save();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const save = () => {
    let finalVal = editValue;
    if (type === "date") {
      if (finalVal) {
        finalVal = formatProjectDate(String(finalVal));
      } else {
        finalVal = "";
      }
    } else if (isNumeric) {
      if (editValue === "") {
        finalVal = emptyOnZero ? "" : 0;
      } else {
        finalVal = Number(editValue);
        if (isNaN(finalVal)) {
          finalVal = Number(value) || (emptyOnZero ? "" : 0);
        } else if (emptyOnZero && finalVal === 0) {
          finalVal = "";
        }
      }
    }
    onSave(finalVal);
    setIsEditing(false);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isEditing && type === "date" && inputRef.current) {
      try {
        inputRef.current.showPicker();
      } catch (err) {
        // Fallback for environments where showPicker is not supported
      }
    }
  }, [isEditing, type]);

  if (isEditing) {
    if (type === "select" && options) {
      return (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          autoFocus
          className={inputClassName || "inline-edit-input"}
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "date") {
      return (
        <input
          ref={inputRef}
          type="date"
          value={toISODateString(editValue)}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          autoFocus
          className={inputClassName || "inline-edit-input"}
          style={{ ...style, width: "auto" }}
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    return (
      <input
        type={type}
        placeholder={placeholder || (isNumeric && emptyOnZero ? "0" : undefined)}
        value={editValue}
        onChange={(e) => {
          const val = e.target.value;
          if (isNumeric && emptyOnZero) {
            if (val === "") {
              setEditValue("");
            } else {
              const parsed = Number(val);
              setEditValue(isNaN(parsed) ? "" : parsed);
            }
          } else {
            setEditValue(val);
          }
        }}
        onBlur={save}
        onKeyDown={handleKeyDown}
        autoFocus
        className={inputClassName || "inline-edit-input"}
        style={style}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  const isNumericPlaceholder = isNumeric && emptyOnZero && (value === 0 || value === "0" || value === "");
  const displayVal = isNumericPlaceholder
    ? ""
    : formatValue
      ? formatValue(value)
      : value;
  const isEmptyDate = type === "date" && (!value || String(value).trim() === "");
  const isValEmpty = displayVal === "" || displayVal === null || displayVal === undefined || value === "";
  const isPlaceholder = isEmptyDate || isNumericPlaceholder || isValEmpty;
  const defaultPlaceholder = isEmptyDate ? "Set date" : "Click to edit";
  const displayText = isValEmpty ? (placeholder || defaultPlaceholder) : displayVal;

  return (
    <span
      className={`editable-field ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        if (isNumeric && emptyOnZero && (value === 0 || value === "0")) {
          setEditValue("");
        } else {
          setEditValue(value);
        }
      }}
      style={{
        display: "inline-flex",
        cursor: "pointer",
        color: isPlaceholder ? "var(--text-4)" : undefined,
        fontStyle: isPlaceholder ? "italic" : undefined,
        minWidth: isNumeric && emptyOnZero ? "24px" : undefined,
        minHeight: isNumeric && emptyOnZero ? "20px" : undefined,
        ...style,
      }}
    >
      {displayText}
    </span>
  );
}

function Header({ screen, setScreen }: { screen: string; setScreen: (s: "home" | "detail" | "alerts") => void }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
  }, []);
  return (
    <header className="gl-header">
      <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setScreen("home"); }}>
        <img src={logo} alt="Greenline Associates" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '50%' }} />
        <div className="logo-name">
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Greenline</span>
          <span style={{ color: '#111827', fontWeight: 700 }}> Associates</span>
        </div>
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

function HomeScreen({
  open,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  projectList,
  alertsList,
  onNavigateToProject,
}: {
  open: (id: number) => void;
  fromDate: string;
  toDate: string;
  setFromDate: (s: string) => void;
  setToDate: (s: string) => void;
  projectList: Project[];
  alertsList: Alert[];
  onNavigateToProject: (projectId: number, sectionId: string | null) => void;
}) {
  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => isProjectInRange(p, fromDate, toDate));
  }, [projectList, fromDate, toDate]);

  const { totalContractValue, totalReceived, totalSpent, netCash } = useMemo(() => {
    let tContract = 0;
    let tReceived = 0;
    let tSpent = 0;
    filteredProjects.forEach((p) => {
      tContract += p.contractValue;
      tReceived += getProjectReceived(p);
      tSpent += getProjectSpent(p);
    });
    return {
      totalContractValue: tContract,
      totalReceived: tReceived,
      totalSpent: tSpent,
      netCash: tReceived - tSpent,
    };
  }, [filteredProjects]);

  const receivedPct = totalContractValue > 0 ? pct(totalReceived, totalContractValue) : 0;
  const spentPct = totalReceived > 0 ? pct(totalSpent, totalReceived) : 0;
  const spentFillClass = spentPct > 90 ? "pf-red" : spentPct > 80 ? "pf-amber" : "pf-green";
  const netCashColor = netCash >= 0 ? "c-green" : "c-red";
  const netCashLabel = netCash >= 0 ? "+" + fmt(netCash) : "-" + fmt(Math.abs(netCash));
  const netCashFillClass = netCash >= 0 ? "pf-green" : "pf-red";
  const netCashHealth = netCash >= 0 ? "Positive" : "Negative";

  const filteredAlerts = useMemo(() => {
    return alertsList.filter((a) => filteredProjects.some((p) => p.name === a.project));
  }, [alertsList, filteredProjects]);

  return (
    <div className="screen active">
      <style>{`
        .view-project-btn {
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .view-project-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
        }
        .view-project-btn:active {
          transform: scale(0.97);
        }
        .view-project-btn:hover .btn-arrow {
          transform: translateX(4px);
        }
        .btn-arrow {
          display: inline-block;
          transition: transform 0.18s ease;
        }
      `}</style>
      <div className="sh mb" style={{ marginTop: ".25rem", alignItems: "center" }}>
        <span className="sh-label">Business Overview</span>
        <div className="sh-line"></div>
        <div className="date-picker-wrapper">
          <div className="date-input-container">
            <label className="date-input-label" htmlFor="from-date">From</label>
            <input
              type="date"
              id="from-date"
              className="date-input"
              value={fromDate}
              onChange={(e) => {
                const val = e.target.value;
                setFromDate(val);
                localStorage.setItem('greenline_date_filter', JSON.stringify({ from: val, to: toDate }));
              }}
            />
          </div>
          <div className="date-input-container">
            <label className="date-input-label" htmlFor="to-date">To</label>
            <input
              type="date"
              id="to-date"
              className="date-input"
              value={toDate}
              onChange={(e) => {
                const val = e.target.value;
                setToDate(val);
                localStorage.setItem('greenline_date_filter', JSON.stringify({ from: fromDate, to: val }));
              }}
            />
          </div>
          {(fromDate || toDate) && (
            <button
              className="date-clear-btn"
              onClick={() => {
                setFromDate("");
                setToDate("");
                localStorage.setItem('greenline_date_filter', JSON.stringify({ from: "", to: "" }));
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="g4 mb fade-up">
        <div className="card">
          <div className="stat-lbl">Total Contract Value</div>
          <div className="stat-val">{fmt(totalContractValue)}</div>
          <div className="stat-hint">
            Across {filteredProjects.length} active project{filteredProjects.length === 1 ? "" : "s"}
          </div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Received</span><span>{fmt(totalReceived)}</span></div>
            <div className="prog-track"><div className="prog-fill pf-gold" style={{ width: `${receivedPct}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Money Received</div>
          <div className="stat-val c-green">{fmt(totalReceived)}</div>
          <div className="stat-hint">From clients this year</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of total contract</span><span>{receivedPct}%</span></div>
            <div className="prog-track"><div className="prog-fill pf-green" style={{ width: `${receivedPct}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Money Spent</div>
          <div className="stat-val">{fmt(totalSpent)}</div>
          <div className="stat-hint">Vendors + Labour + Materials</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of received</span><span>{spentPct}%</span></div>
            <div className="prog-track"><div className={`prog-fill ${spentFillClass}`} style={{ width: `${spentPct}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Net Cash Position</div>
          <div className={`stat-val ${netCashColor}`}>{netCashLabel}</div>
          <div className="stat-hint">Received minus spent</div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Health</span><span>{netCashHealth}</span></div>
            <div className="prog-track"><div className={`prog-fill ${netCashFillClass}`} style={{ width: "100%" }}></div></div>
          </div>
        </div>
      </div>

      <div className="g21 fade-up delay-1">
        <div>
          <div className="sh mb"><span className="sh-label">Active Projects</span><div className="sh-line"></div></div>
          <div className="g3">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => {
                const rcv = getProjectReceived(p);
                const net = rcv - getProjectSpent(p);
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
                        <div className="pc-dates" style={{ fontSize: "0.76rem", color: "var(--text-3)", marginTop: "0.2rem" }}>
                          {formatProjectDate(p.startDate)} - {formatProjectDate(p.endDate)}
                        </div>
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
                        <div className="pc-stat-val c-green">{fmt(rcv)}</div>
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
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--text-3)", marginTop: "0.5rem" }}>
                      <span>Timeline:</span>
                      <span className="mono" style={{ fontWeight: 500 }}>{getDaysRemainingOrDuration(p)}</span>
                    </div>
                    <div className="pc-alert" style={{ marginTop: ".7rem" }}>
                      <div className="pc-alert-dot" style={{ background: dotCol }}></div>
                      <span>{p.alertMsg}</span>
                    </div>
                    <button className="view-btn">View full project →</button>
                  </div>
                );
              })
            ) : (
              <div className="no-projects-msg" style={{ gridColumn: "span 3" }}>
                No active projects found in the selected date range. Try expanding your search.
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="sh mb"><span className="sh-label">Alerts · Action Needed</span><div className="sh-line"></div></div>
          <div>
            {filteredAlerts.length > 0 ? (
              filteredAlerts.slice(0, 5).map((a, i) => {
                const matchingProj = projectList.find(
                  (p) => p.name.trim().toLowerCase() === a.project.trim().toLowerCase()
                );
                const sectionId = getSectionForAlert(a);

                return (
                  <div key={i} className={`alert-item ai-${a.type}`}>
                    <div className="ai-icon">{a.type === "danger" ? "!" : a.type === "warning" ? "!" : "✓"}</div>
                    <div style={{ flex: 1 }}>
                      <div className="ai-title">{a.title}</div>
                      <div className="ai-desc">{a.desc}</div>
                      <div className="ai-project">{a.project}</div>
                      {matchingProj && (
                        <button
                          className="view-project-btn"
                          onClick={() => onNavigateToProject(matchingProj.id, sectionId)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1.5px solid #16a34a',
                            background: 'transparent',
                            color: '#16a34a',
                            fontSize: '13px',
                            fontWeight: 500,
                          }}
                        >
                          View Project <span className="btn-arrow">→</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-projects-msg" style={{ padding: "2rem 1rem" }}>
                No active alerts for the selected range.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const cloneProjectAsTemplate = (p: Project): Project => {
  return {
    id: Date.now(),
    name: "New Project",
    client: "",
    location: "",
    status: "healthy",
    statusLabel: "On Track",
    stage: p.stage || "",
    startDate: "",
    endDate: "",
    contractValue: 0,
    completion: 0,
    alertMsg: "All systems healthy",
    alertType: "safe",
    milestones: p.milestones.map((m) => ({
      name: m.name,
      amount: 0,
      date: "",
      status: "upcoming"
    })),
    categoryBudgets: {},
    categories: [],
    materials: [],
    salary: [],
    vendors: [],
    pettyCash: [],
    totalBudget: 0
  };
};

function DetailScreen({
  id,
  setId,
  back,
  projectList,
  onUpdateProject,
  onCreateProject,
  onDeleteProject,
  confirmModal,
  setConfirmModal,
  highlightedSection,
}: {
  id: number;
  setId: (i: number) => void;
  back: () => void;
  projectList: Project[];
  onUpdateProject: (p: Project) => void;
  onCreateProject: (p: Project) => void;
  onDeleteProject: (id: number) => void;
  confirmModal: {
    open: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
  setConfirmModal: React.Dispatch<React.SetStateAction<{
    open: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>>;
  highlightedSection: string | null;
}) {
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [poFile, setPoFile] = useState<{ name: string; data: string } | null>(null);
  const poInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`po_pdf_${id}`);
      if (saved) {
        try {
          setPoFile(JSON.parse(saved));
        } catch (e) {
          setPoFile(null);
        }
      } else {
        setPoFile(null);
      }
    }
  }, [id]);

  const base64ToBlob = (base64: string, mime: string = "application/pdf") => {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  };

  const handleOpenPO = () => {
    if (!poFile) return;
    try {
      const blob = base64ToBlob(poFile.data, "application/pdf");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to open PO PDF:", err);
    }
  };

  const handleAttachPO = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const base64String = result.split(",")[1] || result;
        const poData = { name: file.name, data: base64String };
        localStorage.setItem(`po_pdf_${id}`, JSON.stringify(poData));
        setPoFile(poData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePO = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(`po_pdf_${id}`);
    setPoFile(null);
    if (poInputRef.current) {
      poInputRef.current.value = "";
    }
  };
  const [libraryItems, setLibraryItems] = useState(() => getGlobalMaterialsLibrary());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    categoryName: string;
  } | null>(null);

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  useEffect(() => {
    if (highlightedSection) {
      setTimeout(() => {
        const el = document.getElementById(highlightedSection);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [highlightedSection]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<{ name: string; unit: string; cost: number; category: string } | null>(null);
  const [isCustomItem, setIsCustomItem] = useState<boolean>(false);
  const [customItemName, setCustomItemName] = useState<string>("");
  const [customUnit, setCustomUnit] = useState<string>("");
  const [customUnitCost, setCustomUnitCost] = useState<number>(0);
  const [initialDispatched, setInitialDispatched] = useState<number | string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const openAddMaterialModal = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setCustomCategory("");
    setSelectedItem(null);
    setIsCustomItem(false);
    setCustomItemName("");
    setCustomUnit("");
    setCustomUnitCost(0);
    setInitialDispatched("");
    setShowSuggestions(false);
    setIsAddMaterialModalOpen(true);
  };

  const suggestionsList = useMemo(() => {
    const list: Array<{ name: string; unit: string; cost: number; category: string; alreadyInProject: boolean }> = [];
    const seen = new Set<string>();

    const p = projectList.find((pp) => pp.id === id) || projectList[0];

    // 1. Add all library items
    libraryItems.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      seen.add(key);
      const inProject = (p.materials || []).some(
        (m) => m.name.trim().toLowerCase() === key
      );
      list.push({
        name: item.name,
        unit: item.unit,
        cost: item.cost ?? 0,
        category: item.category || "Uncategorised",
        alreadyInProject: inProject,
      });
    });

    // 2. Add currently-added project materials if not already in the library list
    (p.materials || []).forEach((m) => {
      const key = m.name.trim().toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      list.push({
        name: m.name,
        unit: m.unit,
        cost: m.unitCost ?? 0,
        category: m.category || "Uncategorised",
        alreadyInProject: true,
      });
    });

    return list;
  }, [libraryItems, projectList, id]);

  const filteredItems = useMemo(() => {
    let items = suggestionsList;
    if (categoryFilter !== "All" && categoryFilter !== "Custom") {
      items = items.filter(it => it.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(it => it.name.toLowerCase().includes(q));
  }, [suggestionsList, searchQuery, categoryFilter]);

  const handleSelectSuggestion = (item: { name: string; unit: string; cost: number; category: string; alreadyInProject?: boolean }) => {
    setSelectedItem(item);
    setIsCustomItem(false);
    setSearchQuery(item.name);
    setCustomUnitCost(item.cost);
    setShowSuggestions(false);
    let cat = item.category;
    if (cat === "Electrical") cat = "Electrical & Lighting";
    if (cat === "Carpentry") cat = "Furniture & Fixtures";
    setCategoryFilter(cat);
  };

  const handleSelectCustomItem = () => {
    setSelectedItem(null);
    setIsCustomItem(true);
    setCustomItemName(searchQuery);
    setCustomUnit("");
    setCustomUnitCost(0);
    setShowSuggestions(false);
  };

  const handleAdjustQty = (index: number, delta: number) => {
    const p = projectList.find((pp) => pp.id === id) || projectList[0];
    const updatedMaterials = [...p.materials];
    const currentQty = updatedMaterials[index].dispatched;
    const newQty = Math.max(0, currentQty + delta);
    updatedMaterials[index] = updateMaterial({
      ...updatedMaterials[index],
      dispatched: newQty
    });
    onUpdateProject({
      ...p,
      materials: updatedMaterials
    });
  };

  const handleDeleteMaterial = (index: number) => {
    const p = projectList.find((pp) => pp.id === id) || projectList[0];
    const updatedMaterials = p.materials.filter((_, idx) => idx !== index);
    onUpdateProject({
      ...p,
      materials: updatedMaterials
    });
  };

  const handleAddMaterial = () => {
    const p = projectList.find((pp) => pp.id === id) || projectList[0];
    let name = "";
    let unit = "";
    let cost = 0;

    if (isCustomItem || categoryFilter === "Custom") {
      name = customItemName.trim();
      unit = customUnit.trim();
      cost = Number(customUnitCost) || 0;
    } else if (selectedItem) {
      name = selectedItem.name;
      unit = selectedItem.unit;
      cost = Number(customUnitCost) || 0;
    } else {
      return;
    }

    if (!name) return;

    let category = categoryFilter;
    if (categoryFilter === "Custom") {
      const customCat = customCategory.trim();
      if (!customCat) return;

      const existing = MASTER_CATEGORIES.find(
        (c) => c.toLowerCase() === customCat.toLowerCase()
      );
      if (existing) {
        category = existing;
      } else {
        category = customCat;
        MASTER_CATEGORIES.push(category);
        if (typeof window !== "undefined") {
          localStorage.setItem("gl_master_categories", JSON.stringify(MASTER_CATEGORIES));
        }
      }
    }
    if (!category || category === "All") return;

    const newMaterial = updateMaterial({
      name,
      unit: unit || "nos",
      dispatched: Number(initialDispatched) || 0,
      accounted: 0,
      unitCost: cost,
      unitPrice: cost,
      category
    });

    const updatedMaterials = [...p.materials, newMaterial];
    onUpdateProject({
      ...p,
      materials: updatedMaterials
    });

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("greenline_materials_library");
      let lib: Array<{ name: string; unit: string; category: string; cost: number }> = [];
      if (stored) {
        try {
          lib = JSON.parse(stored);
        } catch (e) {}
      }
      const exists = lib.some((item) => item.name.trim().toLowerCase() === name.trim().toLowerCase());
      if (!exists) {
        const newItem = {
          name: name.trim(),
          unit: unit || "nos",
          category: category || "Uncategorised",
          cost: cost || 0
        };
        const updatedLib = [...lib, newItem];
        localStorage.setItem("greenline_materials_library", JSON.stringify(updatedLib));
        setLibraryItems(updatedLib);
      }
    }

    setIsAddMaterialModalOpen(false);
  };

  const p = projectList.find((pp) => pp.id === id) || projectList[0];
  const received = getProjectReceived(p);
  const spent = getProjectSpent(p);
  const net = received - spent;
  const netStr = (net >= 0 ? "+" : "") + fmtFull(net);

  // Derive categories list dynamically
  const derivedCategories = getDynamicCategories(p);

  const sumOfCategoryBudgets = Object.values(p.categoryBudgets || {}).reduce((s, b) => s + (b === "" ? 0 : Number(b)), 0);
  const totalBudget = p.totalBudget !== undefined ? p.totalBudget : sumOfCategoryBudgets;
  const totalSpent = spent;
  const totalSalary = p.salary.reduce((s, e) => s + (e.amount === "" ? 0 : Number(e.amount)), 0);
  const sp = p.status === "healthy" ? "sp-green" : p.status === "warning" ? "sp-amber" : "sp-red";
  const pf = p.status === "healthy" ? "pf-green" : p.status === "warning" ? "pf-amber" : "pf-red";

  const statusOptions = [
    { value: "healthy", label: "On Track" },
    { value: "warning", label: "Attention" },
    { value: "danger", label: "At Risk" },
  ];

  const milestoneStatusOptions = [
    { value: "done", label: "Collected" },
    { value: "overdue", label: "Overdue" },
    { value: "upcoming", label: "Upcoming" },
  ];

  const handleStatusChange = (newStatus: "healthy" | "warning" | "danger") => {
    const labelMap = {
      healthy: "On Track",
      warning: "Attention",
      danger: "At Risk"
    };
    const alertTypeMap = {
      healthy: "safe",
      warning: "warning",
      danger: "danger"
    } as const;
    const alertMsgMap = {
      healthy: "All systems healthy",
      warning: "Electrical spend exceeding budget",
      danger: "Client milestone payment 18 days overdue"
    };
    onUpdateProject({
      ...p,
      status: newStatus,
      statusLabel: labelMap[newStatus],
      alertType: alertTypeMap[newStatus],
      alertMsg: alertMsgMap[newStatus]
    });
  };

  const updateMilestone = (index: number, key: keyof Milestone, value: any) => {
    const updatedMilestones = [...p.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [key]: value
    };
    onUpdateProject({
      ...p,
      milestones: updatedMilestones
    });
  };

  const handleAddMilestone = () => {
    const newMilestone: Milestone = {
      name: "",
      date: "",
      amount: "",
      status: "upcoming"
    };
    onUpdateProject({
      ...p,
      milestones: [...p.milestones, newMilestone]
    });
  };

  const handleDeleteMilestone = (index: number) => {
    const updatedMilestones = p.milestones.filter((_, idx) => idx !== index);
    onUpdateProject({
      ...p,
      milestones: updatedMilestones
    });
  };

  const deleteCategory = (catKey: string) => {
    if (catKey === "Petty Cash") return;
    console.log("deleteCategory called for category:", catKey);

    // 1. Remove category from MASTER_CATEGORIES
    MASTER_CATEGORIES = MASTER_CATEGORIES.filter(
      (cat) => cat.trim().toLowerCase() !== catKey.trim().toLowerCase()
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("gl_master_categories", JSON.stringify(MASTER_CATEGORIES));
    }

    // 2. Remove all materials in the current project under this category
    const updatedMaterials = (p.materials || []).filter(
      (m) => m.category?.trim().toLowerCase() !== catKey.trim().toLowerCase()
    );

    // 3. Remove budget for this category
    const updatedBudgets = { ...(p.categoryBudgets || {}) };
    delete updatedBudgets[catKey];

    // 4. Update projects list and write synchronously to localStorage
    const updatedProjects = projectList.map((proj) =>
      proj.id === p.id
        ? {
            ...proj,
            materials: updatedMaterials,
            categoryBudgets: updatedBudgets
          }
        : proj
    );
    if (typeof window !== "undefined") {
      localStorage.setItem("gl_projects", JSON.stringify(updatedProjects));
    }

    // 5. Update React state so the UI re-renders
    onUpdateProject({
      ...p,
      materials: updatedMaterials,
      categoryBudgets: updatedBudgets
    });
  };

  const handleUpdateVendor = (index: number, key: keyof Vendor, value: any) => {
    const updatedVendors = [...p.vendors];
    updatedVendors[index] = {
      ...updatedVendors[index],
      [key]: value
    };
    onUpdateProject({
      ...p,
      vendors: updatedVendors
    });
  };

  const handleDeleteVendor = (index: number) => {
    const updatedVendors = p.vendors.filter((_, idx) => idx !== index);
    onUpdateProject({
      ...p,
      vendors: updatedVendors
    });
  };

  const handleAddInvoice = () => {
    const newVendor: Vendor = {
      name: "",
      invoice: "",
      date: "",
      due: "",
      amount: 0,
      status: "due"
    };
    onUpdateProject({
      ...p,
      vendors: [...p.vendors, newVendor]
    });
  };

  const handleUpdateSalary = (index: number, key: keyof Salary, value: any) => {
    const updatedSalary = [...p.salary];
    updatedSalary[index] = {
      ...updatedSalary[index],
      [key]: value
    };
    onUpdateProject({
      ...p,
      salary: updatedSalary
    });
  };

  const handleDeleteSalary = (index: number) => {
    const updatedSalary = p.salary.filter((_, idx) => idx !== index);
    onUpdateProject({
      ...p,
      salary: updatedSalary
    });
  };

  const handleAddStaff = () => {
    const newSalary: Salary = {
      name: "",
      role: "",
      amount: 0,
      month: "",
      paid: false
    };
    onUpdateProject({
      ...p,
      salary: [...p.salary, newSalary]
    });
  };

  const handleUpdatePetty = (index: number, key: keyof Petty, value: any) => {
    const updatedPetty = [...p.pettyCash];
    updatedPetty[index] = {
      ...updatedPetty[index],
      [key]: value
    };
    onUpdateProject({
      ...p,
      pettyCash: updatedPetty
    });
  };

  const getAutoFlag = (amount: number): "ok" | "warn" | "risk" => {
    if (amount < 1000) return "ok";
    if (amount <= 5000) return "warn";
    return "risk";
  };

  const handleUpdatePettyAmount = (index: number, newAmount: number) => {
    const updatedPetty = [...p.pettyCash];
    updatedPetty[index] = {
      ...updatedPetty[index],
      amount: newAmount,
      flag: getAutoFlag(newAmount)
    };
    onUpdateProject({
      ...p,
      pettyCash: updatedPetty
    });
  };

  const handleDeletePettyCash = (index: number) => {
    const updatedPetty = p.pettyCash.filter((_, idx) => idx !== index);
    onUpdateProject({
      ...p,
      pettyCash: updatedPetty
    });
  };

  const handleAddPettyCashEntry = () => {
    const newPetty: Petty = {
      date: "",
      desc: "",
      amount: 0,
      flag: "ok"
    };
    onUpdateProject({
      ...p,
      pettyCash: [...p.pettyCash, newPetty]
    });
  };

  const getEffectiveVendorStatus = (v: Vendor): "paid" | "due" | "overdue" => {
    if (v.status === "due") {
      try {
        const due = parseProjectDate(v.due, true);
        if (new Date() > due) {
          return "overdue";
        }
      } catch (e) {}
    }
    return v.status;
  };

  return (
    <div className="screen active">
      <button className="back-btn" onClick={back}>← Back to Command Centre</button>

      <div className="proj-selector">
        {projectList.map((pp) => (
          <button key={pp.id} className={`proj-tab ${pp.id === id ? "active" : ""}`} onClick={() => setId(pp.id)}>{pp.name}</button>
        ))}
        <button className="proj-new-btn" onClick={() => {
          const newProj = cloneProjectAsTemplate(p);
          onCreateProject(newProj);
        }}>
          <span style={{ color: "var(--green-2)", fontWeight: "bold" }}>+</span> New Project
        </button>
      </div>

      <div className="detail-header fade-up">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              <InlineEdit
                value={p.name}
                onSave={(val) => onUpdateProject({ ...p, name: val })}
              />
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--text-3)", marginTop: 4, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <InlineEdit
                value={p.client}
                onSave={(val) => onUpdateProject({ ...p, client: val })}
                placeholder="Company name"
              />
              <span>·</span>
              <InlineEdit
                value={p.location}
                onSave={(val) => onUpdateProject({ ...p, location: val })}
                placeholder="Location"
              />
            </div>
            <div style={{ display: "flex", gap: ".4rem", marginTop: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
              <InlineEdit
                value={p.status}
                type="select"
                options={statusOptions}
                formatValue={(val) => {
                  const found = statusOptions.find(o => o.value === val);
                  return found ? found.label : val;
                }}
                onSave={handleStatusChange}
                className={`status-pill ${sp}`}
                inputClassName="status-pill-select"
              />
              <InlineEdit
                value={p.stage}
                formatValue={(val) => `Stage: ${val}`}
                onSave={(val) => onUpdateProject({ ...p, stage: val })}
                className="status-pill sp-neutral"
                inputClassName="inline-pill-input"
              />
              <InlineEdit
                value={p.completion}
                type="number"
                isNumeric
                formatValue={(val) => `Completion: ${val}%`}
                onSave={(val) => onUpdateProject({ ...p, completion: Number(val) })}
                className="status-pill sp-neutral"
                inputClassName="inline-pill-input"
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ textAlign: "right" }}>
              <div className="stat-lbl text-xs text-gray-400 uppercase tracking-wider">PO DOCUMENT</div>
              <div>
                {poFile ? (
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 inline-flex items-center">
                    <span className="cursor-pointer inline-flex items-center" onClick={handleOpenPO}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="inline-block mr-1 flex-shrink-0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/><line x1="9" y1="9" x2="11" y2="9"/></svg>
                      {poFile.name}
                    </span>
                    <span className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer text-xs" onClick={handleRemovePO}>✕</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => poInputRef.current?.click()}
                    className="text-xs text-gray-400 border border-dashed border-gray-300 rounded px-2 py-1 hover:border-green-400 hover:text-green-500 cursor-pointer transition-colors inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="inline-block mr-1 flex-shrink-0"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                    Attach PO PDF
                  </button>
                )}
                <input
                  type="file"
                  ref={poInputRef}
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={handleAttachPO}
                />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-lbl">Start Date</div>
              <InlineEdit
                value={p.startDate}
                type="date"
                formatValue={formatProjectDate}
                onSave={(val) => onUpdateProject({ ...p, startDate: val })}
                className="mono"
                style={{ fontSize: ".82rem", fontWeight: 500 }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-lbl">End Date</div>
              <InlineEdit
                value={p.endDate}
                type="date"
                formatValue={formatProjectDate}
                onSave={(val) => onUpdateProject({ ...p, endDate: val })}
                className="mono"
                style={{ fontSize: ".82rem", fontWeight: 500 }}
              />
            </div>
          </div>
        </div>
        <div className="mini-prog" style={{ marginTop: "1.1rem" }}>
          <div className="mini-prog-meta">
            <span>Overall Completion</span>
            <InlineEdit
              value={p.completion}
              type="number"
              isNumeric
              formatValue={(val) => `${val}%`}
              onSave={(val) => onUpdateProject({ ...p, completion: Number(val) })}
              className="mono"
              style={{ fontSize: ".76rem", fontWeight: 600 }}
            />
          </div>
          <div className="prog-track" style={{ height: 8 }}>
            <div className={`prog-fill ${pf}`} style={{ width: `${p.completion}%` }}></div>
          </div>
        </div>
      </div>

      {/* A · Money Summary */}
      <div className={`sh mb ${highlightedSection === "section-a" ? "highlight-flash" : ""}`} id="section-a">
        <span className="sh-label">A · Money Summary</span>
        <div className="sh-line"></div>
      </div>
      <div className="g4 mb fade-up delay-1">
        <div className="card">
          <div className="stat-lbl">Contract Value</div>
          <InlineEdit
            value={p.contractValue}
            type="number"
            isNumeric
            formatValue={fmtFull}
            onSave={(val) => onUpdateProject({ ...p, contractValue: Number(val) })}
            className="stat-val"
            style={{ display: "block" }}
          />
          <div className="stat-hint">Signed PO from client</div>
        </div>
        <div className="card">
          <div className="stat-lbl">Received from Client</div>
          <div className="stat-val c-green" style={{ display: "block" }}>
            {fmtFull(received)}
          </div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of contract</span><span>{p.contractValue > 0 ? pct(received, p.contractValue) : 0}%</span></div>
            <div className="prog-track"><div className="prog-fill pf-green" style={{ width: `${p.contractValue > 0 ? pct(received, p.contractValue) : 0}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Total Spent</div>
          <div className="stat-val" style={{ display: "block" }}>
            {fmtFull(spent)}
          </div>
          <div className="mini-prog">
            <div className="mini-prog-meta"><span>Of received</span><span>{received > 0 ? pct(spent, received) : 0}%</span></div>
            <div className="prog-track"><div className={`prog-fill ${received > 0 && pct(spent, received) > 90 ? "pf-red" : "pf-amber"}`} style={{ width: `${received > 0 ? pct(spent, received) : 0}%` }}></div></div>
          </div>
        </div>
        <div className="card">
          <div className="stat-lbl">Net Cash Position</div>
          <div className={`stat-val ${net >= 0 ? "c-green" : "c-red"}`}>{netStr}</div>
          <div className="stat-hint">{net >= 0 ? "You are cash positive" : "Spent more than received"}</div>
        </div>
      </div>

      {/* B · Milestone */}
      <div className={`sh mb ${highlightedSection === "section-b" ? "highlight-flash" : ""}`} id="section-b">
        <span className="sh-label">B · Milestone & Payment Tracker</span>
        <div className="sh-line"></div>
      </div>
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
                <div className="ms-item row-delete-container" key={i}>
                  <div className={`ms-dot ${m.status}`}></div>
                  <div className="ms-body">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <InlineEdit
                        value={m.name}
                        onSave={(val) => updateMilestone(i, "name", val)}
                        className="ms-name"
                        style={{ display: "inline-block" }}
                        placeholder="New Milestone"
                      />
                      <InlineEdit
                        value={m.date}
                        onSave={(val) => updateMilestone(i, "date", val)}
                        className="ms-date"
                        style={{ display: "inline-block" }}
                        placeholder="Add date"
                      />
                    </div>
                  </div>
                  <div className="ms-right">
                    <InlineEdit
                      value={m.amount}
                      type="number"
                      isNumeric
                      emptyOnZero
                      placeholder="0"
                      formatValue={fmtFull}
                      onSave={(val) => updateMilestone(i, "amount", val)}
                      className={`ms-amount ${amtColor}`}
                      style={{ display: "inline-block" }}
                    />
                    <div style={{ marginTop: 2 }}>
                      <InlineEdit
                        value={m.status}
                        type="select"
                        options={milestoneStatusOptions}
                        formatValue={(val) => {
                          const found = milestoneStatusOptions.find(o => o.value === val);
                          return found ? found.label : val;
                        }}
                        onSave={(val) => updateMilestone(i, "status", val)}
                        className={`ms-status ${statusColor}`}
                        style={{
                          display: "inline-block",
                          color: m.status === "upcoming" ? "var(--text-3)" : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", alignSelf: "stretch", paddingLeft: "4px" }}>
                    <button className="row-delete-btn" onClick={() => handleDeleteMilestone(i)}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: "0 0 0 22px" }}>
            <button className="material-add-btn" onClick={handleAddMilestone} style={{ marginTop: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>+</span> Add Milestone
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Payment Health</div>
          <div className="card-sub">Outstanding vs collected</div>
          <div style={{ marginTop: ".5rem" }}>
            {(["done", "overdue", "upcoming"] as const).map((s) => {
              const items = p.milestones.filter((m) => m.status === s);
              const total = items.reduce((a, m) => a + (m.amount === "" ? 0 : Number(m.amount)), 0);
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
      <div className={`sh mb ${highlightedSection === "section-c" ? "highlight-flash" : ""}`} id="section-c">
        <span className="sh-label">C · Procurement & Material Control</span>
        <div className="sh-line"></div>
      </div>
      <div className="card mb fade-up delay-3" style={{ padding: 0 }}>
        <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
          <div className="card-title">Material Dispatch vs Site Accountability</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>Gap between dispatched and accounted = theft/loss risk indicator</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Material</th>
                <th>Dispatched</th>
                <th>Accounted</th>
                <th>Gap</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {p.materials.map((m, i) => {
                const gap = typeof m.gap === "number" ? m.gap : (m.dispatched - m.accounted);
                const totalCost = typeof m.totalCost === "number" ? m.totalCost : (m.dispatched * (m.unitPrice ?? 0));
                let flagClass = "flag-ok", flagLabel = "OK";
                if (gap > 0 && gap <= 10) {
                  flagClass = "flag-warn";
                  flagLabel = `Gap: ${gap}`;
                } else if (gap > 10) {
                  flagClass = "flag-risk";
                  flagLabel = `Risk: ${gap} missing`;
                }

                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td className="mono">
                      <div className="dispatched-cell">
                        <span>{m.dispatched} {m.unit}</span>
                        <div className="qty-controls">
                          <button className="qty-btn" onClick={() => handleAdjustQty(i, -1)}>−</button>
                          <button className="qty-btn" onClick={() => handleAdjustQty(i, 1)}>+</button>
                        </div>
                      </div>
                    </td>
                    <td className="mono">
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          className="inline-edit-input"
                          style={{ width: "80px", textAlign: "right" }}
                          value={m.accounted === "" || m.accounted === 0 ? "" : m.accounted}
                          placeholder="0"
                          min="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            let cleanedVal = val.replace(/^0+(?=\d)/, '');
                            if (cleanedVal !== "") {
                              const num = Number(cleanedVal);
                              if (isNaN(num)) cleanedVal = "";
                            }
                            const updatedMaterials = [...p.materials];
                            updatedMaterials[i] = updateMaterial({
                              ...updatedMaterials[i],
                              accounted: cleanedVal
                            });
                            onUpdateProject({
                              ...p,
                              materials: updatedMaterials
                            });
                          }}
                          onBlur={(e) => {
                            const val = e.target.value;
                            let cleanedVal = val.replace(/^0+(?=\d)/, '');
                            if (cleanedVal === "0" || cleanedVal === "") {
                              cleanedVal = "";
                            }
                            const updatedMaterials = [...p.materials];
                            updatedMaterials[i] = updateMaterial({
                              ...updatedMaterials[i],
                              accounted: cleanedVal
                            });
                            onUpdateProject({
                              ...p,
                              materials: updatedMaterials
                            });
                          }}
                        />
                        <span style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>{m.unit}</span>
                      </div>
                    </td>
                    <td className={`mono ${gap > 0 ? (gap > 10 ? "c-red" : "c-amber") : "c-green"}`}>
                      {gap} {m.unit}
                    </td>
                    <td className="mono">
                      <div className="total-cost-cell" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Rate:</span>
                          <InlineEdit
                            value={m.unitPrice ?? 0}
                            type="number"
                            isNumeric
                            formatValue={(val) => `₹${Number(val).toLocaleString("en-IN")}/unit`}
                            onSave={(val) => {
                              const updatedMaterials = [...p.materials];
                              updatedMaterials[i] = updateMaterial({
                                ...updatedMaterials[i],
                                unitPrice: Math.max(0, Number(val))
                              });
                              onUpdateProject({
                                ...p,
                                materials: updatedMaterials
                              });
                            }}
                            inputClassName="inline-edit-input"
                          />
                        </div>
                        <div style={{ fontWeight: 600, color: "var(--text-1)" }}>
                          Total: {fmtFull(totalCost)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`flag ${flagClass}`}>{flagLabel}</span>
                    </td>
                    <td style={{ width: "40px", textAlign: "center" }}>
                      <button className="row-delete-btn" onClick={() => handleDeleteMaterial(i)}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0 1.3rem 1.15rem" }}>
          <button className="material-add-btn" onClick={openAddMaterialModal}>
            <span style={{ fontWeight: "bold" }}>+</span> Add Material
          </button>
        </div>
      </div>

      {/* D · Budget */}
      <div className={`sh mb ${highlightedSection === "section-d" ? "highlight-flash" : ""}`} id="section-d">
        <span className="sh-label">D · Expense vs Budget</span>
        <div className="sh-line"></div>
      </div>
      <div className="g2 mb fade-up delay-4">
        <div className="card">
          <div className="card-title">Category-wise Breakdown</div>
          <div className="card-sub">Budget vs actual spend per work category</div>
          {derivedCategories.map((c, i) => {
            const budgetVal = c.budget === "" || c.budget === undefined ? 0 : Number(c.budget);
            const perc = budgetVal > 0 ? pct(c.spent, budgetVal) : 0;
            const over = budgetVal > 0 && c.spent > budgetVal;
            const fillClass = over ? "pf-red" : perc > 80 ? "pf-amber" : "pf-green";

            return (
              <div className="cat-row" key={i}>
                <div className="cat-meta" style={{ display: "grid", gridTemplateColumns: "1fr 100px 15px 100px 140px", alignItems: "center", gap: "8px" }}>
                  <span
                    className="cat-name"
                    onContextMenu={(e) => {
                      const isDefault = DEFAULT_CATEGORIES.some(dc => dc.trim().toLowerCase() === c.name.trim().toLowerCase()) || c.name === "Petty Cash";
                      if (!isDefault) {
                        e.preventDefault();
                        setContextMenu({
                          x: e.clientX,
                          y: e.clientY,
                          categoryName: c.name
                        });
                      }
                    }}
                    style={{
                      cursor: !DEFAULT_CATEGORIES.some(dc => dc.trim().toLowerCase() === c.name.trim().toLowerCase()) && c.name !== "Petty Cash" ? "context-menu" : "default"
                    }}
                    title={!DEFAULT_CATEGORIES.some(dc => dc.trim().toLowerCase() === c.name.trim().toLowerCase()) && c.name !== "Petty Cash" ? "Right-click to delete category" : undefined}
                  >
                    {c.name}
                  </span>
                  
                  <span style={{ textAlign: "right", fontFamily: "'JetBrains Mono', monospace", fontSize: ".68rem", color: "var(--text-3)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtFull(c.spent)}
                  </span>
                  
                  <span style={{ textAlign: "center", color: "var(--text-4)" }}>/</span>
                  
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <input
                      type="number"
                      className="inline-edit-input"
                      style={{ width: "90px", textAlign: "right" }}
                      value={c.budget === "" || c.budget === 0 ? "" : c.budget}
                      placeholder="0"
                      min="0"
                      onChange={(e) => {
                        const val = e.target.value;
                        let cleanedVal: string | number = val.replace(/^0+(?=\d)/, '');
                        if (cleanedVal !== "") {
                          const num = Number(cleanedVal);
                          if (isNaN(num)) cleanedVal = "";
                        }
                        const updatedBudgets = {
                          ...(p.categoryBudgets || {}),
                          [c.name]: cleanedVal
                        };
                        onUpdateProject({
                          ...p,
                          categoryBudgets: updatedBudgets
                        });
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        let cleanedVal = val.replace(/^0+(?=\d)/, '');
                        if (cleanedVal === "0" || cleanedVal === "") {
                          cleanedVal = "";
                        }
                        const updatedBudgets = {
                          ...(p.categoryBudgets || {}),
                          [c.name]: cleanedVal
                        };
                        onUpdateProject({
                          ...p,
                          categoryBudgets: updatedBudgets
                        });
                      }}
                    />
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {over ? <span className="over-tag">OVER ▲{fmtFull(c.spent - budgetVal)}</span> : <span className="ok-tag">OK</span>}
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
            <div className="summary-row">
              <span>Total Budget (all categories)</span>
              <InlineEdit
                value={totalBudget}
                type="number"
                isNumeric
                emptyOnZero
                formatValue={fmtFull}
                onSave={(val) => {
                  onUpdateProject({
                    ...p,
                    totalBudget: Math.max(0, Number(val))
                  });
                }}
                className="mono"
                style={{ fontWeight: 600 }}
              />
            </div>
            <div className="summary-row"><span>Total Spent</span><span className={`mono ${totalBudget > 0 && totalSpent > totalBudget ? "c-red" : "c-green"}`} style={{ fontWeight: 600 }}>{fmtFull(totalSpent)}</span></div>
            <div className="summary-row"><span>Remaining Budget</span><span className="mono" style={{ fontWeight: 600 }}>{fmtFull(totalBudget - totalSpent)}</span></div>
            <div className="summary-row" style={{ borderBottom: "none", paddingTop: ".9rem" }}>
              <span style={{ fontWeight: 600 }}>Budget Used</span>
              <span className={`mono ${totalBudget > 0 && totalSpent > totalBudget ? "c-red" : totalBudget > 0 && totalSpent / totalBudget > 0.85 ? "c-amber" : "c-green"}`} style={{ fontSize: ".9rem", fontWeight: 700 }}>
                {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="mini-prog" style={{ marginTop: ".9rem" }}>
            <div className="prog-track" style={{ height: 8 }}>
              <div className={`prog-fill ${totalBudget > 0 && totalSpent > totalBudget ? "pf-red" : totalBudget > 0 && totalSpent / totalBudget > 0.85 ? "pf-amber" : "pf-green"}`} style={{ width: `${totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* E · Vendors */}
      <div className={`sh mb ${highlightedSection === "section-e" ? "highlight-flash" : ""}`} id="section-e">
        <span className="sh-label">E · Vendor Payments</span>
        <div className="sh-line"></div>
      </div>
      <div className="card mb fade-up" style={{ padding: 0 }}>
        <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
          <div className="card-title">Invoice Tracker — 30-Day Payment Window</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>Overdue = vendor relationship at risk</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Invoice No.</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ width: "40px" }}></th>
              </tr>
            </thead>
            <tbody>
              {p.vendors.map((v, i) => {
                const effStatus = getEffectiveVendorStatus(v);
                const sc = effStatus === "paid" ? "flag-paid" : effStatus === "overdue" ? "flag-overdue" : "flag-due";
                const vendorStatusOptions = [
                  { value: "paid", label: "Paid" },
                  { value: "due", label: "Due" },
                  { value: "overdue", label: "Overdue" }
                ];
                return (
                  <tr key={i} className="row-delete-container">
                    <td style={{ fontWeight: 500 }}>
                      <InlineEdit
                        value={v.name}
                        onSave={(val) => handleUpdateVendor(i, "name", val)}
                        placeholder="New Vendor"
                      />
                    </td>
                    <td className="mono" style={{ color: "var(--text-3)" }}>
                      <InlineEdit
                        value={v.invoice}
                        onSave={(val) => handleUpdateVendor(i, "invoice", val)}
                        placeholder="INV-0000"
                      />
                    </td>
                    <td className="mono" style={{ color: "var(--text-2)" }}>
                      <InlineEdit
                        value={v.date}
                        onSave={(val) => handleUpdateVendor(i, "date", val)}
                        placeholder="DD Mon YYYY"
                      />
                    </td>
                    <td className="mono" style={{ color: "var(--text-2)" }}>
                      <InlineEdit
                        value={v.due}
                        onSave={(val) => handleUpdateVendor(i, "due", val)}
                        placeholder="DD Mon YYYY"
                      />
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      <input
                        type="number"
                        className="inline-edit-input"
                        style={{ width: "110px", textAlign: "right" }}
                        value={v.amount === "" || v.amount === 0 ? "" : v.amount}
                        placeholder="0"
                        min="0"
                        onChange={(e) => {
                          const val = e.target.value;
                          let cleanedVal: string | number = val.replace(/^0+(?=\d)/, '');
                          if (cleanedVal !== "") {
                            const num = Number(cleanedVal);
                            if (isNaN(num)) cleanedVal = "";
                          }
                          handleUpdateVendor(i, "amount", cleanedVal);
                        }}
                        onBlur={(e) => {
                          const val = e.target.value;
                          let cleanedVal = val.replace(/^0+(?=\d)/, '');
                          if (cleanedVal === "0" || cleanedVal === "") {
                            cleanedVal = "";
                          }
                          handleUpdateVendor(i, "amount", cleanedVal);
                        }}
                      />
                    </td>
                    <td>
                      <InlineEdit
                        value={v.status}
                        type="select"
                        options={vendorStatusOptions}
                        formatValue={(val) => {
                          const effVal = v.status === "due" && getEffectiveVendorStatus(v) === "overdue" ? "overdue" : val;
                          const found = vendorStatusOptions.find(o => o.value === effVal);
                          return found ? found.label : val;
                        }}
                        onSave={(val) => handleUpdateVendor(i, "status", val)}
                        className={`flag ${sc}`}
                        inputClassName="status-pill-select"
                      />
                    </td>
                    <td style={{ width: "40px", textAlign: "center" }}>
                      <button className="row-delete-btn" onClick={() => handleDeleteVendor(i)}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0 1.3rem 1.15rem" }}>
          <button className="material-add-btn" onClick={handleAddInvoice}>
            <span style={{ fontWeight: "bold" }}>+</span> Add Invoice
          </button>
        </div>
      </div>

      {/* F · Salary + Petty */}
      <div className={`sh mb ${highlightedSection === "section-f" ? "highlight-flash" : ""}`} id="section-f">
        <span className="sh-label">F · Salary Register & Petty Cash</span>
        <div className="sh-line"></div>
      </div>
      <div className="g2 mb fade-up">
        <div className="card">
          <div className="card-title">Monthly Salary Register</div>
          <div className="card-sub">Staff assigned to this project · {fmtFull(totalSalary)}/month total</div>
          {p.salary.map((s, i) => (
            <div className="sal-row row-delete-container" key={i}>
              <div>
                <div style={{ display: "block" }}>
                  <InlineEdit
                    value={s.name}
                    onSave={(val) => handleUpdateSalary(i, "name", val)}
                    className="sal-name"
                    style={{ display: "inline-block" }}
                    placeholder="Staff name"
                  />
                </div>
                <div style={{ display: "block" }}>
                  <InlineEdit
                    value={s.role}
                    onSave={(val) => handleUpdateSalary(i, "role", val)}
                    className="sal-role"
                    style={{ display: "inline-block" }}
                    placeholder="Role"
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="sal-right">
                  <div style={{ display: "block" }}>
                    <input
                      type="number"
                      className="inline-edit-input sal-amount"
                      style={{ 
                        width: "110px", 
                        textAlign: "right",
                        fontFamily: "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
                        fontSize: ".78rem",
                        fontWeight: 600,
                        display: "inline-block"
                      }}
                      value={s.amount === "" || s.amount === 0 ? "" : s.amount}
                      placeholder="0"
                      min="0"
                      onChange={(e) => {
                        const val = e.target.value;
                        let cleanedVal: string | number = val.replace(/^0+(?=\d)/, '');
                        if (cleanedVal !== "") {
                          const num = Number(cleanedVal);
                          if (isNaN(num)) cleanedVal = "";
                        }
                        handleUpdateSalary(i, "amount", cleanedVal);
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        let cleanedVal = val.replace(/^0+(?=\d)/, '');
                        if (cleanedVal === "0" || cleanedVal === "") {
                          cleanedVal = "";
                        }
                        handleUpdateSalary(i, "amount", cleanedVal);
                      }}
                    />
                  </div>
                  <div className="sal-date">
                    <InlineEdit
                      value={s.month}
                      onSave={(val) => handleUpdateSalary(i, "month", val)}
                      style={{ display: "inline-block" }}
                      placeholder="Date"
                    />
                    {" · "}
                    <InlineEdit
                      value={s.paid ? "true" : "false"}
                      type="select"
                      options={[
                        { value: "true", label: "Paid" },
                        { value: "false", label: "Pending" }
                      ]}
                      formatValue={(val) => val === "true" ? "Paid" : "Pending"}
                      onSave={(val) => handleUpdateSalary(i, "paid", val === "true")}
                      className={s.paid ? "c-green" : "c-red"}
                      style={{ display: "inline-block", fontWeight: 600 }}
                      inputClassName="status-pill-select"
                    />
                  </div>
                </div>
                <button className="row-delete-btn" onClick={() => handleDeleteSalary(i)} style={{ fontSize: "1.1rem" }}>×</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <button className="material-add-btn" onClick={handleAddStaff} style={{ marginTop: 0 }}>
              <span style={{ fontWeight: "bold" }}>+</span> Add Staff
            </button>
          </div>
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "1.15rem 1.3rem .9rem" }}>
            <div className="card-title">Petty Cash Log</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>Daily site expenses — flag if unusual</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Flag</th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {p.pettyCash.map((pc, i) => {
                  const pettyFlagOptions = [
                    { value: "ok", label: "Normal" },
                    { value: "warn", label: "Watch" },
                    { value: "risk", label: "Risk" }
                  ];
                  return (
                    <tr key={i} className="row-delete-container">
                      <td className="mono" style={{ color: "var(--text-3)" }}>
                        <input
                          type="text"
                          className="inline-num-input"
                          style={{ width: "80px", textAlign: "left", fontWeight: 400 }}
                          value={pc.date}
                          placeholder="Date"
                          onChange={(e) => handleUpdatePetty(i, "date", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="inline-num-input"
                          style={{ width: "100%", textAlign: "left", fontWeight: 400 }}
                          value={pc.desc}
                          placeholder="Description"
                          onChange={(e) => handleUpdatePetty(i, "desc", e.target.value)}
                        />
                      </td>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        <input
                          type="number"
                          className="inline-edit-input"
                          style={{ width: "100px", textAlign: "right" }}
                          value={pc.amount === "" || pc.amount === 0 ? "" : pc.amount}
                          placeholder="0"
                          min="0"
                          onChange={(e) => {
                            const val = e.target.value;
                            let cleanedVal: string | number = val.replace(/^0+(?=\d)/, '');
                            if (cleanedVal !== "") {
                              const num = Number(cleanedVal);
                              if (isNaN(num)) cleanedVal = "";
                            }
                            handleUpdatePettyAmount(i, cleanedVal as any);
                          }}
                          onBlur={(e) => {
                            const val = e.target.value;
                            let cleanedVal = val.replace(/^0+(?=\d)/, '');
                            if (cleanedVal === "0" || cleanedVal === "") {
                              cleanedVal = "";
                            }
                            handleUpdatePettyAmount(i, cleanedVal as any);
                          }}
                        />
                      </td>
                      <td>
                        <InlineEdit
                          value={pc.flag}
                          type="select"
                          options={pettyFlagOptions}
                          formatValue={(val) => {
                            const found = pettyFlagOptions.find(o => o.value === val);
                            return found ? found.label : val;
                          }}
                          onSave={(val) => handleUpdatePetty(i, "flag", val)}
                          className={`flag ${pc.flag === "ok" ? "flag-ok" : pc.flag === "warn" ? "flag-due" : "flag-overdue"}`}
                          inputClassName="status-pill-select"
                        />
                      </td>
                      <td style={{ width: "40px", textAlign: "center" }}>
                        <button className="row-delete-btn" onClick={() => handleDeletePettyCash(i)}>×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "0 1.3rem 1.15rem" }}>
            <button className="material-add-btn" onClick={handleAddPettyCashEntry}>
              <span style={{ fontWeight: "bold" }}>+</span> Add Entry
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-t-[3px] border-t-red-600 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 min-w-[36px] rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-lg">⚠</span>
            </div>
            <div style={{ textAlign: "left" }}>
              <p className="text-sm font-medium text-red-800" style={{ margin: 0 }}>Danger zone</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed" style={{ margin: 0 }}>This action is permanent. All project data, milestones, and payments will be deleted and cannot be recovered.</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (projectList.length <= 1) {
                setConfirmModal({
                  open: true,
                  title: "Delete Project",
                  message: "You must have at least one project.",
                  isAlert: true,
                  onConfirm: () => {
                    setConfirmModal((prev) => ({ ...prev, open: false }));
                  },
                  onCancel: () => {
                    setConfirmModal((prev) => ({ ...prev, open: false }));
                  }
                });
                return;
              }
              setConfirmModal({
                open: true,
                title: "Delete Project",
                message: `Are you sure you want to delete '${p.name}'? This cannot be undone.`,
                isAlert: false,
                onConfirm: () => {
                  onDeleteProject(p.id);
                  setConfirmModal((prev) => ({ ...prev, open: false }));
                },
                onCancel: () => {
                  setConfirmModal((prev) => ({ ...prev, open: false }));
                }
              });
            }}
            className="ml-6 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-red-600 border border-red-500 rounded-lg bg-transparent hover:bg-red-50 transition-colors"
          >
            Delete project
          </button>
        </div>
      </div>

      {isAddMaterialModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMaterialModalOpen(false)}>
          <div className="modal-content fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Material to Project</h3>
              <button className="modal-close-btn" onClick={() => setIsAddMaterialModalOpen(false)}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: "1.5rem" }}>
              <div className="modal-form-group" style={{ position: "relative" }}>
                <label className="modal-form-label">Search Material Item</label>
                <input
                  type="text"
                  placeholder="Type to search items..."
                  className="modal-form-input"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setShowSuggestions(true);
                    setSelectedItem(null);
                    setIsCustomItem(false);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                
                {showSuggestions && categoryFilter !== "Custom" && (searchQuery.trim().length > 0 || categoryFilter !== "All") && (
                  <div className="autocomplete-suggestions">
                    {filteredItems.map((item) => (
                      <div
                        key={`${item.category}-${item.name}`}
                        className="autocomplete-suggestion-item"
                        onMouseDown={() => handleSelectSuggestion(item)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="autocomplete-suggestion-name">{item.name}</span>
                          {item.alreadyInProject && (
                            <span
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 600,
                                background: "var(--amber-soft)",
                                color: "var(--amber)",
                                border: "1px solid var(--amber-line)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                display: "inline-block",
                              }}
                            >
                              Already in project
                            </span>
                          )}
                        </div>
                        <span className="autocomplete-suggestion-category">{item.category}</span>
                      </div>
                    ))}
                    
                    {searchQuery.trim().length > 0 && (
                      <div
                        className="autocomplete-custom-option"
                        onMouseDown={handleSelectCustomItem}
                      >
                        <span>+ Add "{searchQuery}" as custom item...</span>
                      </div>
                    )}
                    
                    {filteredItems.length === 0 && searchQuery.trim().length === 0 && (
                      <div className="autocomplete-no-results">
                        No standard items found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Category Filter / Browse</label>
                <select
                  className="modal-form-select"
                  value={categoryFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryFilter(val);
                    setSelectedItem(null);
                    if (val === "Custom") {
                      setIsCustomItem(true);
                      setCustomItemName(searchQuery);
                      setCustomUnit("");
                      setCustomUnitCost(0);
                    } else {
                      setIsCustomItem(false);
                    }
                  }}
                >
                  <option value="All">-- Select Category (Required) --</option>
                  {MASTER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">Custom (New Category)</option>
                </select>
              </div>

              {categoryFilter === "Custom" && (
                <div className="modal-form-group">
                  <label className="modal-form-label">Custom Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Painting, Fire Fighting"
                    className="modal-form-input"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                  />
                </div>
              )}

              {(selectedItem || isCustomItem) && (
                <div style={{ marginTop: "1.5rem", borderTop: "1px dashed var(--border)", paddingTop: "1.5rem" }}>
                  <div style={{ marginBottom: "1rem", fontSize: "0.8rem", color: "var(--green-2)", fontWeight: 600 }}>
                    {isCustomItem ? "CUSTOM ITEM DETAILS" : "SELECTED ITEM DETAILS"}
                  </div>

                  {isCustomItem ? (
                    <>
                      <div className="modal-form-group">
                        <label className="modal-form-label">Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Emulsion Paint"
                          className="modal-form-input"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                        />
                      </div>
                      
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
                        <div style={{ flex: 1 }}>
                          <label className="modal-form-label">Unit of Measure</label>
                          <input
                            type="text"
                            placeholder="e.g. ltrs, kg, bags"
                            className="modal-form-input"
                            value={customUnit}
                            onChange={(e) => setCustomUnit(e.target.value)}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <label className="modal-form-label">Unit Cost (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="modal-form-input"
                            value={customUnitCost || ""}
                            onChange={(e) => setCustomUnitCost(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    selectedItem && (
                      <div style={{ background: "var(--surface-2)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 500, textTransform: "uppercase" }}>Item Name</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 500, textTransform: "uppercase" }}>Category</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{selectedItem.name}</span>
                          <span className="autocomplete-suggestion-category" style={{ fontSize: "0.7rem", margin: 0 }}>{selectedItem.category}</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <div style={{ flex: 1 }}>
                            <label className="modal-form-label">Unit</label>
                            <div className="modal-form-input" style={{ background: "var(--surface-3)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                              {selectedItem.unit}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="modal-form-label">Unit Cost (₹)</label>
                            <input
                              type="number"
                              min="0"
                              className="modal-form-input"
                              value={customUnitCost}
                              onChange={(e) => setCustomUnitCost(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  <div className="modal-form-group">
                    <label className="modal-form-label">Initial Dispatched Quantity</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="modal-form-input"
                      value={initialDispatched}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInitialDispatched("");
                        } else {
                          setInitialDispatched(Math.max(0, Number(val)));
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setIsAddMaterialModalOpen(false)}>Cancel</button>
              <button
                className="modal-btn-primary"
                disabled={
                  categoryFilter === "All" ||
                  (!selectedItem && !isCustomItem) ||
                  (isCustomItem && (!customItemName.trim() || !customUnit.trim() || Number(initialDispatched) < 0)) ||
                  (categoryFilter === "Custom" && !customCategory.trim())
                }
                onClick={handleAddMaterial}
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}
      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            padding: "4px 0",
            zIndex: 9999,
            minWidth: "140px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const materialCount = (p.materials || []).filter(
                (m) =>
                  (m.category || "").trim().toLowerCase() ===
                  contextMenu.categoryName.trim().toLowerCase()
              ).length;
              setConfirmModal({
                open: true,
                title: "Delete Category",
                message: `Deleting this category will also remove ${materialCount} material item(s) under it in Section C. This cannot be undone. Confirm?`,
                isAlert: false,
                onConfirm: () => {
                  deleteCategory(contextMenu.categoryName);
                  setConfirmModal((prev) => ({ ...prev, open: false }));
                },
                onCancel: () => {
                  setConfirmModal((prev) => ({ ...prev, open: false }));
                },
              });
              setContextMenu(null);
            }}
            className="context-menu-item"
          >
            🗑 Delete category
          </button>
        </div>
      )}
    </div>
  );
}

function AlertsScreen({
  alertsList,
  projectList,
  onNavigateToProject
}: {
  alertsList: Alert[];
  projectList: Project[];
  onNavigateToProject: (projectId: number, sectionId: string | null) => void;
}) {
  const groups = useMemo(() => ({
    danger: alertsList.filter((a) => a.type === "danger"),
    warning: alertsList.filter((a) => a.type === "warning"),
    safe: alertsList.filter((a) => a.type === "safe"),
  }), [alertsList]);

  const overdueRetentions = useMemo(() => {
    const list: Array<{
      projectId: number;
      projectName: string;
      milestone: Milestone;
      formattedDate: string;
      daysOverdue: number;
    }> = [];

    const parseMilestoneDate = (dateStr: string): Date | null => {
      if (!dateStr || dateStr.trim() === "") return null;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
      return parseAnyDateForDisplay(dateStr);
    };

    projectList.forEach((p) => {
      (p.milestones || []).forEach((m) => {
        const nameMatches = m.name.toLowerCase().includes("retention");
        const statusMatches = m.status !== "Paid" && m.status !== "Released" && m.status !== "done";
        if (nameMatches && statusMatches && m.date) {
          const mDate = parseMilestoneDate(m.date);
          if (mDate) {
            const today = new Date();
            if (today.getTime() > mDate.getTime()) {
              const daysOverdue = Math.floor((Date.now() - mDate.getTime()) / (1000 * 60 * 60 * 24));
              list.push({
                projectId: p.id,
                projectName: p.name,
                milestone: m,
                formattedDate: formatProjectDate(m.date),
                daysOverdue
              });
            }
          }
        }
      });
    });

    return list;
  }, [projectList]);
  const renderGroup = (items: Alert[]) => items.map((a, i) => {
    const matchingProj = projectList.find(
      (p) => p.name.trim().toLowerCase() === a.project.trim().toLowerCase()
    );
    const sectionId = getSectionForAlert(a);

    return (
      <div key={i} className={`alert-item ai-${a.type}`}>
        <div className="ai-icon">{a.type === "danger" ? "!" : a.type === "warning" ? "!" : "✓"}</div>
        <div style={{ flex: 1 }}>
          <div className="ai-title">{a.title}</div>
          <div className="ai-desc">{a.desc}</div>
          <div className="ai-project">{a.project}</div>
          {matchingProj && (
            <button
              className="view-project-btn"
              onClick={() => onNavigateToProject(matchingProj.id, sectionId)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1.5px solid #16a34a',
                background: 'transparent',
                color: '#16a34a',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              View Project <span className="btn-arrow">→</span>
            </button>
          )}
        </div>
      </div>
    );
  });
  return (
    <div className="screen active">
      <style>{`
        .view-project-btn {
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .view-project-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
        }
        .view-project-btn:active {
          transform: scale(0.97);
        }
        .view-project-btn:hover .btn-arrow {
          transform: translateX(4px);
        }
        .btn-arrow {
          display: inline-block;
          transition: transform 0.18s ease;
        }
      `}</style>
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
        </div>
      </div>
      {overdueRetentions.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div className="sh mb">
            <span className="sh-label" style={{ color: "var(--red)" }}>Retention Overdue</span>
            <div className="sh-line"></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {overdueRetentions.map((item, idx) => {
              const amountVal = item.milestone.amount !== undefined && item.milestone.amount !== null && item.milestone.amount !== "" ? Number(item.milestone.amount) : 0;
              return (
                <div key={idx} className="alert-item ai-danger">
                  <div className="ai-icon">!</div>
                  <div style={{ flex: 1 }}>
                    <div className="ai-title">
                      Retention Overdue — {item.milestone.name}
                    </div>
                    <div className="ai-desc">
                      Due {item.formattedDate} · {item.daysOverdue} days overdue · {fmtFull(amountVal)} pending release
                    </div>
                    <div className="ai-project">
                      {item.projectName}
                    </div>
                    <button
                      className="view-project-btn"
                      onClick={() => onNavigateToProject(item.projectId, "section-b")}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #16a34a',
                        background: 'transparent',
                        color: '#16a34a',
                        fontSize: '13px',
                        fontWeight: 500,
                        marginTop: '8px',
                      }}
                    >
                      View Project <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  message,
  isAlert,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  message: string;
  isAlert?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h4 className="dialog-title">{title}</h4>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          {!isAlert && (
            <button className="dialog-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button 
            className={isAlert ? "dialog-btn-ok" : "dialog-btn-confirm"} 
            onClick={onConfirm}
          >
            {isAlert ? "OK" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [screen, setScreen] = useState<"home" | "detail" | "alerts">("home");
  const [projectId, setProjectId] = useState(0);
  const [fromDate, setFromDate] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFilter = localStorage.getItem('greenline_date_filter');
        const initialFilter = savedFilter ? JSON.parse(savedFilter) : null;
        if (initialFilter && initialFilter.from !== undefined) {
          return initialFilter.from;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "2025-05-01";
  });
  const [toDate, setToDate] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedFilter = localStorage.getItem('greenline_date_filter');
        const initialFilter = savedFilter ? JSON.parse(savedFilter) : null;
        if (initialFilter && initialFilter.to !== undefined) {
          return initialFilter.to;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return "2025-05-31";
  });
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const handleNavigateToProject = (projId: number, sectionId: string | null) => {
    setProjectId(projId);
    setScreen("detail");
    if (sectionId) {
      setHighlightedSection(sectionId);
      setTimeout(() => {
        setHighlightedSection(null);
      }, 2000);
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    isAlert?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    isAlert: false
  });

  const showAlert = (title: string, message: string) => {
    setConfirmModal({
      open: true,
      title,
      message,
      isAlert: true,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
      onCancel: () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
      }
    });
  };

  const [projectList, setProjectList] = useState<Project[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gl_projects");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((p: any) => {
            const categoryBudgets = p.categoryBudgets || migrateCategoryBudgets(p.categories || []);
            const updatedProject = {
              ...p,
              categoryBudgets,
              materials: (p.materials || []).map((m: any) => updateMaterial(m)),
            };
            updatedProject.categoryBudgets = cleanCategoryBudgets(updatedProject);
            return updatedProject;
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    return projects.map((p) => {
      const categoryBudgets = migrateCategoryBudgets(p.categories || []);
      const updatedProject = {
        ...p,
        categoryBudgets,
        materials: p.materials.map((m) => updateMaterial(m)),
      };
      updatedProject.categoryBudgets = cleanCategoryBudgets(updatedProject);
      return updatedProject;
    });
  });

  const [alertsList, setAlertsList] = useState<Alert[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gl_alerts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return allAlerts;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gl_projects", JSON.stringify(projectList));
    }
  }, [projectList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gl_alerts", JSON.stringify(alertsList));
    }
  }, [alertsList]);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const open = (id: number) => { setProjectId(id); setScreen("detail"); };

  const handleUpdateProject = (updatedProject: Project) => {
    const oldProject = projectList.find((p) => p.id === updatedProject.id);
    const oldName = oldProject ? oldProject.name : "";
    const newName = updatedProject.name;

    const cleanedProject = {
      ...updatedProject,
      categoryBudgets: cleanCategoryBudgets(updatedProject)
    };

    setProjectList((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? cleanedProject : p))
    );

    if (oldName && newName && oldName !== newName) {
      setAlertsList((prev) =>
        prev.map((a) => (a.project === oldName ? { ...a, project: newName } : a))
      );
    }
  };

  const handleCreateProject = (newProj: Project) => {
    setProjectList((prev) => [...prev, newProj]);
    setProjectId(newProj.id);
  };

  const handleDeleteProject = (deletedId: number) => {
    if (projectList.length <= 1) {
      showAlert("Delete Project", "You must have at least one project.");
      return;
    }
    const remaining = projectList.filter((p) => p.id !== deletedId);
    setProjectList(remaining);
    if (remaining.length > 0) {
      setProjectId(remaining[0].id);
    } else {
      setScreen("home");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <Header screen={screen} setScreen={setScreen} />
      <main className="gl-main">
        {screen === "home" && (
          <HomeScreen
            open={open}
            fromDate={fromDate}
            toDate={toDate}
            setFromDate={setFromDate}
            setToDate={setToDate}
            projectList={projectList}
            alertsList={alertsList}
            onNavigateToProject={handleNavigateToProject}
          />
        )}
        {screen === "detail" && (
          <DetailScreen
            id={projectId}
            setId={setProjectId}
            back={() => setScreen("home")}
            projectList={projectList}
            onUpdateProject={handleUpdateProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
            highlightedSection={highlightedSection}
          />
        )}
        {screen === "alerts" && (
          <AlertsScreen
            alertsList={alertsList}
            projectList={projectList}
            onNavigateToProject={handleNavigateToProject}
          />
        )}
      </main>
      {confirmModal.open && (
        <ConfirmModal
          open={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          isAlert={confirmModal.isAlert}
          onConfirm={confirmModal.onConfirm || (() => {})}
          onCancel={confirmModal.onCancel || (() => {})}
        />
      )}
    </>
  );
}
