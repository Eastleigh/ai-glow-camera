import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT } from '../constants/theme';

interface CreditBadgeProps {
  credits: number;
  plan: string;
  onPress?: () => void;
}

export function CreditBadge({ credits, plan, onPress }: CreditBadgeProps) {
  const isPremium = plan !== 'free';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.container, isPremium && styles.premiumContainer]}>
        <Ionicons
          name={isPremium ? 'diamond' : 'flash'}
          size={14}
          color={isPremium ? COLORS.gold : COLORS.primary}
        />
        <Text style={[styles.text, isPremium && styles.premiumText]}>
          {credits}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  premiumContainer: {
    borderColor: COLORS.gold + '60',
    backgroundColor: COLORS.gold + '15',
  },
  text: {
    color: COLORS.primary,
    fontSize: FONT.sizes.sm,
    fontWeight: '700',
  },
  premiumText: {
    color: COLORS.gold,
  },
});
