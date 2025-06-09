import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CompletedScreen from "./completed";
import PendingScreen from "./pending";

const TopTabs = createMaterialTopTabNavigator();

export default function TaskTabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <TopTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: colorScheme === "dark" ? "#8E8E93" : "#6D6D70",
        tabBarIndicatorStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].tint,
          height: 3,
          borderRadius: 2,
        },
        tabBarLabelStyle: {
          textTransform: "capitalize",
          fontWeight: "600",
          fontSize: 16,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
          borderTopWidth: 0,
        },
        tabBarContentContainerStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <TopTabs.Screen name="pending" component={PendingScreen} />
      <TopTabs.Screen name="completed" component={CompletedScreen} />
    </TopTabs.Navigator>
  );
}
