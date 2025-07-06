'use client'
import { ChatInput } from "./chat-input";
import ChatContent from "./chat-content";
import { ClipboardListener } from "./clipboard-listener";

export default function Chat() {
  return (
    <div className="flex flex-col flex-1 relative overflow-x-hidden items-center w-full bg-transparent">
      <ChatContent />
      <ClipboardListener />
      <ChatInput />
    </div>
  )
}
