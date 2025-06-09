import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, useColorScheme } from "react-native";

export default function PendingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText>Pending Tasks</ThemedText>

      <Pressable
        onPress={() => {
          router.push("/tasks/new");
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            opacity: pressed ? 0.7 : 1,
            backgroundColor: colorScheme === "dark" ? "#fff" : "#000",
            shadowColor: colorScheme === "dark" ? "#fff" : "#000",
          },
        ]}
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={28}
          color={colorScheme === "dark" ? "#1a1a1a" : "#fff"}
          strokeWidth={2}
        />
      </Pressable>
    </ThemedView>
  );
}

export const screenOptions = {
  title: "Pending",
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
