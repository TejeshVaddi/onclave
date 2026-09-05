"use client";

import { useState } from "react";
import type { User } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Segmented } from "@/components/ui/Segmented";
import { HERITAGES } from "@/data/heritages";
import { INTERESTS } from "@/data/interests";
import { PROFESSIONS } from "@/data/professions";
import { geocode } from "@/services/geocodeService";
import { toggleIn } from "@/lib/hooks";

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (patch: Partial<User>) => void;
}

export function EditProfileModal({ user, open, onClose, onSave }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Edit profile" size="lg">
      {/* Mounting the form fresh each time the modal opens (rather than
          resetting state via an effect) means its fields always start from
          the current profile, with no reset logic needed. */}
      {open ? <EditProfileForm key={user.updatedAt} user={user} onClose={onClose} onSave={onSave} /> : null}
    </Modal>
  );
}

function EditProfileForm({ user, onClose, onSave }: Omit<Props, "open">) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [heritages, setHeritages] = useState<string[]>(user.heritages);
  const [city, setCity] = useState(user.location.city);
  const [state, setState] = useState(user.location.state ?? "");
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [profession, setProfession] = useState(user.profession ?? "");
  const [wantsMentorship, setWantsMentorship] = useState<"yes" | "no">(user.wantsMentorship ? "yes" : "no");

  function handleSave() {
    onSave({
      name: name.trim() || user.name,
      bio: bio.trim(),
      heritages,
      location: geocode({ city, state, country: user.location.country }),
      interests,
      profession: profession || null,
      wantsMentorship: wantsMentorship === "yes",
    });
    onClose();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <Input label="State / Province" value={state} onChange={(e) => setState(e.target.value)} className="sm:max-w-xs" />
      <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />

      <div>
        <p className="mb-2 text-sm font-semibold text-brown">Heritage</p>
        <ChipRow>
          {HERITAGES.map((h) => (
            <Chip key={h.id} size="sm" pillar="culture" selected={heritages.includes(h.id)} onClick={() => setHeritages((prev) => toggleIn(prev, h.id))}>
              {h.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brown">Interests</p>
        <ChipRow>
          {INTERESTS.map((i) => (
            <Chip key={i.id} size="sm" pillar={i.pillar} selected={interests.includes(i.id)} onClick={() => setInterests((prev) => toggleIn(prev, i.id))}>
              {i.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brown">Profession or field</p>
        <ChipRow>
          {PROFESSIONS.map((p) => (
            <Chip key={p.id} size="sm" pillar="profession" selected={profession === p.id} onClick={() => setProfession(p.id)}>
              {p.label}
            </Chip>
          ))}
        </ChipRow>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brown">Mentorship recommendations</p>
        <Segmented
          label="Mentorship preference"
          value={wantsMentorship}
          onChange={setWantsMentorship}
          options={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
          ]}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-beige pt-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
