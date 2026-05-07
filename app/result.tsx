import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../src/lib/auth';
import { COLORS, SPACING, RADIUS, FONT } from '../src/constants/theme';
import { WATERMARK_TEXT } from '../src/constants/transforms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ResultScreen() {
  const { resultUrl, originalUrl, styleName } = useLocalSearchParams<{
    generationId: string;
    resultUrl: string;
    originalUrl: string;
    styleName: string;
  }>();
  const [showOriginal, setShowOriginal] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isFreePlan = !user || user.plan === 'free';
  const displayUrl = showOriginal ? originalUrl : (resultUrl || originalUrl);

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to save images.');
        return;
      }

      setSaving(true);
      const fileUri = `${cacheDirectory}aiglow_${Date.now()}.jpg`;
      await downloadAsync(displayUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Saved!', 'Image saved to your camera roll.');
    } catch (err) {
      console.error('Save failed:', err);
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        await Share.share({ url: displayUrl, message: `Check out my AI Glow transformation! ${WATERMARK_TEXT}` });
        return;
      }

      const fileUri = `${cacheDirectory}aiglow_share_${Date.now()}.jpg`;
      await downloadAsync(displayUrl, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share your AI Glow transformation',
        });
      } else {
        await Share.share({
          message: `Check out my AI Glow transformation! ${WATERMARK_TEXT}`,
          url: displayUrl,
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleShareToSocial = (platform: string) => {
    Alert.alert(
      `Share to ${platform}`,
      `This would open ${platform} with your AI Glow image. This feature requires the native app to be installed.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{styleName}</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/camera')}
          style={styles.newButton}
        >
          <Ionicons name="camera" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Result image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: displayUrl }} style={styles.resultImage} />

          {isFreePlan && !showOriginal && (
            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>{WATERMARK_TEXT}</Text>
            </View>
          )}

          {/* Before/After toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setShowOriginal(false)}
              style={[styles.toggleButton, !showOriginal && styles.toggleActive]}
            >
              <Text
                style={[styles.toggleText, !showOriginal && styles.toggleTextActive]}
              >
                After ✨
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowOriginal(true)}
              style={[styles.toggleButton, showOriginal && styles.toggleActive]}
            >
              <Text
                style={[styles.toggleText, showOriginal && styles.toggleTextActive]}
              >
                Before
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="download-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '30' }]}>
              <Ionicons name="share-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShareToSocial('Instagram')}
            style={styles.actionButton}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E1306C20' }]}>
              <Ionicons name="logo-instagram" size={24} color="#E1306C" />
            </View>
            <Text style={styles.actionLabel}>Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShareToSocial('TikTok')}
            style={styles.actionButton}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#00f2ea20' }]}>
              <Ionicons name="logo-tiktok" size={24} color="#00f2ea" />
            </View>
            <Text style={styles.actionLabel}>TikTok</Text>
          </TouchableOpacity>
        </View>

        {/* Upgrade banner for free users */}
        {isFreePlan && (
          <TouchableOpacity
            onPress={() => router.push('/pricing')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary + '20', COLORS.accent + '20']}
              style={styles.upgradeBanner}
            >
              <View>
                <Text style={styles.upgradeTitle}>Remove Watermark</Text>
                <Text style={styles.upgradeText}>
                  Upgrade to Premium for watermark-free HD exports
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Generate another */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/camera')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newTransformButton}
          >
            <Ionicons name="camera" size={20} color={COLORS.white} />
            <Text style={styles.newTransformText}>New Transformation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
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
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  imageContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.xl,
  },
  watermark: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermarkText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  toggleContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT.sizes.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.xs,
    fontWeight: '600',
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginBottom: SPACING.lg,
  },
  upgradeTitle: {
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
  },
  upgradeText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
    marginTop: 2,
  },
  newTransformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.lg,
  },
  newTransformText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
});
