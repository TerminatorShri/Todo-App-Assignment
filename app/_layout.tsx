import { store } from "@/constants/Store";
import { addTask, clearTasks } from "@/contexts/taskSlice";
import { loadTasksFromDb } from "@/db/handleTasks";
import { checkDatabaseHealth, initializeDatabase } from "@/db/initDb";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAppDispatch } from "@/hooks/useStore";
import { Task } from "@/types/types";
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
import { SQLiteProvider } from "expo-sqlite";
import React, { Suspense, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LogBox,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

// Suppress expo-notifications warnings for local notifications
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported in Expo Go",
  "We recommend you instead use a development build",
]);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

// Separate component that uses Redux hooks
function AppContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

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

  // Handle notification permissions
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Notifications",
            "Please enable notifications to receive reminders."
          );
        }
      } catch (err) {
        console.error("Failed to request notification permissions:", err);
      }
    };

    getPermissions();
  }, []);

  // Initialize database and load tasks - run only once
  useEffect(() => {
    let isMounted = true;

    const setupDatabase = async () => {
      try {
        console.log("Setting up database...");
        setDbError(null);

        // Initialize database (create table if not exists)
        await initializeDatabase();

        // Check database health
        const isHealthy = await checkDatabaseHealth();
        if (!isHealthy) {
          throw new Error("Database health check failed");
        }

        // Load existing tasks
        console.log("Loading tasks from database...");
        const tasks = await loadTasksFromDb();
        console.log(`Loaded ${tasks.length} tasks from database`);

        // Add tasks to Redux store only if component is still mounted
        if (isMounted) {
          dispatch(clearTasks()); // Clear existing tasks in store
          tasks.forEach((task) => {
            const tempTask: Task = {
              id: task.id,
              desc: task.description,
              date: task.date,
              priority: task.priority,
              isCompleted: task.isCompleted,
              notificationId: task.notificationId,
              notificationMinutesBefore:
                task.notificationMinutesBefore ?? undefined,
            };
            dispatch(addTask(tempTask));
          });

          setIsDbReady(true);
          console.log("Database setup completed successfully");
        }
      } catch (err) {
        console.error("Database setup failed:", err);

        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          setDbError(errorMessage);

          Alert.alert(
            "Database Setup Error",
            `Failed to initialize the database: ${errorMessage}`,
            [
              {
                text: "Retry",
                onPress: () => {
                  setIsDbReady(false);
                  setDbError(null);
                },
              },
              {
                text: "OK",
                style: "cancel",
              },
            ]
          );
        }
      }
    };

    if (!isDbReady && !dbError) {
      setupDatabase();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [dispatch, isDbReady, dbError]);

  // Show loading indicator while database is setting up
  if (!isDbReady && !dbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          size="large"
          color={isDark ? colors.activeDark : colors.activeLight}
        />
        <Text
          style={{
            marginTop: 16,
            color: isDark ? "#ffffff" : "#000000",
            fontSize: 16,
          }}
        >
          Setting up database...
        </Text>
      </View>
    );
  }

  // Show error state if database setup failed
  if (dbError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: "#ef4444",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Database Setup Failed
        </Text>
        <Text
          style={{
            color: isDark ? "#ffffff" : "#000000",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          {dbError}
        </Text>
        <Pressable
          onPress={() => {
            setDbError(null);
            setIsDbReady(false);
          }}
          style={{
            backgroundColor: isDark ? colors.activeDark : colors.activeLight,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                    {
                      color: isDark ? colors.activeDark : colors.activeLight,
                    },
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
    </GestureHandlerRootView>
  );
}

// Main RootLayout component
export default function RootLayout() {
  return (
    <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
      <SQLiteProvider databaseName="todos.db">
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SQLiteProvider>
    </Suspense>
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
