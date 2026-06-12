import { useEffect, useRef, useState, useCallback } from "react"
import { Client } from "@stomp/stompjs"
import { ChatMessage } from "@/types"

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const stompClient = useRef<Client | null>(null)

  const connect = useCallback((userId: string) => {
    const token = localStorage.getItem("token")
    if (!token) return

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
    const wsProtocol = apiBaseUrl.startsWith("https") ? "wss" : "ws"
    const wsDomain = apiBaseUrl.replace(/^https?:\/\//, "")
    const wsURL = `${wsProtocol}://${wsDomain}/ws`

    const client = new Client({
      brokerURL: wsURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("STOMP: " + str)
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP Connected successfully!")
        setIsConnected(true)
        
        // Subscribe to explicit user topic
        client.subscribe(`/topic/messages/${userId}`, (message) => {
          if (message.body) {
            const newMsg: ChatMessage = JSON.parse(message.body)
            console.log("New Realtime Message Received: ", newMsg)
            setMessages((prev) => [...prev, newMsg])
          }
        })
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"])
        console.error("Additional details: " + frame.body)
      },
      onWebSocketClose: () => {
        console.log("STOMP Connection closed.")
        setIsConnected(false)
      }
    })

    client.activate()
    stompClient.current = client
  }, [])

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate()
    }
  }, [])

  const sendMessage = useCallback((receiverId: string, content: string) => {
    if (stompClient.current && isConnected) {
      stompClient.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ receiverId, content }),
      })
    }
  }, [isConnected])

  // Optional: clear new messages for a specific conversation
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { connect, disconnect, sendMessage, isConnected, messages, clearMessages, setMessages }
}
