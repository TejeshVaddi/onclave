"use client";

import { useState } from "react";
import type { Mentor } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

export function ConnectionRequestModal({
  mentor,
  open,
  onClose,
  onSend,
}: {
  mentor: Mentor | null;
  open: boolean;
  onClose: () => void;
  onSend: (mentorId: string, message: string) => void;
}) {
  const [message, setMessage] = useState("");

  if (!mentor) return null;

  const defaultMessage = `Hi ${mentor.name.split(" ")[0]}, I'd love to connect and learn more about your path into ${mentor.title.toLowerCase()}.`;

  function handleSend() {
    if (!mentor) return;
    onSend(mentor.id, message.trim() || defaultMessage);
    setMessage("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a connection"
      description="Mentors here are example profiles, so this request is saved to your profile and not delivered to a real person."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="profession" onClick={handleSend}>
            Save request
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-2xl bg-beige-soft/70 p-3.5">
        <Avatar initials={mentor.initials} tone={mentor.avatarTone} />
        <div>
          <p className="text-sm font-semibold text-brown">{mentor.name}</p>
          <p className="text-xs text-brown-muted">
            {mentor.title} · {mentor.city}, {mentor.state}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Textarea
          id="connection-message"
          label="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={defaultMessage}
          rows={4}
        />
      </div>
    </Modal>
  );
}
