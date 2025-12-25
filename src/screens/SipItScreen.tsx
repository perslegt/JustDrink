import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import RulesInfo from "../components/RulesInfo";
import TopBar from "../components/TopBar";

import { AiPromptQueue } from "../ai/promptQueue";
import { aiPromptId, aiPromptToText, type AiCategory, type AiPrompt } from "../ai/sipitAi";

import {
  addActiveRule,
  createSipItState,
  nextPrompt,
  type GeneratedPrompt,
  type SipItState,
} from "../games/sipit/engine";

import type { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import { usePlayers } from "../state/PlayersContext";
import COLORS from "../theme/colors";

import { fillPlaceholders } from "../utils/fillPlaceholders";

type PromptFeedback = {
  upvotes: number;
  downvoted: boolean;
};

const FEEDBACK_KEY = "sipit_prompt_feedback_v1";

const LOADING_TEXT: Record<"nl" | "en", string> = {
  nl: "Even laden… 🍻",
  en: "Loading… 🍻",
};

// Backgrounds by category
const BG_BY_CATEGORY: Record<string, string> = {
  normal: COLORS.background,
  duo: COLORS.background,
  multi: COLORS.background,
  challenge: "rgba(63, 36, 17, 1)",
  vote: "rgba(52, 24, 4, 1)",
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

function normalizeAiCategory(cat: AiCategory, playerCount: number): AiCategory {
  if (cat === "duo" && playerCount < 2) return "normal";
  if ((cat === "multi" || cat === "vote" || cat === "chain") && playerCount < 3) return "normal";
  return cat;
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

  // ✅ Bigger per-category AI queue for snappier taps
  const queueRef = useRef(new AiPromptQueue(4, 6));

  const prefetchNext = (pc: number) => {
    // Fill likely categories in background
    queueRef.current
      .warm(pc, ["normal", "duo", "multi", "challenge", "vote", "chain", "rule"])
      .catch(() => {});
  };

  // Warm queues on playerCount change
  useEffect(() => {
    prefetchNext(playerCount);
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

  // If language changes: if AI prompt is showing, swap language + refill placeholders
  useEffect(() => {
    if (currentAi) {
      const txt = fillPlaceholders(aiPromptToText(currentAi, language), playerNames);
      setPrompt((prev) => ({
        ...prev,
        text: txt,
        activeRules: [...engineState.activeRules],
      }));
      return;
    }

    setPrompt(() => {
      const eng = nextPrompt(engineState, language);
      return { ...eng, activeRules: [...engineState.activeRules] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Lock landscape while on this screen (ignore web)
  useEffect(() => {
    (async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch {
        // web: ignore
      }
    })();

    return () => {
      try {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch {
        // ignore
      }
    };
  }, []);

  const bg = BG_BY_CATEGORY[prompt.category] ?? COLORS.background;

  const showAiPrompt = (ai: AiPrompt, activeRulesSnapshot: any[] = []) => {
    const id = aiPromptId(ai);
    if (feedbackRef.current[id]?.downvoted) return false;

    const finalText = fillPlaceholders(aiPromptToText(ai, language), playerNames);

    // If AI generated a rule, actually activate it in engine state (max 3)
    if (ai.category === "rule") {
      addActiveRule(engineState, finalText, 3);
    }

    setCurrentAi(ai);
    setPrompt({
      text: finalText,
      category: ai.category as any,
      activeRules: [...engineState.activeRules],
    });

    // keep queue warm in background
    prefetchNext(playerCount);
    return true;
  };

  const goNext = async () => {
    if (tooFewPlayers) return;

    // Engine decides the category (weights etc.)
    const engineNext = nextPrompt(engineState, language);

    let aiCat = toAiCategory(engineNext.category) ?? "normal";
    aiCat = normalizeAiCategory(aiCat, playerCount);

    // 1) Try instant from queue (snappy)
    try {
      const immediate = await queueRef.current.get(aiCat, playerCount);
      if (immediate) {
        const shown = showAiPrompt(immediate, engineNext.activeRules ?? []);
        if (shown) return;
      }
    } catch {
      // ignore
    }

    // 2) Queue empty -> show loading instantly
    setCurrentAi(null);
    setPrompt({
      text: LOADING_TEXT[language],
      category: "normal" as any,
      activeRules: [...engineState.activeRules],
    });

    // 3) Fetch in background and swap prompt when ready
    try {
      await queueRef.current.ensure(aiCat, playerCount);
      const later = await queueRef.current.get(aiCat, playerCount);
      if (later) {
        const shown = showAiPrompt(later, engineNext.activeRules ?? []);
        if (shown) return;
      }

      // still nothing -> fallback to engine prompt
      setCurrentAi(null);
      setPrompt({ ...engineNext, activeRules: [...engineState.activeRules] });
    } catch {
      // fallback to engine prompt
      setCurrentAi(null);
      setPrompt({ ...engineNext, activeRules: [...engineState.activeRules] });
    } finally {
      prefetchNext(playerCount);
    }
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

    // Purge this category queue so it won’t reappear quickly (optional)
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
