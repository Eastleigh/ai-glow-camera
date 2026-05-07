import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT } from '../constants/theme';
import type { TransformStyle } from '../constants/transforms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

interface TransformCardProps {
  style: TransformStyle;
  onPress: () => void;
  locked?: boolean;
}

export function TransformCard({ style, onPress, locked = false }: TransformCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <LinearGradient
        colors={[style.previewGradient[0], style.previewGradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {locked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color={COLORS.white} />
          </View>
        )}
        <Text style={styles.icon}>{style.icon}</Text>
        <Text style={styles.name}>{style.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {style.description}
        </Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
          <Text style={styles.time}>~{style.estimatedTime}s</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: SPACING.md,
  },
  gradient: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    height: 160,
    justifyContent: 'flex-end',
  },
  lockBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: RADIUS.full,
    padding: 6,
  },
  icon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  name: {
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.sizes.xs,
    lineHeight: 14,
    marginBottom: SPACING.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT.sizes.xs,
  },
});
