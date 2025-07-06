'use client'
import { Store } from '@tauri-apps/plugin-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { isMobileDevice } from '@/lib/check'

export default function Home() {
  const router = useRouter()
  async function init() {
    const store = await Store.load('store.json')
    const currentPage = await store.get<string>('currentPage')
    setTimeout(() => {
      if (isMobileDevice()) {
        if (currentPage?.includes('/mobile')) {
          router.push(currentPage || '/mobile/chat')
        } else {
          router.push('/mobile/chat')
        }
      } else {
        router.push(currentPage || '/core/record')
      }
    }, 1000)
  }
  useEffect(() => {
    init()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white">Welcome to NoteGen</h1>
        <p className="mt-4 text-lg text-gray-300">Your intelligent note-taking companion.</p>
      </div>
    </div>
  )
}
