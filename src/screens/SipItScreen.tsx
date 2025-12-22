import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AiPromptQueue } from "../api/promptQueue";
import { aiPromptId, aiPromptToText, type AiCategory, type AiPrompt } from "../api/sipitAi";
import RulesInfo from "../components/RulesInfo";
import TopBar from "../components/TopBar";

import { createSipItState, nextPrompt, type GeneratedPrompt, type SipItState } from "../games/sipit/engine";
import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import { usePlayers } from "../state/PlayersContext";
import COLORS from "../theme/colors";

type PromptFeedback = {
  upvotes: number;
  downvoted: boolean;
};

const FEEDBACK_KEY = "sipit_prompt_feedback_v1";

// Backgrounds by category
const BG_BY_CATEGORY: Record<string, string> = {
  normal: COLORS.background,
  duo: COLORS.background,
  multi: COLORS.background,
  challenge: "rgba(63, 36, 17, 1)",
  vote: "rgba(52, 24, 4, 1)",
  quiz: "rgba(52, 24, 4, 1)",
  chain: "rgba(52, 24, 4, 1)",
  rule: "rgba(52, 24, 4, 1)",
  rule_on: "rgba(52, 24, 4, 1)",
  rule_off: "rgba(52, 24, 4, 1)",
  buddies_on: "rgba(52, 24, 4, 1)",
  buddies_off: "rgba(52, 24, 4, 1)",
};

async function loadFeedbackMap(): Promise<Record<string, PromptFeedback>> {
  try {
    const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function saveFeedbackMap(map: Record<string, PromptFeedback>) {
  try {
    await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function toAiCategory(engineCategory: string): AiCategory | null {
  if (engineCategory === "normal") return "normal";
  if (engineCategory === "duo") return "duo";
  if (engineCategory === "multi") return "multi";
  if (engineCategory === "challenge") return "challenge";
  if (engineCategory === "vote") return "vote";
  if (engineCategory === "chain") return "chain";
  if (engineCategory.startsWith("rule")) return "rule";
  if (engineCategory.startsWith("buddies")) return null;
  if (engineCategory === "quiz") return null;
  return null;
}

export default function SipItScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { t, language } = useT();
  const { players } = usePlayers();

  const playerNames = useMemo(() => players.map((p) => p.name), [players]);
  const playerCount = playerNames.length;
  const tooFewPlayers = playerCount < 2;

  // Engine state (mutable object)
  const [engineState] = useState<SipItState>(() => createSipItState(playerNames));

  // Sync players into engine if list changes
  useEffect(() => {
    engineState.players = [...playerNames];
  }, [playerNames, engineState]);

  // Per-category AI queue
  const queueRef = useRef(new AiPromptQueue(2, 3));

  // Warm (optional): keep a few categories filled
  useEffect(() => {
    queueRef.current.warm(playerCount, ["normal", "duo", "multi"]).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerCount]);

  // Feedback cache
  const feedbackRef = useRef<Record<string, PromptFeedback>>({});
  useEffect(() => {
    (async () => {
      feedbackRef.current = await loadFeedbackMap();
    })();
  }, []);

  // What we show + optional current AI prompt
  const [prompt, setPrompt] = useState<GeneratedPrompt>(() => nextPrompt(engineState, language));
  const [currentAi, setCurrentAi] = useState<AiPrompt | null>(null);

  // If language changes: if AI prompt is showing, just swap language; else use engine
  useEffect(() => {
    if (currentAi) {
      setPrompt((prev) => ({
        ...prev,
        text: aiPromptToText(currentAi, language),
      }));
      return;
    }
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

  const goNext = async () => {
    if (tooFewPlayers) return;

    // 1) Let engine decide next (weights, rules, buddies, etc.)
    const engineNext = nextPrompt(engineState, language);

    // 2) If AI category -> pull from per-category queue
    const aiCat = toAiCategory(engineNext.category);

    if (aiCat) {
      try {
        const ai = await queueRef.current.get(aiCat, playerCount);

        if (ai) {
          // extra safety: skip downvoted (queue should already filter)
          const id = aiPromptId(ai);
          if (feedbackRef.current[id]?.downvoted) {
            setCurrentAi(null);
            setPrompt(engineNext);
            return;
          }

          setCurrentAi(ai);
          setPrompt({
            text: aiPromptToText(ai, language),
            category: ai.category as any,
            activeRules: engineNext.activeRules ?? [],
          });
          return;
        }
      } catch {
        // ignore and fall back to engine
      }
    }

    // 3) Fallback: show engine prompt
    setCurrentAi(null);
    setPrompt(engineNext);
  };

  const voteUp = async () => {
    if (!currentAi) return;

    const id = aiPromptId(currentAi);
    const current = feedbackRef.current[id] ?? { upvotes: 0, downvoted: false };
    const updated: PromptFeedback = { ...current, upvotes: current.upvotes + 1, downvoted: false };

    feedbackRef.current = { ...feedbackRef.current, [id]: updated };
    await saveFeedbackMap(feedbackRef.current);

    goNext();
  };

  const voteDown = async () => {
    if (!currentAi) return;

    const id = aiPromptId(currentAi);
    const current = feedbackRef.current[id] ?? { upvotes: 0, downvoted: false };
    const updated: PromptFeedback = { ...current, downvoted: true };

    feedbackRef.current = { ...feedbackRef.current, [id]: updated };
    await saveFeedbackMap(feedbackRef.current);

    // also purge current category queue to avoid re-showing quickly (optional)
    queueRef.current.clear(currentAi.category);

    goNext();
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TopBar onBack={() => navigation.goBack()} right={<RulesInfo rules={prompt.activeRules ?? []} />} />

      <Pressable style={styles.tapArea} onPress={goNext}>
        <Text style={styles.promptText}>
          {tooFewPlayers ? t("sipit.needPlayers") : prompt.text}
        </Text>

        {!tooFewPlayers && <Text style={styles.hint}>{t("sipit.tapNext")}</Text>}
      </Pressable>

      {/* 👍👎 bottom-left (only meaningful for AI prompts) */}
      <View style={[styles.thumbsContainer, { bottom: 16 + insets.bottom }]}>
        <Pressable
          onPress={voteUp}
          style={({ pressed }) => [
            styles.thumbBtn,
            !currentAi && styles.thumbBtnDisabled,
            pressed && currentAi && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.thumbText, !currentAi && styles.thumbTextDisabled]}>👍</Text>
        </Pressable>

        <Pressable
          onPress={voteDown}
          style={({ pressed }) => [
            styles.thumbBtn,
            !currentAi && styles.thumbBtnDisabled,
            pressed && currentAi && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.thumbText, !currentAi && styles.thumbTextDisabled]}>👎</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    lineHeight: 40,
  },

  hint: {
    marginTop: 18,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
    fontSize: 14,
  },

  thumbsContainer: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    gap: 10,
  },

  thumbBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: "rgba(13,17,23,0.9)",
  },

  thumbBtnDisabled: {
    opacity: 0.35,
  },

  thumbText: {
    fontSize: 18,
  },

  thumbTextDisabled: {},
});
