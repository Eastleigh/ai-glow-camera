import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CaptureButton } from '../../src/components/CaptureButton';
import { CreditBadge } from '../../src/components/CreditBadge';
import { useAuth } from '../../src/lib/auth';
import { COLORS, SPACING, RADIUS, FONT } from '../../src/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={[COLORS.bg, '#1A1A2E']} style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color={COLORS.primary} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          AI Glow Camera needs your camera to take selfies for AI transformations
        </Text>
        <TouchableOpacity onPress={requestPermission} activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false,
      });
      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    } catch (err) {
      console.error('Failed to take picture:', err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedPhoto(result.assets[0].uri);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const proceedToTransform = () => {
    if (capturedPhoto) {
      router.push({
        pathname: '/transform',
        params: { photoUri: capturedPhoto },
      });
    }
  };

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />

        <View style={[styles.previewTopBar, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity
            onPress={() => setCapturedPhoto(null)}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.previewBottomBar}>
          <TouchableOpacity
            onPress={() => setCapturedPhoto(null)}
            style={styles.retakeButton}
          >
            <Ionicons name="refresh" size={22} color={COLORS.white} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={proceedToTransform} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.transformButton}
            >
              <Ionicons name="sparkles" size={20} color={COLORS.white} />
              <Text style={styles.transformText}>Transform</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flashEnabled ? 'on' : 'off'}
      >
        {/* Top controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity
            onPress={() => setFlashEnabled(!flashEnabled)}
            style={styles.iconButton}
          >
            <Ionicons
              name={flashEnabled ? 'flash' : 'flash-off'}
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <CreditBadge
            credits={user?.credits ?? 3}
            plan={user?.plan ?? 'free'}
            onPress={() => router.push('/pricing')}
          />

          <TouchableOpacity onPress={toggleFacing} style={styles.iconButton}>
            <Ionicons name="camera-reverse" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Face guide */}
        <View style={styles.faceGuide}>
          <View style={styles.faceGuideOval} />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
            <Ionicons name="images-outline" size={28} color={COLORS.white} />
          </TouchableOpacity>

          <CaptureButton onPress={takePicture} size={76} />

          <View style={styles.placeholder} />
        </View>

        <Text style={styles.hint}>Take a selfie to get started</Text>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  permissionTitle: {
    fontSize: FONT.sizes.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  permissionText: {
    fontSize: FONT.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuideOval: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 48,
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT.sizes.sm,
    textAlign: 'center',
    paddingBottom: SPACING.lg,
  },
  preview: {
    flex: 1,
    resizeMode: 'cover',
  },
  previewTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  previewBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  retakeText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '600',
  },
  transformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
  },
  transformText: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '700',
  },
});
