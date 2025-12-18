import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import GameCard from "../components/GameCard";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import COLORS from "../theme/colors";

export default function GamesOverviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useT();

  return (
    <Screen>
      <TopBar onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* SipIt */}
        <GameCard onPress={() => navigation.navigate("SipIt")}>
          <View style={styles.cardContent}>
            <Text style={styles.title}>SipIt</Text>

            <View style={styles.players}>
              <Ionicons name="people" size={18} color={COLORS.textPrimary} />
              <Text style={styles.playersText}>2+</Text>
            </View>
          </View>
        </GameCard>

        {/* Coming soon */}
        <GameCard disabled>
          <View style={styles.cardContent}>
            <Text style={styles.comingSoonText}>{t("games.moreComingSoon")}</Text>
          </View>
        </GameCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },

  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },

  title: {
    color: COLORS.textPrimary,
    fontWeight: "900",
    fontSize: 34,
    letterSpacing: 0.4,
  },

  players: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    opacity: 0.9,
  },

  playersText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  comingSoonText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 18,
    opacity: 0.6,
  },
});
