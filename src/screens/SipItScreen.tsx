import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import RulesInfo from "../components/RulesInfo";
import TopBar from "../components/TopBar";
import { createSipItState, nextPrompt, type GeneratedPrompt, type SipItState } from "../games/sipit/engine";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import { usePlayers } from "../state/PlayersContext";
import COLORS from "../theme/colors";

const BG_BY_CATEGORY: Record<string, string> = {
  normal: COLORS.background,
  duo: COLORS.background,
  challenge: "rgba(63, 36, 17, 1)",
  vote: "rgba(52, 24, 4, 1)",
  quiz: "rgba(52, 24, 4, 1)",
  chain: "rgba(52, 24, 4, 1)",
  rule: "rgba(14, 109, 7, 1)",
  buddies_on: "rgba(15, 28, 165, 1)",
  buddies_off: "rgba(15, 28, 165, 1)",
};

export default function SipItScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      <View style={styles.topBarOverlay}>
        <TopBar onBack={() => navigation.goBack()} right={<RulesInfo rules={prompt.activeRules} />} />
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
  topBarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
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
    fontSize: 26,
    textAlign: "center",
    lineHeight: 32,
  },

  hint: {
    marginTop: 18,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },
});
