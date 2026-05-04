"use client";

import { useFormStatus } from "react-dom";

type SubmitWithPendingProps = {
  children: React.ReactNode;
  pendingLabel: string;
  className: string;
};

export function SubmitWithPending({ children, pendingLabel, className }: SubmitWithPendingProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
