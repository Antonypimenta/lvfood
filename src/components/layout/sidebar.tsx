import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 scrollbar-thin">
        <NavLinks />
      </div>
      <div className="border-t border-border p-4">
        <p className="px-3 text-xs text-muted-foreground">
          Sistema de Delivery · v1.0
        </p>
      </div>
    </aside>
  );
}
