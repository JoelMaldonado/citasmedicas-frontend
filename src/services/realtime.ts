import { io, type Socket } from 'socket.io-client'
import { readStoredToken } from '@/services/authToken'

const SOCKET_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3005'

let socket: Socket | null = null

export function connectSocket(): Socket {
  if (socket) return socket

  socket = io(SOCKET_URL, {
    auth: { token: readStoredToken() },
  })

  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
