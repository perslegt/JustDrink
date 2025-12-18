import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import COLORS from "../theme/colors";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function GameCard({ children, onPress, disabled, style }: Props) {
  if (disabled) {
    return <View style={[styles.card, styles.disabled, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
    padding: 16,
  },
  disabled: {
    opacity: 0.45,
    borderStyle: "dashed",
  },
});
