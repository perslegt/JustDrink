import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PlayerSelectScreen from "../screens/PlayerSelectScreen";

export type RootStackParamList = {
  Home: undefined;
  PlayerSelect: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PlayerSelect" component={PlayerSelectScreen} />
    </Stack.Navigator>
  );
}