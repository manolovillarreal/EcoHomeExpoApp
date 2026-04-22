import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { login } from '../services/api';
import { getToken } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const isWideScreen = width >= 900;
  const isMobileLayout = !isWideScreen;

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const token = await getToken();

      if (!isMounted) {
        return;
      }

      if (token) {
        router.replace('/(tabs)/products');
        return;
      }

      setCheckingSession(false);
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)/products');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event?.preventDefault?.();
    handleLogin();
  }

  if (checkingSession) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#17624a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={[styles.keyboardView, isMobileLayout && styles.keyboardViewMobile]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.shell,
            isWideScreen && styles.shellWide,
            isWideScreen && { minHeight: Math.max(height - 48, 560) },
          ]}
        >
          <View style={[styles.infoPanel, !isWideScreen && styles.infoPanelMobile]}>
            <Text style={styles.infoEyebrow}>EcoHome</Text>
            <Text style={styles.infoTitle}>Accede a productos, metricas y chat interno</Text>
            <Text style={styles.infoText}>
              Una interfaz simple para iniciar sesion y entrar rapido al flujo principal de la app.
            </Text>
          </View>

          <View style={[styles.card, isWideScreen && styles.cardWide]}>
            <Text style={styles.eyebrow}>EcoHome Expo App</Text>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>
              Ingresa con tu cuenta para ver productos y entrar al chat.
            </Text>

            {Platform.OS === 'web' ? (
              <form onSubmit={handleSubmit} style={styles.form}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Email"
                  placeholderTextColor="#6f7d75"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />

                <TextInput
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor="#6f7d75"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <button type="submit" style={styles.webButton} disabled={loading}>
                  {loading ? 'Ingresando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <View style={styles.form}>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="Email"
                  placeholderTextColor="#6f7d75"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />

                <TextInput
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor="#6f7d75"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Entrar'}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf3ee',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  keyboardViewMobile: {
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf3ee',
  },
  shell: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    gap: 0,
  },
  shellWide: {
    width: '100%',
    maxWidth: 980,
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  infoPanel: {
    flex: 1,
    minHeight: 460,
    borderRadius: 28,
    backgroundColor: '#17624a',
    padding: 32,
    justifyContent: 'flex-end',
  },
  infoPanelMobile: {
    width: '100%',
    minHeight: 240,
    borderRadius: 0,
    marginBottom: 20,
    paddingTop: 40,
  },
  infoEyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d7f4e7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#d7f4e7',
    maxWidth: 420,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#123024',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    width: '100%',
    alignSelf: 'center',
  },
  cardWide: {
    flex: 1,
    maxWidth: 420,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17624a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10231b',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#516159',
    marginTop: 10,
    marginBottom: 18,
  },
  form: {
    gap: 18,
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f8f5',
    borderWidth: 1,
    borderColor: '#d7e0d8',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#10231b',
    width: '100%',
    marginBottom: 4,
  },
  error: {
    color: '#b42318',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#17624a',
    borderRadius: 14,
    minHeight: 56,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  webButton: {
    backgroundColor: '#17624a',
    color: '#ffffff',
    borderRadius: 14,
    borderWidth: 0,
    fontSize: 16,
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%',
    minHeight: 56,
    marginTop: 10,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    appearance: 'none',
  },
});
