import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function PendingScreen() {
  return (
    <ThemedView>
      <ThemedText>Pending Tasks</ThemedText>
    </ThemedView>
  );
}

export const screenOptions = {
  title: "Pending", // or "Completed" for completed.tsx
};
