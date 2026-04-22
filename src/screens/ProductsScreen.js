import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import AppButton from '../components/AppButton';
import AppCard from '../components/AppCard';
import AppInput from '../components/AppInput';
import ProductListItem from '../components/ProductListItem';
import SectionHeader from '../components/SectionHeader';
import { createProduct, getMyStats, getProducts } from '../services/api';
import { getToken, removeToken } from '../services/auth';
import { colors, radius, spacing, typography } from '../theme/designSystem';

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number.isNaN(amount) ? 0 : amount);
}

function getCreatorName(product) {
  return (
    product?.creator?.name ||
    product?.createdBy?.name ||
    product?.user?.name ||
    product?.created_by?.name ||
    'Sin creador'
  );
}

function getMetricName(stats) {
  return stats?.name || stats?.user?.name || stats?.fullName || stats?.username || 'Usuario';
}

function getMetricCount(stats) {
  return (
    stats?.productCount ??
    stats?.productsCount ??
    stats?.products_count ??
    stats?.count ??
    stats?.totalProducts ??
    0
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const loadData = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setError('');
      const [productsResponse, statsResponse] = await Promise.all([getProducts(), getMyStats()]);
      setProducts(productsResponse);
      setStats(statsResponse);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
  }

  async function handleCreateProduct() {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Campos requeridos', 'Completa nombre y precio antes de crear el producto.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createProduct({
        name: name.trim(),
        price: Number(price),
      });

      setName('');
      setPrice('');
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await removeToken();
    router.replace('/login');
  }

  const metricName = getMetricName(stats);
  const productCount = getMetricCount(stats);
  const totalValue = useMemo(
    () => products.reduce((sum, item) => sum + Number(item?.price || 0), 0),
    [products]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
          isTablet && styles.scrollContentTablet,
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          <AppCard style={styles.heroCard}>
            <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>Product Management</Text>
                <Text style={styles.heroTitle}>Gestiona tu catalogo con una vista clara y rapida</Text>
                <Text style={styles.heroDescription}>
                  Crea productos, revisa quien los publico y sigue el ritmo de tu actividad desde una sola pantalla.
                </Text>
              </View>

              <View style={[styles.heroMetaRow, isDesktop && styles.heroMetaRowDesktop]}>
                <View style={styles.metricChip}>
                  <Text style={styles.metricChipLabel}>Usuario</Text>
                  <Text style={styles.metricChipValue}>{metricName}</Text>
                </View>
                <View style={styles.metricChip}>
                  <Text style={styles.metricChipLabel}>Productos</Text>
                  <Text style={styles.metricChipValue}>{productCount}</Text>
                </View>
                <View style={styles.metricChip}>
                  <Text style={styles.metricChipLabel}>Valor total</Text>
                  <Text style={styles.metricChipValue}>{formatCurrency(totalValue)}</Text>
                </View>
              </View>
            </View>
          </AppCard>

          <View style={styles.pageHeader}>
            <View style={styles.pageHeaderCopy}>
              <Text style={styles.pageTitle}>Productos</Text>
              <Text style={styles.pageSubtitle}>
                Crea un nuevo producto y consulta el listado con mejor jerarquia visual.
              </Text>
            </View>
            <View style={styles.pageHeaderActions}>
              <AppButton
                label={refreshing ? 'Actualizando...' : 'Actualizar'}
                variant="secondary"
                onPress={handleRefresh}
                disabled={refreshing || loading}
                style={styles.actionButton}
              />
              <AppButton
                label="Salir"
                variant="secondary"
                onPress={handleLogout}
                style={styles.actionButton}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
            <View style={[styles.formColumn, isDesktop && styles.formColumnDesktop]}>
              <AppCard style={styles.formCard}>
                <SectionHeader
                  eyebrow="Create product"
                  title="Nuevo producto"
                  description="Completa los datos basicos y publica el producto con tu usuario autenticado."
                />

                <View style={styles.formFields}>
                  <AppInput
                    label="Nombre"
                    placeholder="Ej. Lampara solar"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="sentences"
                  />

                  <AppInput
                    label="Precio"
                    placeholder="Ej. 320000"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                    hint="Se mostrara en COP dentro del listado."
                  />
                </View>

                <View style={styles.formFooter}>
                  <Text style={styles.formHelper}>
                    Mantener este formulario compacto mejora el alcance del pulgar en mobile.
                  </Text>
                  {isDesktop ? (
                    <AppButton
                      label={submitting ? 'Guardando producto...' : 'Crear producto'}
                      onPress={handleCreateProduct}
                      disabled={submitting}
                      style={styles.createButton}
                    />
                  ) : null}
                </View>
              </AppCard>
            </View>

            <View style={styles.listColumn}>
              <AppCard style={styles.listCard}>
                <SectionHeader
                  eyebrow="Product list"
                  title="Listado de productos"
                  description="Explora el catalogo con una lista compacta, legible y facil de escanear."
                  action={loading ? <ActivityIndicator color={colors.primary} /> : null}
                />

                {products.length ? (
                  <View style={styles.listStack}>
                    {products.map((item, index) => (
                      <ProductListItem
                        key={String(item?.id || `${item?.name}-${index}`)}
                        name={item?.name || 'Producto sin nombre'}
                        price={formatCurrency(item?.price)}
                        creator={getCreatorName(item)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>
                      {loading ? 'Cargando productos...' : 'No hay productos todavia'}
                    </Text>
                    <Text style={styles.emptyText}>
                      {loading
                        ? 'Estamos consultando el backend para cargar el catalogo.'
                        : 'Crea tu primer producto para empezar a poblar el listado.'}
                    </Text>
                  </View>
                )}
              </AppCard>
            </View>
          </View>
        </View>
      </ScrollView>

      {!isDesktop ? (
        <View style={styles.mobileActionBar}>
          <AppButton
            label={submitting ? 'Guardando producto...' : 'Crear producto'}
            onPress={handleCreateProduct}
            disabled={submitting}
          />
        </View>
      ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[2],
    paddingTop: spacing[3],
    paddingBottom: 112,
  },
  scrollContentTablet: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
  },
  scrollContentDesktop: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    gap: spacing[3],
  },
  containerDesktop: {
    gap: spacing[4],
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  heroContent: {
    padding: spacing[3],
    gap: spacing[3],
  },
  heroContentDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroCopy: {
    flex: 1,
    gap: spacing[1],
    maxWidth: 640,
  },
  heroEyebrow: {
    ...typography.meta,
    color: '#ccebdc',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    ...typography.hero,
    color: '#ffffff',
  },
  heroDescription: {
    ...typography.body,
    color: '#d7f4e7',
  },
  heroMetaRow: {
    gap: spacing[2],
  },
  heroMetaRowDesktop: {
    width: 320,
  },
  metricChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.md,
    padding: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  metricChipLabel: {
    ...typography.meta,
    color: '#ccebdc',
    marginBottom: 4,
  },
  metricChipValue: {
    ...typography.cardTitle,
    color: '#ffffff',
  },
  pageHeader: {
    gap: spacing[2],
  },
  pageHeaderCopy: {
    gap: spacing[1],
  },
  pageTitle: {
    ...typography.title,
    color: colors.text,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  pageHeaderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  actionButton: {
    minWidth: 124,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    backgroundColor: '#fff2f0',
    borderWidth: 1,
    borderColor: '#ffd9d3',
    borderRadius: radius.sm,
    paddingHorizontal: spacing[2],
    paddingVertical: 12,
  },
  mainLayout: {
    gap: spacing[3],
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  formColumn: {
    gap: spacing[2],
  },
  formColumnDesktop: {
    width: 360,
  },
  listColumn: {
    flex: 1,
    minWidth: 0,
  },
  formCard: {
    padding: spacing[3],
    gap: spacing[3],
  },
  formFields: {
    gap: spacing[2],
  },
  formFooter: {
    gap: spacing[2],
  },
  formHelper: {
    ...typography.meta,
    color: colors.textSoft,
  },
  createButton: {
    width: '100%',
  },
  listCard: {
    padding: spacing[3],
    gap: spacing[3],
    minHeight: 320,
  },
  listStack: {
    gap: spacing[2],
  },
  emptyState: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
    padding: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    gap: spacing[1],
  },
  emptyTitle: {
    ...typography.cardTitle,
    color: colors.text,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  mobileActionBar: {
    position: 'absolute',
    left: spacing[2],
    right: spacing[2],
    bottom: spacing[2],
    backgroundColor: 'rgba(244,247,251,0.96)',
    paddingTop: spacing[1],
  },
});
