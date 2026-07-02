import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <UtensilsCrossed className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          LV<span className="text-primary">Food</span>
        </span>
      )}
    </div>
  );
}
