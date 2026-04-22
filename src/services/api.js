import { getToken, setToken } from './auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ecohomeapi.onrender.com';
const CHAT_API_URL = process.env.EXPO_PUBLIC_CHAT_API_URL || 'https://ecohomechatapp.onrender.com';

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL.replace(/\/$/, '')}${path}`;
}

async function parseJson(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' ? payload : null) ||
      'Request failed';
    throw new Error(message);
  }

  return payload;
}

function extractToken(payload) {
  return payload?.token || payload?.accessToken || payload?.access_token || null;
}

export async function login(credentials) {
  const payload = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const token = extractToken(payload);

  if (!token) {
    throw new Error('JWT missing in login response');
  }

  await setToken(token);
  return payload;
}

export async function getProducts() {
  const payload = await request('/products', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return Array.isArray(payload) ? payload : payload?.products || [];
}

export async function createProduct(product) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getMyStats() {
  return request('/users/me/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getConversations() {
  const payload = await request(`${CHAT_API_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log("conversations payload", payload);
  
  return Array.isArray(payload) ? payload : payload?.conversations || [];
}
