import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import COLORS from "../theme/colors";

export default function Screen({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.root, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
});
