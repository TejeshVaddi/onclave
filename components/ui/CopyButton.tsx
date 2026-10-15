"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonSize } from "@/components/ui/Button";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and insecure contexts: fall back to a hidden textarea.
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Copies text to the clipboard. Used instead of links where the text should be pasted somewhere else. */
export function CopyButton({ text, label = "Copy", size = "sm" }: { text: string; label?: string; size?: ButtonSize }) {
  const [copied, setCopied] = useState(false);

  async function handle() {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <Button variant="outline" size={size} onClick={handle} icon={copied ? <Check className="h-3.5 w-3.5 text-green" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}>
      {copied ? "Copied" : label}
    </Button>
  );
}
