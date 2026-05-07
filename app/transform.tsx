import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransformCard } from '../src/components/TransformCard';
import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { useAuth } from '../src/lib/auth';
import { useSuperwall } from '../src/lib/superwall';
import { uploadPhoto, generateTransformation, pollGeneration } from '../src/lib/api';
import { TRANSFORM_STYLES } from '../src/constants/transforms';
import { COLORS, SPACING, RADIUS, FONT } from '../src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TransformScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const credits = user?.credits ?? 3;
  const plan = user?.plan ?? 'free';
  const { registerPlacement } = useSuperwall();

  const handleSelectStyle = async (styleId: string) => {
    const style = TRANSFORM_STYLES.find((s) => s.id === styleId);
    if (style?.premium && plan === 'free') {
      await registerPlacement('premium_style', { style: styleId }, () => {
        setSelectedStyle(styleId);
      });
      return;
    }
    setSelectedStyle(styleId);
  };

  const handleGenerate = async () => {
    if (!selectedStyle || !photoUri) return;

    if (credits <= 0) {
      await registerPlacement('no_credits', undefined, () => {
        router.push('/pricing');
      });
      return;
    }

    const style = TRANSFORM_STYLES.find((s) => s.id === selectedStyle);
    if (!style) return;

    setGenerating(true);
    setProgress(0);
    setStatusMessage('Uploading photo...');

    try {
      setProgress(10);
      const originalUrl = await uploadPhoto(photoUri, user?.id || 'anonymous');
      setProgress(30);
      setStatusMessage('Starting AI transformation...');

      const generation = await generateTransformation(
        originalUrl,
        style.id,
        style.name,
        user?.id || 'anonymous',
        style.prompt
      );
      setProgress(50);
      setStatusMessage('AI is working its magic...');

      // Poll for completion
      let result = generation;
      let attempts = 0;
      const maxAttempts = 60;

      while (result.status === 'pending' || result.status === 'processing') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        result = await pollGeneration(result.id);
        attempts++;
        setProgress(50 + Math.min(45, (attempts / maxAttempts) * 45));

        if (attempts >= maxAttempts) {
          throw new Error('Generation timed out');
        }
      }

      if (result.status === 'failed') {
        throw new Error(result.error_message || 'Generation failed');
      }

      setProgress(100);
      setStatusMessage('Done!');

      router.replace({
        pathname: '/result',
        params: {
          generationId: result.id,
          resultUrl: result.result_url || '',
          originalUrl: result.original_url,
          styleName: style.name,
        },
      });
    } catch (err) {
      console.error('Generation failed:', err);
      Alert.alert(
        'Generation Failed',
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const selectedStyleData = TRANSFORM_STYLES.find((s) => s.id === selectedStyle);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {generating && <LoadingOverlay message={statusMessage} progress={progress} />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-down" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Choose Style</Text>
        <View style={styles.creditsBadge}>
          <Ionicons name="flash" size={14} color={COLORS.primary} />
          <Text style={styles.creditsText}>{credits}</Text>
        </View>
      </View>

      {/* Preview thumbnail */}
      {photoUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          {selectedStyleData && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedEmoji}>{selectedStyleData.icon}</Text>
              <Text style={styles.selectedName}>{selectedStyleData.name}</Text>
            </View>
          )}
        </View>
      )}

      {/* Style grid */}
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Portrait Styles</Text>
        <View style={styles.row}>
          {TRANSFORM_STYLES.filter((s) => s.category === 'portrait').map((style) => (
            <TransformCard
              key={style.id}
              style={style}
              onPress={() => handleSelectStyle(style.id)}
              locked={style.premium && plan === 'free'}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <View style={styles.row}>
          {TRANSFORM_STYLES.filter((s) => s.category === 'lifestyle').map((style) => (
            <TransformCard
              key={style.id}
              style={style}
              onPress={() => handleSelectStyle(style.id)}
              locked={style.premium && plan === 'free'}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Creative</Text>
        <View style={styles.row}>
          {TRANSFORM_STYLES.filter((s) => s.category === 'creative').map((style) => (
            <TransformCard
              key={style.id}
              style={style}
              onPress={() => handleSelectStyle(style.id)}
              locked={style.premium && plan === 'free'}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Generate button */}
      {selectedStyle && (
        <View style={styles.generateContainer}>
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButton}
            >
              <Ionicons name="sparkles" size={22} color={COLORS.white} />
              <Text style={styles.generateText}>
                Generate {selectedStyleData?.name}
              </Text>
              <View style={styles.costBadge}>
                <Text style={styles.costText}>1 credit</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FONT.sizes.xl,
    fontWeight: '700',
    color: COLORS.white,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  creditsText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.sm,
    fontWeight: '700',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary + '60',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
  },
  selectedEmoji: { fontSize: 16 },
  selectedName: {
    color: COLORS.white,
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  generateContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.bg + 'F0',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
  },
  generateText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
  costBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  costText: {
    color: COLORS.white,
    fontSize: FONT.sizes.xs,
    fontWeight: '600',
  },
});
