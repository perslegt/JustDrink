import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/RootNavigator";
import COLORS from "../theme/colors";

type Language = 'en' | 'nl';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const [language, setLanguage] = useState<Language>('nl');
    const [langOpen, setLangOpen] = useState(false);

    const languages: { label: string; value: Language }[] = [
      { label: "NL", value: "nl" },
      { label: "EN", value: "en" },
    ];

    const text = {
        play: language === 'nl' ? 'Spelen' : 'Play',
        selectPlayers: language === "nl" ? "Spelers selecteren" : "Select players",
    };

    return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setLangOpen(true)}
            style={({ pressed }) => [
              styles.languagePill,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.languageText}>
              {language.toUpperCase()}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </Pressable>

          <Modal
            visible={langOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setLangOpen(false)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)}>
              <View style={styles.dropdown}>
                {languages.map((l) => (
                  <Pressable
                    key={l.value}
                    onPress={() => {
                      setLanguage(l.value);
                      setLangOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { opacity: 0.8 },
                      language === l.value && styles.dropdownItemActive,
                    ]}
                  >
                    <Text style={styles.dropdownItemText}>{l.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        </View>

      </View>

      {/* Center content */}
      <View style={styles.center}>
        <View style={styles.logoContainer}>
          <Image
              source={require("./../assets/images/justdrink-logo.png")}
              style={styles.logo}
              resizeMode="contain"
          />
        </View>

        <Pressable style={styles.playButton} onPress={() => {}}>
          <Text style={styles.playText}>{text.play}</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate("PlayerSelect")}>
          <Text style={styles.linkText}>{text.selectPlayers}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    position: "absolute",
    top: 20,
    right: 0,
    paddingTop: 6,
    paddingRight: 12,
    zIndex: 50,
    elevation: 50,
  },


  languagePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
    overflow: "hidden",
  },

  languageText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },

  chevron: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 14,
    opacity: 0.9,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 12,
  },

  dropdown: {
    width: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  dropdownItemActive: {
    backgroundColor: "rgba(255,159,28,0.12)",
  },

  dropdownItemText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
  },

  logo: {
    width: 400,
    height: 200,
  },

  playButton: {
    width: "80%",
    maxWidth: 320,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.orangeSoft,
    borderColor: COLORS.orangeSoft,
    borderWidth: 2,
    overflow: "hidden", 
  },
  playText: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "700" },

  linkButton: { paddingVertical: 8 },
  linkText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "500" },
});