import { Stack } from "expo-router";
import { useWindowDimensions } from "react-native";

const Layout = () => {
  const { height } = useWindowDimensions();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#fff" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="tasks/new"
        options={{
          title: "New Task",
          presentation: "formSheet",
          sheetAllowedDetents: height > 700 ? [0.6] : "fitToContents",
          sheetGrabberVisible: true,
          sheetCornerRadius: 10,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="tasks/[id]"
        options={{
          title: "Task Details",
          presentation: "formSheet",
          sheetAllowedDetents: height > 700 ? [0.5] : "fitToContents",
          sheetGrabberVisible: true,
          sheetCornerRadius: 10,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
    </Stack>
  );
};
export default Layout;
