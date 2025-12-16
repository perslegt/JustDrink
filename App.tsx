import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { PlayersProvider } from "./src/state/PlayersContext";

export default function App() {
  return (
    <PlayersProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PlayersProvider>
    );
}