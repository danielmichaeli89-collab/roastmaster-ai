import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)
  const connectAttempts = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return

    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.warn('No auth token, skipping socket connection')
      return
    }

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => {
      console.log('Socket connected')
      connectAttempts.current = 0
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      connectAttempts.current++
    })

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })
  }, [])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn(`Socket not connected, cannot emit ${event}`)
    }
  }, [])

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return

    socketRef.current.on(event, callback)

    return () => {
      socketRef.current?.off(event, callback)
    }
  }, [])

  const once = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (!socketRef.current) return

    socketRef.current.once(event, callback)
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    socket: socketRef.current,
    emit,
    on,
    once,
    disconnect,
    isConnected: socketRef.current?.connected || false,
  }
}
