"use client";

import { useEffect, useState, useCallback } from 'react';
import { chatSocketService } from '@/src/services/websocket/chat';
import { tokenStorage } from '@/src/lib/auth/token-storage';
import { chatApi } from '@/src/services/api/chat.api';

export interface MessageItem {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export function useChat(tripId: string) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch historical chat messages
  useEffect(() => {
    async function loadHistory() {
      if (!tripId) return;
      try {
        setLoading(true);
        const res = await chatApi.getMessages(tripId) as any;
        if (res && res.success && res.data) {
          const mapped = res.data.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.sender ? `${m.sender.firstName} ${m.sender.lastName}` : 'User',
            content: m.content,
            createdAt: m.createdAt,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [tripId]);

  // 2. Connect to Socket.io namespace
  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token || !tripId) return;

    // Join conversation
    const unsubJoin = chatSocketService.joinConversation(token, tripId, (data) => {
      setConversationId(data.conversationId);
    });

    // Listen for new messages
    const unsubMessages = chatSocketService.onNewMessage(token, (message) => {
      const mappedMsg: MessageItem = {
        id: message.id || Math.random().toString(),
        senderId: message.senderId,
        senderName: message.senderName || 'User',
        content: message.content,
        createdAt: message.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, mappedMsg]);
    });

    return () => {
      unsubJoin();
      unsubMessages();
    };
  }, [tripId]);

  // 3. Send message handler
  const sendMessage = useCallback((content: string) => {
    const token = tokenStorage.getAccessToken();
    if (!token || !conversationId || !content.trim()) return;

    chatSocketService.sendMessage(token, {
      conversationId,
      content,
    });
  }, [conversationId]);

  return {
    messages,
    loading,
    sendMessage,
  };
}
