"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorScreenProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorScreen({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
}: ErrorScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle
        className="mb-3 h-8 w-8 text-destructive"
        aria-hidden
      />
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
