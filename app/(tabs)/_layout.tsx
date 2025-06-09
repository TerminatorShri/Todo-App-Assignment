import { useColorScheme } from "@/hooks/useColorScheme";
import { TaskAdd01Icon, TaskDaily01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Tabs } from "expo-router";

export default function TaskTabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? colors.activeDark : colors.activeLight,
        tabBarInactiveTintColor: isDark
          ? colors.inactiveDark
          : colors.inactiveLight,
        tabBarStyle: {
          backgroundColor: isDark
            ? colors.backgroundDark
            : colors.backgroundLight,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(pending)"
        options={{
          title: "Pending",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={TaskAdd01Icon}
              size={focused ? 26 : 24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="completed"
        options={{
          title: "Completed",
          tabBarIcon: ({ color, focused }) => (
            <HugeiconsIcon
              icon={TaskDaily01Icon}
              size={focused ? 26 : 24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
