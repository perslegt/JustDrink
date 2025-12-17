import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import COLORS from "../theme/colors";

export default function GamesOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useT();

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.backText}>← {t("common.back")}</Text>
        </Pressable>
      </View>

      {/* Games */}
      <View style={styles.content}>
        <Pressable
          onPress={() => navigation.navigate("SipIt")}
          style={({ pressed }) => [styles.gameCard, pressed && { opacity: 0.8 }]}
        >
          <Text style={styles.gameTitle}>SipIt</Text>

          <View style={styles.playersBadge}>
            <Ionicons name="people" size={18} color={COLORS.textPrimary} />
            <Text style={styles.playersText}>2+</Text>
          </View>
        </Pressable>

        <View style={[styles.gameCard, styles.gameCardDisabled]}>
          <Text style={styles.disabledText}>{t("games.moreComingSoon")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    paddingTop: 46,
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },
  backText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },

  gameCard: {
    height: 120,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
    padding: 16,
    justifyContent: "space-between",
  },

  gameTitle: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 34,
    letterSpacing: 0.5,
  },

  playersBadge: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },
  playersText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 14 },

  gameCardDisabled: {
    opacity: 0.45,
    borderStyle: "dashed",
  },
  disabledText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});
