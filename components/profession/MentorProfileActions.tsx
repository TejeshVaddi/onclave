"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Mentor } from "@/types";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ConnectionRequestModal } from "./ConnectionRequestModal";
import { Button } from "@/components/ui/Button";

export function MentorProfileActions({ mentor }: { mentor: Mentor }) {
  const { requestConnection, hasRequested } = useAppState();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const requested = hasRequested(mentor.id);

  function handleSend(mentorId: string, message: string) {
    requestConnection(mentorId, message);
    toast({ title: "Connection request sent", description: `${mentor.name} will see your message.`, pillar: "profession" });
    setOpen(false);
  }

  return (
    <div className="mt-6 flex gap-3">
      {requested ? (
        <Button variant="secondary" disabled icon={<CheckCircle2 className="h-4 w-4 text-green" aria-hidden />}>
          Request sent
        </Button>
      ) : (
        <Button variant="profession" onClick={() => setOpen(true)}>
          Request Connection
        </Button>
      )}
      <ConnectionRequestModal mentor={mentor} open={open} onClose={() => setOpen(false)} onSend={handleSend} />
    </div>
  );
}
