import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import COLORS from "../theme/colors";

type Rule = { key: string; label: string; remainingTurns: number }; // ✅ key

export default function RulesInfo({ rules }: { rules: Rule[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="information-circle-outline" size={22} color={COLORS.textPrimary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.panel}>
            <Text style={styles.title}>Actieve regels</Text>

            {rules.length === 0 ? (
              <Text style={styles.empty}>Geen</Text>
            ) : (
              rules.map((r) => (
                <Text key={r.key} style={styles.ruleItem}> {/* ✅ r.key */}
                  • {r.label}
                </Text>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 12,
  },
  panel: {
    width: 260,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: "rgba(13,17,23,0.95)",
    padding: 12,
  },
  title: { color: COLORS.textPrimary, fontWeight: "800", marginBottom: 8 },
  empty: { color: COLORS.textPrimary, opacity: 0.6, fontWeight: "700" },
  ruleItem: { color: COLORS.textPrimary, fontWeight: "700", marginBottom: 6 },
});
