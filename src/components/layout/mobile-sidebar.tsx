"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-full max-w-[16rem] translate-x-0 translate-y-0 rounded-none rounded-r-2xl border-l-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left p-0">
        <DialogTitle className="sr-only">Menu de navegação</DialogTitle>
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <NavLinks onNavigate={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
