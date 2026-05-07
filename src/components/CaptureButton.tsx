import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}

export function CaptureButton({ onPress, disabled = false, size = 80 }: CaptureButtonProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size + 12,
            height: size + 12,
            borderRadius: (size + 12) / 2,
            transform: [{ scale }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.innerButton,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerButton: {
    backgroundColor: COLORS.white,
  },
});
