import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { Pressable, StatusBar, Text, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  const isDark = colorScheme === "dark";
  const backgroundColor = isDark
    ? Colors.dark.background || "#000"
    : Colors.light.background || "#fff";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      <Stack
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor,
            borderBottomWidth: 0,
          },
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome5
                name="tasks"
                size={22}
                color={isDark ? "#fff" : "#1a1a1a"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: isDark ? "#fff" : "#1a1a1a",
                  letterSpacing: 0.5,
                }}
              >
                My Tasks
              </Text>
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.push("/settings")}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={isDark ? "#fff" : "#1a1a1a"}
              />
            </Pressable>
          ),
        })}
      >
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
      </Stack>
    </ThemeProvider>
  );
}
