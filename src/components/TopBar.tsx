import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../state/LanguageContext";
import COLORS from "../theme/colors";

type Props = {
  onBack?: () => void;
  right?: React.ReactNode;
  title?: string;
};

export default function TopBar({ onBack, right, title }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useT();

  return (
    <View style={[styles.safeWrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.backText}>← {t("common.back")}</Text>
            </Pressable>
          ) : (
            <View style={styles.leftSpacer} />
          )}

          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>

        <View style={styles.right}>
          {right}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // only safe area + background
  safeWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },

  // fixed-height alignment row (this is the key)
  row: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  leftSpacer: {
    width: 1,
    height: 44, // keeps left side same height as if a back button exists
  },

  backBtn: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },

  backText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },
  title: { color: COLORS.textPrimary, fontWeight: "800", fontSize: 18 },
});
