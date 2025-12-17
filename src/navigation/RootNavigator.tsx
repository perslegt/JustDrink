import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GamesOverviewScreen from "../screens/GamesOverviewScreen";
import HomeScreen from "../screens/HomeScreen";
import PlayerSelectScreen from "../screens/PlayerSelectScreen";
import SipItScreen from "../screens/SipItScreen";

export type RootStackParamList = {
  Home: undefined;
  PlayerSelect: undefined;
  GamesOverview: undefined;
  SipIt: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PlayerSelect" component={PlayerSelectScreen} />
      <Stack.Screen name="GamesOverview" component={GamesOverviewScreen} />
      <Stack.Screen name="SipIt" component={SipItScreen} />
    </Stack.Navigator>
  );
}