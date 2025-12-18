import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LanguageDropdown from "../components/LanguageDropdown";
import TopBar from "../components/TopBar";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import COLORS from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
    const { t } = useT();

    return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar */}
      <TopBar right={<LanguageDropdown />} />

      {/* Center content */}
      <View style={styles.center}>
        <View style={styles.logoContainer}>
          <Image
              source={require("./../assets/images/justdrink-logo.png")}
              style={styles.logo}
              resizeMode="contain"
          />
        </View>

        <Pressable style={styles.playButton} onPress={() => navigation.navigate("GamesOverview")}>
          <Text style={styles.playText}>{t("home.play")}</Text>
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate("PlayerSelect")}>
          <Text style={styles.linkText}>{t("home.selectPlayers")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

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