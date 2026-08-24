"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { sendMessageAction, type ActionState } from "@/lib/actions/messages";
import { Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import type { MessageRow } from "@/lib/data/messages";

const initialState: ActionState = {};

export function ConversationThread({
  conversationId,
  messages,
  currentUserId,
}: {
  conversationId: string;
  messages: MessageRow[];
  currentUserId: string;
}) {
  const action = sendMessageAction.bind(null, conversationId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex h-[70vh] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                  m.is_blocked
                    ? "border border-amber-300 bg-amber-50 text-amber-800"
                    : mine
                    ? "bg-hz-blue text-white"
                    : "bg-hz-sky text-hz-ink"
                )}
              >
                {m.is_blocked ? (
                  <p className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {m.content}
                  </p>
                ) : (
                  <p className="whitespace-pre-line">{m.content}</p>
                )}
                <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-hz-ink/40")}>
                  {formatDateTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form
        ref={formRef}
        action={(formData) => {
          formAction(formData);
          formRef.current?.reset();
        }}
        className="border-t border-hz-navy/10 p-3"
      >
        {state.error && <p className="mb-2 text-xs text-red-600">{state.error}</p>}
        <div className="flex items-end gap-2">
          <Textarea name="content" required rows={1} placeholder="Écrivez un message..." className="flex-1" />
          <Button type="submit" disabled={pending}>
            Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}
