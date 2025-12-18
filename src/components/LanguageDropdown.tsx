import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "../state/LanguageContext";
import COLORS from "../theme/colors";

export default function LanguageDropdown() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Pill */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.pill,
          pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Text style={styles.pillText}>{language.toUpperCase()}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {/* Dropdown */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <LangItem
              label="NL"
              active={language === "nl"}
              onPress={() => {
                setLanguage("nl");
                setOpen(false);
              }}
            />
            <LangItem
              label="EN"
              active={language === "en"}
              onPress={() => {
                setLanguage("en");
                setOpen(false);
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

function LangItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.itemText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },

  pillText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  chevron: {
    color: COLORS.textPrimary,
    fontSize: 14,
    marginTop: 2,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 12,
  },

  dropdown: {
    width: 80,
    marginTop: 15,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
    overflow: "hidden",
  },

  item: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  itemActive: {
    backgroundColor: COLORS.orangeSoft,
  },

  itemText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
  },
});
