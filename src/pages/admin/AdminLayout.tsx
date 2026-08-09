import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, PackagePlus, Boxes, ShoppingCart, LogOut, Shield, Home } from "lucide-react";
import { useStore } from "../../lib/store";
import { Page } from "../../components/ui";
import { cn } from "../../utils/cn";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/add", label: "Add Product", icon: PackagePlus, end: false },
  { to: "/admin/products", label: "Manage Products", icon: Boxes, end: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, end: false },
];

export default function AdminLayout() {
  const { adminLogout } = useStore();
  const navigate = useNavigate();

  return (
    <Page className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit lg:sticky lg:top-28">
          <div className="glass rounded-2xl p-4">
            <div className="mb-4 flex items-center gap-2 px-2">
              <Shield className="h-5 w-5 text-gold" />
              <span className="font-serif text-lg font-bold text-white">Admin</span>
            </div>
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive ? "bg-gold/15 text-gold-soft" : "text-zinc-300 hover:bg-white/5"
                    )
                  }
                >
                  <l.icon className="h-4 w-4" /> {l.label}
                </NavLink>
              ))}
              <button
                onClick={() => navigate("/")}
                className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
              >
                <Home className="h-4 w-4" /> View Store
              </button>
              <button
                onClick={() => {
                  adminLogout();
                  navigate("/admin/login");
                }}
                className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </div>
        </aside>

        <div>
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
