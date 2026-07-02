import {
  LayoutDashboard,
  KanbanSquare,
  ClipboardList,
  Bike,
  TrendingUp,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Kanban", href: "/kanban", icon: KanbanSquare },
  { label: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { label: "Entregadores", href: "/entregadores", icon: Bike },
  { label: "Vendas", href: "/vendas", icon: TrendingUp },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
