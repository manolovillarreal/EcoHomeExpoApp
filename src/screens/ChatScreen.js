import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import AppCard from '../components/AppCard';
import ChatHeader from '../components/ChatHeader';
import ChatSidebar from '../components/ChatSidebar';
import MessageInput from '../components/MessageInput';
import MessageList from '../components/MessageList';
import MobileDrawer from '../components/MobileDrawer';
import { getConversations, getMyStats } from '../services/api';
import { getToken, removeToken } from '../services/auth';
import {
  createChatSocket,
  requestPrivateHistory,
  sendGlobalMessage,
  sendPrivateMessage,
} from '../services/socket';
import { colors, spacing, typography } from '../theme/designSystem';

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let block = 0;
  let charCode = 0;
  let index = 0;

  while (padded.charAt(index | 0)) {
    const encoded = chars.indexOf(padded.charAt((index += 1)));

    if (encoded < 0) {
      continue;
    }

    block = index % 4 ? block * 64 + encoded : encoded;

    if (index % 4) {
      charCode = 255 & (block >> ((-2 * index) & 6));
      output += String.fromCharCode(charCode);
    }
  }

  try {
    return decodeURIComponent(
      output
        .split('')
        .map((character) => `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
  } catch {
    return output;
  }
}

function parseToken(token) {
  if (!token) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(token.split('.')[1]));
  } catch {
    return null;
  }
}

function resolveCurrentUser(payload, stats) {
  return {
    id: payload?.sub || payload?.id || payload?.user_id || null,
    name: stats?.name || stats?.user?.name || payload?.name || payload?.email || 'Usuario',
    email: stats?.email || stats?.user?.email || payload?.email || '',
  };
}

function normalizeUser(user) {
  const userId = String(user?.userId || user?.id || user?.user_id || '');
  const username =
    user?.username ||
    user?.name ||
    user?.userName ||
    user?.user_name ||
    user?.user_name_snapshot ||
    null;

  return {
    ...user,
    id: userId,
    userId,
    name: username || null,
    username,
    email: user?.email || '',
    lastMessageId: user?.lastMessageId || null,
    lastMessageText: user?.lastMessageText || '',
    lastMessageAt: user?.lastMessageAt || '',
  };
}

function normalizeConversation(conversation) {
  const userId = String(conversation?.userId || conversation?.id || '');
  const username = conversation?.username || conversation?.user_name || null;

  return {
    ...conversation,
    id: userId,
    userId,
    name: username || null,
    username,
    email: conversation?.email || '',
    lastMessageId: conversation?.lastMessageId || null,
    lastMessageText: conversation?.lastMessageText || '',
    lastMessageAt: conversation?.lastMessageAt || '',
  };
}

export default function ChatScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const socketRef = useRef(null);
  const [status, setStatus] = useState('Conectando');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [stats, setStats] = useState(null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [globalMessages, setGlobalMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [activeRoom, setActiveRoom] = useState({ type: 'global', userId: '' });
  const [drawerVisible, setDrawerVisible] = useState(false);

  const currentUser = useMemo(() => resolveCurrentUser(tokenPayload, stats), [stats, tokenPayload]);
  const filterOutCurrentUser = useCallback(
    (users) =>
      users.filter((user) => {
        const sameId =
          (user.userId || user.id) &&
          String(user.userId || user.id) === String(currentUser.id);
        const sameEmail =
          user.email &&
          currentUser.email &&
          String(user.email).toLowerCase() === String(currentUser.email).toLowerCase();
        const sameName =
          user.name &&
          currentUser.name &&
          String(user.name).trim().toLowerCase() === String(currentUser.name).trim().toLowerCase();

        return !sameId && !sameEmail && !sameName;
      }),
    [currentUser.email, currentUser.id, currentUser.name]
  );
  const filteredOnlineUsers = useMemo(
    () => filterOutCurrentUser(onlineUsers.map(normalizeUser)),
    [filterOutCurrentUser, onlineUsers]
  );
  const privateConversations = useMemo(() => {
    const onlineUsersById = new Map(
      filteredOnlineUsers.map((user) => [
        String(user.userId),
        {
          userId: String(user.userId),
          username: user.username || user.name || null,
          isOnline: true,
        },
      ])
    );

    const mergedUsers = conversations.map((conversation) => {
      const conversationUserId = String(conversation.userId);
      const onlineUser = onlineUsersById.get(conversationUserId);

      if (onlineUser) {
        onlineUsersById.delete(conversationUserId);
      }

      return {
        userId: conversationUserId,
        id: conversationUserId,
        username: onlineUser?.username || conversation.username || 'Unknown user',
        name: onlineUser?.username || conversation.username || 'Unknown user',
        isOnline: Boolean(onlineUser),
        lastMessageId: conversation.lastMessageId || null,
        lastMessageText: conversation.lastMessageText || '',
        lastMessageAt: conversation.lastMessageAt || null,
      };
    });

    for (const onlineUser of onlineUsersById.values()) {
      mergedUsers.push({
        userId: onlineUser.userId,
        id: onlineUser.userId,
        username: onlineUser.username || 'Unknown user',
        name: onlineUser.username || 'Unknown user',
        isOnline: true,
        lastMessageId: null,
        lastMessageText: '',
        lastMessageAt: null,
      });
    }

    return mergedUsers;
  }, [conversations, filteredOnlineUsers]);
  const resolvedOnlineUsers = useMemo(
    () =>
      filteredOnlineUsers.map((user) => {
        const mergedUser = privateConversations.find(
          (conversation) => String(conversation.userId) === String(user.userId)
        );

        return {
          userId: String(user.userId),
          id: String(user.userId),
          username: mergedUser?.username || user.username || 'Unknown user',
          name: mergedUser?.name || user.name || user.username || 'Unknown user',
          isOnline: true,
        };
      }),
    [filteredOnlineUsers, privateConversations]
  );

  const activeUser = privateConversations.find(
    (user) => String(user.userId) === String(activeRoom.userId)
  );

  const activeMessages =
    activeRoom.type === 'private' && activeRoom.userId
      ? privateMessages[activeRoom.userId] || []
      : globalMessages;

  const roomTitle = activeRoom.type === 'private' && activeUser ? activeUser.name : 'Global chat';
  const roomSubtitle =
    activeRoom.type === 'private' && activeUser
      ? 'Mensaje directo'
      : 'Canal general del equipo';
  const participantCount =
    activeRoom.type === 'private' && activeUser ? 2 : resolvedOnlineUsers.length + 1;

  const loadConversations = useCallback(async () => {
    const response = await getConversations();
    const normalized = filterOutCurrentUser(response.map(normalizeConversation));
    setConversations(normalized);
  }, [filterOutCurrentUser]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function connect() {
        const token = await getToken();

        if (!token) {
          router.replace('/login');
          return;
        }

        const [statsResponse, conversationsResponse] = await Promise.all([
          getMyStats(),
          getConversations(),
        ]);
        const payload = parseToken(token);
        const ownId = payload?.sub || payload?.id || payload?.user_id;

        if (!isMounted) {
          return;
        }

        setStats(statsResponse);
        setTokenPayload(payload);
        setConversations(filterOutCurrentUser(conversationsResponse.map(normalizeConversation)));
        setLoading(true);
        setError('');

        const socket = createChatSocket(token);
        socketRef.current = socket;

        socket.on('connect', () => {
          setStatus('Conectado');
          loadConversations().catch(() => {});
          setLoading(false);
        });

        socket.on('disconnect', () => {
          setStatus('Desconectado');
        });

        socket.on('connect_error', (connectionError) => {
          setStatus('Error');
          setError(connectionError.message || 'No fue posible conectar el chat.');
          setLoading(false);
        });

        socket.on('message-history', (history) => {
          setGlobalMessages(Array.isArray(history) ? history : []);
        });

        socket.on('new-message', (message) => {
          setGlobalMessages((current) => [...current, message]);
        });

        socket.on('users:online', (users) => {
          const nextUsers = Array.isArray(users) ? users : [];

          setOnlineUsers(nextUsers.filter((user) => String(user?.userId || user?.id) !== String(ownId)));
        });

        socket.on('private-message-history', (payloadHistory) => {
          const otherUserId = String(payloadHistory?.userId || '');
          const history = Array.isArray(payloadHistory?.messages) ? payloadHistory.messages : [];

          if (!otherUserId || String(otherUserId) === String(ownId)) {
            return;
          }

          setPrivateMessages((current) => ({
            ...current,
            [otherUserId]: history,
          }));
        });

        socket.on('private-message', (message) => {
          const otherUserId =
            String(message?.user_id) === String(ownId) ? message?.to_user_id : message?.user_id;

          if (!otherUserId || String(otherUserId) === String(ownId)) {
            return;
          }

          setPrivateMessages((current) => ({
            ...current,
            [otherUserId]: [...(current[otherUserId] || []), message],
          }));

          loadConversations().catch(() => {});
        });

        socket.on('chat-error', (chatError) => {
          setError(chatError?.message || 'Ocurrio un error en el chat.');
        });
      }

      connect().catch((requestError) => {
        setError(requestError.message);
        setLoading(false);
      });

      return () => {
        isMounted = false;

        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [filterOutCurrentUser, loadConversations, router])
  );

  useFocusEffect(
    useCallback(() => {
      if (activeRoom.type === 'private' && activeRoom.userId && socketRef.current) {
        requestPrivateHistory(socketRef.current, activeRoom.userId);
      }
    }, [activeRoom])
  );

  async function handleLogout() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    await removeToken();
    router.replace('/login');
  }

  function handleSelectGlobal() {
    setActiveRoom({ type: 'global', userId: '' });
    setDrawerVisible(false);
  }

  function handleSelectUser(userId) {
    if (!userId || String(userId) === String(currentUser.id)) {
      return;
    }

    setActiveRoom({ type: 'private', userId: String(userId) });
    setDrawerVisible(false);

    if (socketRef.current) {
      requestPrivateHistory(socketRef.current, String(userId));
    }
  }

  function handleSend() {
    const text = input.trim();

    if (!text || !socketRef.current) {
      return;
    }

    if (activeRoom.type === 'private' && activeRoom.userId) {
      if (String(activeRoom.userId) === String(currentUser.id)) {
        return;
      }

      sendPrivateMessage(socketRef.current, activeRoom.userId, text);
      loadConversations().catch(() => {});
    } else {
      sendGlobalMessage(socketRef.current, text);
    }

    setInput('');
  }

  const sidebar = (
    <ChatSidebar
      currentUserName={currentUser.name}
      currentUserStatus={status}
      conversations={privateConversations}
      onlineUsers={resolvedOnlineUsers}
      activeRoom={activeRoom}
      onSelectGlobal={handleSelectGlobal}
      onSelectUser={handleSelectUser}
      onLogout={handleLogout}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <View style={styles.screen}>
        {isDesktop ? <View style={styles.sidebarDesktop}>{sidebar}</View> : null}

        <AppCard style={styles.chatCard}>
          <ChatHeader
            title={roomTitle}
            subtitle={roomSubtitle}
            status={status}
            participantCount={participantCount}
            onMenuPress={() => setDrawerVisible(true)}
            showMenuButton={!isDesktop}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>Conectando al chat...</Text>
            </View>
          ) : (
            <MessageList
              messages={activeMessages}
              currentUserId={currentUser.id}
              currentUserName={currentUser.name}
              privateParticipantName={activeUser?.name}
              roomType={activeRoom.type}
              emptyText={
                activeRoom.type === 'private'
                  ? 'No hay mensajes privados todavia.'
                  : 'Todavia no hay mensajes en el chat global.'
              }
            />
          )}

          <MessageInput
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            placeholder={
              activeRoom.type === 'private' ? 'Escribe un mensaje privado' : 'Escribe a todo el equipo'
            }
            disabled={loading}
          />
        </AppCard>

        {!isDesktop ? (
          <MobileDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)}>
            {sidebar}
          </MobileDrawer>
        ) : null}
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  screen: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[2],
  },
  sidebarDesktop: {
    width: 312,
  },
  chatCard: {
    flex: 1,
    overflow: 'hidden',
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    backgroundColor: '#fff2f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ffd9d3',
    paddingHorizontal: spacing[2],
    paddingVertical: 12,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: spacing[3],
  },
  loaderText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
