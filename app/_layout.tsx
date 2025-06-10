import { store } from "@/constants/Store";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  InformationCircleIcon,
  StickyNote01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();

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

  const [fontsLoaded] = useFonts({
    NovaSquare_Regular: require("@/assets/fonts/NovaSquare-Regular.ttf"),
  });

  const isDark = colorScheme === "dark";

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable notifications to receive reminders.");
      }
    };

    getPermissions();
  }, []);

  return (
    <Provider store={store}>
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
                  if (pathname !== "/info") {
                    router.push("/info");
                  }
                }}
                style={styles.settingsButton}
              >
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  size={24}
                  color={isDark ? colors.activeLight : colors.activeDark}
                  strokeWidth={1.8}
                />
              </Pressable>
            ),
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
          <Stack.Screen
            name="info"
            options={{
              headerShown: true,
              headerTitle: "",
              title: "App Info",
              headerTintColor: isDark ? colors.activeDark : colors.activeLight,
            }}
          />
        </Stack>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "NovaSquare_Regular",
    letterSpacing: 0.1,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
});
