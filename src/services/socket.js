import { io } from 'socket.io-client';

const CHAT_URL = process.env.EXPO_PUBLIC_CHAT_URL || 'https://ecohomechatapp.onrender.com';

export function createChatSocket(token) {
  return io(CHAT_URL, {
    transports: ['websocket'],
    auth: { token },
  });
}

export function sendGlobalMessage(socket, text) {
  socket.emit('new-message', { text });
}

export function requestPrivateHistory(socket, userId) {
  socket.emit('private-history', { userId });
}

export function sendPrivateMessage(socket, toUserId, text) {
  socket.emit('private-message', { toUserId, text });
}
