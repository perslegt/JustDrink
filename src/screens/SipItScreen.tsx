import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createSipItState, nextPrompt, type GeneratedPrompt, type SipItState } from "../games/sipit/engine";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import { usePlayers } from "../state/PlayersContext";
import COLORS from "../theme/colors";

const BG_BY_CATEGORY: Record<string, string> = {
  normal: COLORS.background,
  duo: "rgba(255,159,28,0.10)",
  challenge: "rgba(255,159,28,0.14)",
  vote: "rgba(160,90,255,0.14)",
  quiz: "rgba(0,140,255,0.14)",
  chain: "rgba(255,220,0,0.12)",
  rule_on: "rgba(255,60,60,0.14)",
  rule_off: "rgba(0,200,120,0.14)",
  buddies_on: "rgba(0,140,255,0.14)",
  buddies_off: "rgba(0,200,120,0.14)",
};

export default function SipItScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t, language } = useT();
  const { players } = usePlayers();

  const playerNames = useMemo(() => players.map((p) => p.name), [players]);
  const tooFewPlayers = playerNames.length < 2;

  // Engine state (mutable object)
  const [engineState] = useState<SipItState>(() => createSipItState(playerNames));

  // Sync players into engine if list changes
  useEffect(() => {
    engineState.players = [...playerNames];
  }, [playerNames, engineState]);

  // Current prompt
  const [prompt, setPrompt] = useState<GeneratedPrompt>(() => nextPrompt(engineState, language));

  // If language changes, regenerate prompt in that language (same state)
  useEffect(() => {
    setPrompt(nextPrompt(engineState, language));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Lock landscape while on this screen
  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    })();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const bg = BG_BY_CATEGORY[prompt.category] ?? COLORS.background;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Topbar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.backText}>← {t("common.back")}</Text>
        </Pressable>
      </View>

      {/* Tap area */}
      <Pressable
        style={styles.tapArea}
        onPress={() => {
          if (tooFewPlayers) return;
          setPrompt(nextPrompt(engineState, language));
        }}
      >
        <Text style={styles.promptText}>
          {tooFewPlayers ? t("sipit.needPlayers") : prompt.text}
        </Text>

        {!tooFewPlayers && (
          <Text style={styles.hint}>{t("sipit.tapNext")}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 50,
    elevation: 50,
    paddingLeft: 12,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  backText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  tapArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  promptText: {
    color: COLORS.textPrimary,
    fontWeight: "800",
    fontSize: 34,
    textAlign: "center",
    lineHeight: 40,
  },

  hint: {
    marginTop: 18,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },
});
