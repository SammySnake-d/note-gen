import useChatStore from '@/stores/chat';
import useTagStore from '@/stores/tag';
import { useEffect } from 'react';
import { Chat } from '@/db/chats';
import ChatPreview from './chat-preview';
import './chat.scss';
import { scrollToBottom } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function ChatContent() {
  const { chats, init } = useChatStore();
  const { currentTagId } = useTagStore();

  useEffect(() => {
    init(currentTagId);
  }, [currentTagId]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  return (
    <div id="chats-wrapper" className="flex-1 w-full p-4 overflow-y-auto">
      {chats.map((chat) => (
        <Message key={chat.id} chat={chat} />
      ))}
    </div>
  );
}

function Message({ chat }: { chat: Chat }) {
  if (chat.type === 'clear') {
    return (
      <div className="w-full flex justify-center items-center gap-4 my-4">
        <Separator className="flex-1" />
        <p className="text-sm text-center text-muted-foreground">Context Cleared</p>
        <Separator className="flex-1" />
      </div>
    );
  }

  return (
    <div className="w-full my-4">
      <ChatPreview text={chat.content || ''} />
    </div>
  );
}
