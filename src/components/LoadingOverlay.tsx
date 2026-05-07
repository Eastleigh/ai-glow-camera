import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONT, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
}

export function LoadingOverlay({ message = 'Generating...', progress }: LoadingOverlayProps) {
  const pulse = useRef(new Animated.Value(0.3)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} style={styles.blur} tint="dark">
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <View style={styles.spinnerDot} />
        </Animated.View>

        <Animated.Text style={[styles.emoji, { opacity: pulse }]}>✨</Animated.Text>

        <Text style={styles.message}>{message}</Text>

        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        <Text style={styles.tip}>AI magic in progress...</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  blur: {
    width: width * 0.75,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.primary + '30',
    borderTopColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  spinnerDot: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emoji: {
    fontSize: 40,
    marginBottom: SPACING.md,
  },
  message: {
    color: COLORS.white,
    fontSize: FONT.sizes.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
    marginTop: SPACING.xs,
  },
  tip: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.sm,
    marginTop: SPACING.md,
  },
});
