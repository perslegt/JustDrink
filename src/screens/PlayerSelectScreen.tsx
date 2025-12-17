import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useT } from "../state/LanguageContext";
import { usePlayers } from "../state/PlayersContext";
import COLORS from "../theme/colors";


export default function PlayerSelectScreen() {
  const { players, addPlayer, removePlayer } = usePlayers();
  const [name, setName] = useState("");

  const data = useMemo(() => players, [players]);

  const { t } = useT();

  const onAdd = () => {
    addPlayer(name);
    setName("");
  };

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const insets = useSafeAreaInsets();


  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={styles.backText}>{t("common.back")}</Text>
          </Pressable>
        </View>

        {/* Lijst */}
        <FlatList
          style={{ flex: 1, backgroundColor: COLORS.background }}
          contentContainerStyle={styles.listContent}
          data={data}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Pressable
                onLongPress={() => removePlayer(item.id)}//TODO: Double tap to remove
                style={styles.nameWrap}
              >
                <Text style={styles.nameText}>{item.name}</Text>
              </Pressable>

              <Pressable onPress={() => removePlayer(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          )}
        />

        {/* Input bar onderaan */}
        <View style={[styles.bottomBar]}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("players.addPlaceholder")}
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.input}
            onSubmitEditing={onAdd}
            returnKeyType="done"
          />
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.plusBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.plusText}>＋</Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    paddingLeft: 12,
    paddingBottom: 10,
    zIndex: 50,
    width: "100%",
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 70,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.orangeSoft,
  },

  backText: {
    color: COLORS.textPrimary,
    fontWeight: "700",
    fontSize: 18,
  },

  listContent: {
    paddingTop: 60, // ruimte voor je topbar, later netter
    paddingHorizontal: 16,
    paddingBottom: 10, // ruimte voor bottom bar
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },

  nameWrap: { flex: 1, paddingVertical: 4 },
  nameText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },

  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 16 },

  bottomBar: {
    marginHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    backgroundColor: COLORS.background,
  },

  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: COLORS.textPrimary,
    fontWeight: "700",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
  },

  plusBtn: {
    width: 56,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.orangeSoft,
    shadowColor: COLORS.orangeSoft,
  },
  plusText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 22 },
});