import { ThemedView } from "@/components/ThemedView";
import { removeTask } from "@/contexts/taskSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { Task } from "@/types/types";
import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { format } from "date-fns";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  useColorScheme,
} from "react-native";

export default function PendingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();

  const pendingTasks = useAppSelector((state) =>
    state.tasks.tasks.filter((t) => !t.isCompleted)
  );

  const themeColors = {
    background: isDark ? "#0f0f0f" : "#ffffff",
    surface: isDark ? "#1a1a1a" : "#f8f9fa",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    primary: isDark ? "#10b981" : "#059669",
  };

  const priorityColors = {
    low: isDark ? "#10b981" : "#059669",
    medium: isDark ? "#f59e0b" : "#d97706",
    high: isDark ? "#ef4444" : "#dc2626",
  };

  const onDeleteTask = (taskId: string) => {
    dispatch(removeTask(taskId));
    ToastAndroid.showWithGravity(
      "Task deleted successfully",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  };

  const onUpdateTask = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <Pressable
      onPress={() => {
        onUpdateTask(item);
      }}
    >
      <View
        style={[
          styles.taskCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        {/* Priority indicator bar */}
        <View
          style={[
            styles.priorityBar,
            { backgroundColor: priorityColors[item.priority] },
          ]}
        />

        <View style={styles.cardContent}>
          {/* Header with checkbox and actions */}
          <View
            style={[
              styles.cardHeader,
              {
                marginBottom: item.desc.length > 40 ? 8 : 4,
              },
            ]}
          >
            <Checkbox
              value={item.isCompleted}
              onValueChange={() => onDeleteTask(item.id)}
              color={themeColors.primary}
              style={styles.checkbox}
            />

            {/* Task description */}
            <Text style={[styles.taskDescription, { color: themeColors.text }]}>
              {item.desc}
            </Text>

            <View style={styles.actionButtons}>
              <Pressable
                onPress={() => dispatch(removeTask(item.id))}
                style={[
                  styles.actionButton,
                  { backgroundColor: isDark ? "#2d1b1b" : "#fee2e2" },
                ]}
              >
                <HugeiconsIcon icon={Delete01Icon} size={16} color="#ef4444" />
              </Pressable>
            </View>
          </View>

          {/* Footer with priority and date */}
          <View style={styles.cardFooter}>
            <View style={styles.priorityBadge}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColors[item.priority] },
                ]}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: priorityColors[item.priority] },
                ]}
              >
                {item.priority.toUpperCase()}
              </Text>
            </View>

            <Text
              style={[styles.dateText, { color: themeColors.textSecondary }]}
            >
              {format(new Date(item.date), "MMM d, h:mm a")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        style={[styles.emptyStateText, { color: themeColors.textSecondary }]}
      >
        No Pending Tasks Right Now
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}
      >
        Tap + Button to Create a New Task
      </Text>
    </View>
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          Pending Tasks
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}
        >
          {pendingTasks.length} {pendingTasks.length === 1 ? "task" : "tasks"}{" "}
          remaining
        </Text>
      </View>

      {/* Task list */}
      <FlatList
        data={pendingTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          pendingTasks.length === 0 && styles.listContainerEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push("/tasks/new")}
        style={({ pressed }) => [
          styles.fab,
          {
            opacity: pressed ? 0.8 : 1,
            backgroundColor: themeColors.primary,
            shadowColor: isDark ? "#000000" : "#374151",
          },
        ]}
      >
        <HugeiconsIcon
          icon={Add01Icon}
          size={24}
          color={isDark ? "#1a1a1a" : "#ffffff"}
          strokeWidth={2.5}
        />
      </Pressable>
    </ThemedView>
  );
}

export const screenOptions = {
  title: "Pending",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16,
  },
  listContainerEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  taskCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  priorityBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  taskDescription: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 0,
    flexWrap: "wrap",
  },

  checkbox: {
    transform: [{ scale: 1.1 }],
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyStateSubtext: {
    fontSize: 15,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
