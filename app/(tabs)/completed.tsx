import { ThemedView } from "@/components/ThemedView";
import { clearTasks } from "@/contexts/taskSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { Task } from "@/types/types";
import {
  Delete02Icon,
  FilterIcon,
  Flag02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { format } from "date-fns";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

type Priority = "low" | "medium" | "high" | "all";

export default function CompletedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const [selectedPriority, setSelectedPriority] = useState<Priority>("all");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const completedTasks = useAppSelector((state) =>
    state.tasks.tasks.filter((task) => task.isCompleted)
  );

  // Filter tasks based on selected priority
  const filteredTasks =
    selectedPriority === "all"
      ? completedTasks
      : completedTasks.filter((task) => task.priority === selectedPriority);

  const clearAllCompleted = () => {
    Alert.alert(
      "Clear All Completed Tasks",
      `Are you sure you want to permanently delete all ${completedTasks.length} completed tasks? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            dispatch(clearTasks());
          },
        },
      ]
    );
  };

  const themeColors = {
    background: isDark ? "#0f0f0f" : "#ffffff",
    surface: isDark ? "#1a1a1a" : "#f8f9fa",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    primary: isDark ? "#10b981" : "#059669",
    modalBackground: isDark ? "#000000aa" : "#000000aa",
    modalSurface: isDark ? "#1f1f1f" : "#ffffff",
  };

  const priorityColors = {
    low: isDark ? "#10b981" : "#059669",
    medium: isDark ? "#f59e0b" : "#d97706",
    high: isDark ? "#ef4444" : "#dc2626",
  };

  const priorityLabels = {
    all: "All Tasks",
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
  };

  const getPriorityCount = (priority: Priority) => {
    if (priority === "all") return completedTasks.length;
    return completedTasks.filter((task) => task.priority === priority).length;
  };

  const renderItem = ({ item }: { item: Task }) => (
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
        {/* Task description - with strikethrough for completed */}
        <Text
          style={[
            styles.taskDescription,
            {
              color: themeColors.textSecondary,
              textDecorationLine: "line-through",
              opacity: 0.7,
            },
          ]}
        >
          {item.desc}
        </Text>

        {/* Footer with priority and date */}
        <View style={styles.cardFooter}>
          <View style={styles.priorityBadge}>
            <HugeiconsIcon
              icon={Flag02Icon}
              size={20}
              color={priorityColors[item.priority]}
              strokeWidth={1.75}
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

          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {format(new Date(item.date), "MMM d, h:mm a")}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text
        style={[styles.emptyStateText, { color: themeColors.textSecondary }]}
      >
        {selectedPriority === "all"
          ? "No completed tasks"
          : `No completed ${selectedPriority} priority tasks`}
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}
      >
        {selectedPriority === "all"
          ? "Complete some tasks to see them here"
          : `Complete some ${selectedPriority} priority tasks to see them here`}
      </Text>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <Pressable
        style={[
          styles.modalOverlay,
          { backgroundColor: themeColors.modalBackground },
        ]}
        onPress={() => setShowFilterModal(false)}
      >
        <Pressable
          style={[
            styles.modalContent,
            { backgroundColor: themeColors.modalSurface },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              Filter by Priority
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              Choose which tasks to display
            </Text>
          </View>

          <ScrollView style={styles.filterOptions}>
            {(["all", "high", "medium", "low"] as Priority[]).map(
              (priority) => (
                <Pressable
                  key={priority}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor:
                        selectedPriority === priority
                          ? isDark
                            ? "#1f2937"
                            : "#f3f4f6"
                          : "transparent",
                      borderColor:
                        selectedPriority === priority
                          ? themeColors.primary
                          : themeColors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedPriority(priority);
                    setShowFilterModal(false);
                  }}
                >
                  <View style={styles.filterOptionContent}>
                    <View style={styles.filterOptionLeft}>
                      {priority !== "all" && (
                        <HugeiconsIcon
                          icon={Flag02Icon}
                          size={20}
                          color={priorityColors[priority]}
                          strokeWidth={1.75}
                        />
                      )}
                      <Text
                        style={[
                          styles.filterOptionText,
                          { color: themeColors.text },
                        ]}
                      >
                        {priorityLabels[priority]}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.countBadge,
                        { backgroundColor: themeColors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          { color: themeColors.textSecondary },
                        ]}
                      >
                        {getPriorityCount(priority)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )
            )}
          </ScrollView>

          <Pressable
            style={[
              styles.closeButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              Completed Tasks
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              {filteredTasks.length} of {completedTasks.length}{" "}
              {selectedPriority !== "all" && `${selectedPriority} priority `}
              {filteredTasks.length === 1 ? "task" : "tasks"} shown
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Filter Button */}
            <Pressable
              onPress={() => setShowFilterModal(true)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    selectedPriority !== "all"
                      ? themeColors.primary
                      : isDark
                      ? "#374151"
                      : "#e5e7eb",
                },
              ]}
            >
              <HugeiconsIcon
                icon={FilterIcon}
                size={16}
                color={
                  selectedPriority !== "all"
                    ? "#ffffff"
                    : themeColors.textSecondary
                }
              />
            </Pressable>

            {/* Clear All Button */}
            {completedTasks.length > 0 && (
              <Pressable
                onPress={clearAllCompleted}
                style={[
                  styles.clearButton,
                  { backgroundColor: isDark ? "#2d1b1b" : "#fee2e2" },
                ]}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} color="#ef4444" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContainer,
          filteredTasks.length === 0 && styles.listContainerEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      {renderFilterModal()}
    </ThemedView>
  );
}

export const screenOptions = {
  title: "Completed",
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  taskDescription: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 16,
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
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  filterOptions: {
    maxHeight: 300,
    marginBottom: 20,
  },
  filterOption: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  filterOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 24,
    alignItems: "center",
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
