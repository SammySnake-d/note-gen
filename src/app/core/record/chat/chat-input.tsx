"use client"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"
import useSettingStore from "@/stores/setting"
import { Textarea } from "@/components/ui/textarea"
import useChatStore from "@/stores/chat"
import { fetchAiStream } from "@/lib/ai"
import { TooltipButton } from "@/components/tooltip-button"

export function ChatInput() {
  const [text, setText] = useState("")
  const { primaryModel } = useSettingStore()
  const { insert, setLoading, saveChat, chats } = useChatStore()
  const [isComposing, setIsComposing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  async function handleSubmit() {
    if (text === '') return
    setText('')

    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
    }

    setLoading(true)

    await insert({
      role: 'user',
      content: text,
      type: 'chat',
    })

    const message = await insert({
      role: 'system',
      content: '',
      type: 'chat',
    })

    if (!message) return

    const lastClearIndex = chats.findLastIndex(item => item.type === 'clear')
    const chatsAfterClear = chats.slice(lastClearIndex + 1)

    const request_content = `
      ${chatsAfterClear.map(item => item.content).join(';

')}
      ${text}
    `

    await saveChat({
      ...message,
      content: '',
    }, true)

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    let cache_content = ''
    try {
      await fetchAiStream(request_content, async (content) => {
        cache_content = content
        await saveChat({
          ...message,
          content
        }, false)
      }, signal)
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error)
      }
    } finally {
      abortControllerRef.current = null
      setLoading(false)
      await saveChat({
        ...message,
        content: cache_content
      }, true)
    }
  }

  return (
    <div className="relative w-full flex items-center p-4">
      <Textarea
        className="flex-1 p-2 border-none text-base focus-visible:ring-0 shadow-none min-h-[40px] max-h-[240px] resize-none overflow-y-auto"
        rows={1}
        disabled={!primaryModel}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          const textarea = e.target
          textarea.style.height = 'auto'
          const newHeight = Math.min(textarea.scrollHeight, 240)
          textarea.style.height = `${newHeight}px`
        }}
        placeholder="Start writing..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isComposing && !e.shiftKey && e.keyCode === 13) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setTimeout(() => {
          setIsComposing(false)
        }, 0)}
      />
      {text && (
        <TooltipButton
          variant={"default"}
          size="sm"
          icon={<Send className="size-4" />}
          disabled={!primaryModel}
          tooltipText="Send"
          onClick={handleSubmit}
        />
      )}
    </div>
  )
}
