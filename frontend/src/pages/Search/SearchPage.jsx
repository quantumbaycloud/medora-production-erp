import { useMemo, useState } from "react";
import { Search, Pill, Users, Receipt, Truck, UserCog, ShoppingCart } from "lucide-react";
import { currentStockItems } from "../../data/inventoryManagement/inventoryData";
import { recentOrders } from "../../data/pharmacySettings/pharmacySettingsData";
import { customerData, supplierData } from "../../data/reports/mockData";
import { staffMembers } from "../../data/staffManagement/staffData";

const categories = ["All", "Medicines", "Customers", "Suppliers", "Bills", "Purchases", "Staff"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const normalized = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalized) return { medicines: [], customers: [], suppliers: [], bills: [], purchases: [], staff: [] };
    const match = (...values) => values.some((v) => String(v ?? "").toLowerCase().includes(normalized));
    return {
      medicines: currentStockItems.filter((x) => match(x.name, x.sku, x.category)),
      customers: customerData.filter((x) => match(x.name, x.type, x.orders)),
      suppliers: supplierData.filter((x) => match(x.name, x.contact_person, x.phone, x.gstin)),
      bills: recentOrders.filter((x) => match(x.orderId, x.customer, x.amount, x.status)),
      purchases: [],
      staff: staffMembers.filter((x) => match(x.first_name, x.last_name, x.employee_code, x.contact_email, x.contact_phone)),
    };
  }, [normalized]);

  const sections = [
    ["Medicines", results.medicines, Pill, (x) => `${x.name} • ${x.sku || "No SKU"}`, (x) => `${x.category || "Uncategorized"} • Stock: ${x.quantity ?? 0}`],
    ["Customers", results.customers, Users, (x) => x.name, (x) => `${x.type || "Customer"} • Orders: ${x.orders ?? 0}`],
    ["Suppliers", results.suppliers, Truck, (x) => x.name, (x) => `${x.contact_person || "No contact"} • ${x.phone || "No phone"}`],
    ["Bills", results.bills, Receipt, (x) => x.orderId, (x) => `${x.customer || "Walk-in"} • ${x.amount || "₹0"} • ${x.status || "Unknown"}`],
    ["Purchases", results.purchases, ShoppingCart, (x) => x.invoice_number, (x) => `${x.status || "Unknown"} • ${x.total_amount || "₹0"}`],
    ["Staff", results.staff, UserCog, (x) => `${x.first_name || ""} ${x.last_name || ""}`.trim() || x.employee_code, (x) => `${x.employee_code || "No employee code"} • ${x.status || "Unknown"}`],
  ];

  const visible = category === "All" ? sections : sections.filter(([name]) => name === category);
  const count = visible.reduce((n, [, rows]) => n + rows.length, 0);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-outline" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search medicines, customers, suppliers, bills, staff…" className="min-w-0 flex-1 border-none bg-transparent px-2 outline-none" autoFocus />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="hidden rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm sm:block">
            {categories.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {!normalized ? (
        <div className="rounded-xl border border-dashed border-outline-variant p-12 text-center text-sm text-on-surface-variant">
          Search the records stored in this pharmacy. Results are loaded from the ERP database.
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-on-surface-variant">{count} matching record{count === 1 ? "" : "s"}</p>
          {visible.map(([name, rows, Icon, title, subtitle]) => rows.length > 0 && (
            <section key={name} className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              <div className="border-b border-outline-variant px-5 py-4"><h2 className="font-bold text-on-background">{name} ({rows.length})</h2></div>
              <div className="divide-y divide-outline-variant">
                {rows.slice(0, 20).map((row, i) => <div key={row.id || row.invoice_number || row.orderId || `${name}-${i}`} className="flex items-center gap-4 px-5 py-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary"><Icon size={18} /></div><div className="min-w-0"><div className="truncate font-semibold text-on-background">{title(row)}</div><div className="truncate text-sm text-on-surface-variant">{subtitle(row)}</div></div></div>)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
