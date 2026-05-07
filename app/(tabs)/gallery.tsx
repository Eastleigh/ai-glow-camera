import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/lib/auth';
import { getUserGenerations } from '../../src/lib/api';
import { COLORS, SPACING, RADIUS, FONT } from '../../src/constants/theme';
import type { Generation } from '../../src/lib/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - SPACING.md * 3) / 2;

export default function GalleryScreen() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadGenerations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await getUserGenerations(user.id);
      setGenerations(data);
    } catch (err) {
      console.error('Failed to load generations:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGenerations();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Generation }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/result',
          params: {
            generationId: item.id,
            resultUrl: item.result_url || '',
            originalUrl: item.original_url,
            styleName: item.style_name,
          },
        })
      }
      activeOpacity={0.8}
      style={styles.imageContainer}
    >
      <Image
        source={{ uri: item.result_url || item.original_url }}
        style={styles.image}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.imageOverlay}
      >
        <Text style={styles.styleName}>{item.style_name}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  item.status === 'completed'
                    ? COLORS.success
                    : item.status === 'failed'
                    ? COLORS.error
                    : COLORS.warning,
              },
            ]}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No generations yet</Text>
      <Text style={styles.emptyText}>Take a selfie and apply an AI transformation</Text>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/camera')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.emptyButton}
        >
          <Ionicons name="camera" size={20} color={COLORS.white} />
          <Text style={styles.emptyButtonText}>Open Camera</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Gallery</Text>
        <Text style={styles.subtitle}>{generations.length} generations</Text>
      </View>

      <FlatList
        data={generations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  grid: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  row: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  styleName: {
    color: COLORS.white,
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT.sizes.xs,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyText: {
    fontSize: FONT.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
});
