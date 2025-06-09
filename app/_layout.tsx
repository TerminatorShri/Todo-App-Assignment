import { useColorScheme } from "@/hooks/useColorScheme";
import { Setting07Icon, StickyNote01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const pathname = usePathname();

  if (!loaded) return null;

  const colors = {
    // Active tab colors
    activeLight: "#059669", // Green-600
    activeDark: "#10b981", // Green-500

    // Inactive tab colors
    inactiveLight: "#9ca3af", // Gray-400
    inactiveDark: "#6b7280", // Gray-500

    // Background colors
    backgroundLight: "#ffffff",
    backgroundDark: "#0f0f0f",

    // Border/separator colors
    borderLight: "#f3f4f6", // Gray-100
    borderDark: "#1f2937", // Gray-800
  };

  const isDark = colorScheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={
          isDark ? colors.backgroundDark : colors.backgroundLight
        }
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark
              ? colors.backgroundDark
              : colors.backgroundLight,
          },
          headerShadowVisible: false,
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <HugeiconsIcon
                icon={StickyNote01Icon}
                name="tasks"
                size={24}
                color={isDark ? colors.activeDark : colors.activeLight}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? colors.activeDark : colors.activeLight },
                ]}
              >
                My Tasks
              </Text>
            </View>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                if (pathname !== "/settings") {
                  router.push("/settings");
                }
              }}
              style={styles.settingsButton}
            >
              <HugeiconsIcon
                icon={Setting07Icon}
                name="settings-outline"
                size={24}
                color={isDark ? colors.activeLight : colors.activeDark}
                strokeWidth={1.8}
              />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
});
