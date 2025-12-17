import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { LanguageProvider } from "./src/state/LanguageContext";
import { PlayersProvider } from "./src/state/PlayersContext";

export default function App() {
  return (
    <LanguageProvider>
      <PlayersProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PlayersProvider>
    </LanguageProvider>
  );
}
