import { ThemedView } from "@/components/ThemedView";
import { markAsCompleted, removeTask } from "@/contexts/taskSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { cancelNotification } from "@/services/notificationService";
import { Task } from "@/types/types";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar02Icon,
  Delete02Icon,
  FilterIcon,
  Flag02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { format, isThisMonth, isThisWeek, isToday } from "date-fns";
import Checkbox from "expo-checkbox";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  useColorScheme,
} from "react-native";

type Priority = "low" | "medium" | "high" | "all";
type SortOrder = "asc" | "desc";
type TimeFilter = "daily" | "weekly" | "monthly" | "all";

export default function PendingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const [selectedPriority, setSelectedPriority] = useState<Priority>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  const allTasks = useAppSelector((state) => state.tasks.tasks);

  // Filter tasks based on selected priority and time filter
  const getFilteredTasks = () => {
    let filtered = pendingTasks;

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    // Filter by time
    if (timeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.date);
        switch (timeFilter) {
          case "daily":
            return isToday(taskDate);
          case "weekly":
            return isThisWeek(taskDate, { weekStartsOn: 1 }); // Monday as start of week
          case "monthly":
            return isThisMonth(taskDate);
          default:
            return true;
        }
      });
    }

    // Sort tasks by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortOrder === "asc" ? priorityDiff : -priorityDiff;
    });

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  const [fontsLoaded] = useFonts({
    TitilliumWeb_Bold: require("@/assets/fonts/TitilliumWeb-Bold.ttf"),
    TitilliumWeb_SemiBold: require("@/assets/fonts/TitilliumWeb-SemiBold.ttf"),
    FiraSans_Regular: require("@/assets/fonts/FiraSans-Regular.ttf"),
    FiraSans_Bold: require("@/assets/fonts/FiraSans-Bold.ttf"),
    FiraSans_Light: require("@/assets/fonts/FiraSans-Light.ttf"),
    FiraSans_Italic: require("@/assets/fonts/FiraSans-Italic.ttf"),
  });

  const themeColors = {
    background: isDark ? "#0f0f0f" : "#ffffff",
    surface: isDark ? "#1a1a1a" : "#f8f9fa",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    primary: isDark ? "#10b981" : "#059669",
    modalBackground: isDark ? "#000000aa" : "#000000aa",
    modalSurface: isDark ? "#1f1f1f" : "#ffffff",
    accent: isDark ? "#3b82f6" : "#2563eb",
    warning: isDark ? "#f59e0b" : "#d97706",
  };

  const priorityColors = {
    low: isDark ? "#10b981" : "#059669",
    medium: isDark ? "#f59e0b" : "#d97706",
    high: isDark ? "#ef4444" : "#dc2626",
  };

  const priorityLabels = {
    all: "All Tasks",
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const timeLabels = {
    all: "All Time",
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
  };

  const getPriorityCount = (priority: Priority) => {
    if (priority === "all") return pendingTasks.length;
    return pendingTasks.filter((task) => task.priority === priority).length;
  };

  const getTimeFilterCount = (filter: TimeFilter) => {
    if (filter === "all") return pendingTasks.length;
    const now = new Date();
    return pendingTasks.filter((task) => {
      const taskDate = new Date(task.date);
      switch (filter) {
        case "daily":
          return isToday(taskDate);
        case "weekly":
          return isThisWeek(taskDate, { weekStartsOn: 1 });
        case "monthly":
          return isThisMonth(taskDate);
        default:
          return true;
      }
    }).length;
  };

  const onDeleteTask = (taskId: string, notificationId: string) => {
    dispatch(removeTask(taskId));
    cancelNotification(notificationId);
    ToastAndroid.showWithGravity(
      "Task deleted successfully",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  };

  const onCompleteTask = (taskId: string, notificationId: string) => {
    dispatch(markAsCompleted(taskId));
    cancelNotification(notificationId);
    ToastAndroid.showWithGravity(
      "Task marked as completed",
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
              onValueChange={() => onCompleteTask(item.id, item.notificationId)}
              color={themeColors.primary}
              style={styles.checkbox}
            />

            {/* Task description */}
            <Text style={[styles.taskDescription, { color: themeColors.text }]}>
              {item.desc}
            </Text>

            <View style={styles.actionButtons}>
              <Pressable
                onPress={() => onDeleteTask(item.id, item.notificationId)}
                style={[
                  styles.actionButton,
                  { backgroundColor: isDark ? "#2d1b1b" : "#fee2e2" },
                ]}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} color="#ef4444" />
              </Pressable>
            </View>
          </View>

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
        {selectedPriority === "all" && timeFilter === "all"
          ? "No Pending Tasks Right Now"
          : "No matching pending tasks"}
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}
      >
        {selectedPriority === "all" && timeFilter === "all"
          ? "Tap + Button to Create a New Task"
          : "Try adjusting your filters"}
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
              Filter & Sort Tasks
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              Customize how tasks are displayed
            </Text>
          </View>

          <ScrollView style={styles.filterOptions}>
            {/* Priority Filter Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Priority Filter
              </Text>
              <View style={styles.filterRow}>
                {(["all", "high", "medium", "low"] as Priority[]).map(
                  (priority, index) => (
                    <View key={priority} style={styles.filterOptionWrapper}>
                      <Pressable
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
                        onPress={() => setSelectedPriority(priority)}
                      >
                        <View style={styles.filterOptionContent}>
                          <View style={styles.filterOptionLeft}>
                            {priority !== "all" && (
                              <HugeiconsIcon
                                icon={Flag02Icon}
                                size={14}
                                color={priorityColors[priority]}
                                strokeWidth={1.75}
                              />
                            )}
                            <Text
                              style={[
                                styles.filterOptionText,
                                { color: themeColors.text, fontSize: 12 },
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
                    </View>
                  )
                )}
              </View>
            </View>

            {selectedPriority === "all" && (
              // Sort Order Section
              <View style={styles.filterSection}>
                <Text
                  style={[styles.sectionTitle, { color: themeColors.text }]}
                >
                  Sort Order
                </Text>
                <View style={styles.filterRow}>
                  {(["desc", "asc"] as SortOrder[]).map((order) => (
                    <View key={order} style={styles.filterOptionWrapper}>
                      <Pressable
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor:
                              sortOrder === order
                                ? isDark
                                  ? "#1f2937"
                                  : "#f3f4f6"
                                : "transparent",
                            borderColor:
                              sortOrder === order
                                ? themeColors.accent
                                : themeColors.border,
                          },
                        ]}
                        onPress={() => setSortOrder(order)}
                      >
                        <View style={styles.filterOptionContent}>
                          <View style={styles.filterOptionLeft}>
                            <HugeiconsIcon
                              icon={
                                order === "asc"
                                  ? ArrowUp01Icon
                                  : ArrowDown01Icon
                              }
                              size={18}
                              color={themeColors.accent}
                              strokeWidth={1.75}
                            />
                            <Text
                              style={[
                                styles.filterOptionText,
                                { color: themeColors.text, fontSize: 12 },
                              ]}
                            >
                              {order === "asc" ? "Low to High" : "High to Low"}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Time Filter Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Time Filter
              </Text>
              <View style={styles.filterRow}>
                {(["all", "daily", "weekly", "monthly"] as TimeFilter[]).map(
                  (filter) => (
                    <View key={filter} style={styles.filterOptionWrapper}>
                      <Pressable
                        style={[
                          styles.filterOption,
                          {
                            backgroundColor:
                              timeFilter === filter
                                ? isDark
                                  ? "#1f2937"
                                  : "#f3f4f6"
                                : "transparent",
                            borderColor:
                              timeFilter === filter
                                ? themeColors.warning
                                : themeColors.border,
                          },
                        ]}
                        onPress={() => setTimeFilter(filter)}
                      >
                        <View style={styles.filterOptionContent}>
                          <View style={styles.filterOptionLeft}>
                            {filter !== "all" && (
                              <HugeiconsIcon
                                icon={Calendar02Icon}
                                size={18}
                                color={themeColors.warning}
                                strokeWidth={1.75}
                              />
                            )}
                            <Text
                              style={[
                                styles.filterOptionText,
                                { color: themeColors.text, fontSize: 12 },
                              ]}
                            >
                              {timeLabels[filter]}
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
                              {getTimeFilterCount(filter)}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  )
                )}
              </View>
            </View>
          </ScrollView>

          <Pressable
            style={[
              styles.closeButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.closeButtonText}>Apply Filters</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const getActiveFiltersText = () => {
    const filters = [];
    if (selectedPriority !== "all")
      filters.push(`${selectedPriority} priority`);
    if (timeFilter !== "all")
      filters.push(timeLabels[timeFilter].toLowerCase());
    if (sortOrder === "asc") filters.push("ascending");
    else filters.push("descending");

    return filters.length > 0 ? ` (${filters.join(", ")})` : "";
  };

  useEffect(() => {
    setPendingTasks(
      allTasks.filter((task) => !task.isCompleted)
    );
  }, [allTasks, selectedPriority, timeFilter, sortOrder, isDark]);

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: themeColors.text }]}>
              Pending Tasks
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: themeColors.textSecondary },
              ]}
            >
              {filteredTasks.length} of {pendingTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"} shown
            </Text>
          </View>
        </View>

        {/* Filter Controls */}
        <View style={styles.filterControls}>
          <Pressable
            onPress={() => setShowFilterModal(true)}
            style={[
              styles.filterControlButton,
              {
                backgroundColor:
                  selectedPriority !== "all" ||
                  timeFilter !== "all" ||
                  sortOrder !== "desc"
                    ? themeColors.primary
                    : isDark
                    ? "#374151"
                    : "#e5e7eb",
              },
            ]}
          >
            <HugeiconsIcon
              icon={FilterIcon}
              size={18}
              color={
                selectedPriority !== "all" ||
                timeFilter !== "all" ||
                sortOrder !== "desc"
                  ? "#ffffff"
                  : themeColors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterControlText,
                {
                  color:
                    selectedPriority !== "all" ||
                    timeFilter !== "all" ||
                    sortOrder !== "desc"
                      ? "#ffffff"
                      : themeColors.textSecondary,
                },
              ]}
            >
              Filters & Sort
            </Text>
          </Pressable>

          {/* Active Filters Display */}
          {(selectedPriority !== "all" ||
            timeFilter !== "all" ||
            sortOrder !== "desc") && (
            <View style={styles.activeFiltersContainer}>
              <Text
                style={[
                  styles.activeFiltersText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {getActiveFiltersText().replace(/[()]/g, "")}
              </Text>
            </View>
          )}
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

      {/* Filter Modal */}
      {renderFilterModal()}
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "TitilliumWeb_Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: "TitilliumWeb_SemiBold",
    marginTop: 4,
  },
  filterControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterControlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  filterControlText: {
    fontSize: 12,
    fontFamily: "FiraSans_Bold",
  },
  activeFiltersContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  activeFiltersText: {
    fontSize: 12,
    fontFamily: "FiraSans_Italic",
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
    fontFamily: "FiraSans_Regular",
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
  priorityText: {
    fontSize: 12,
    fontFamily: "FiraSans_Bold",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    fontFamily: "FiraSans_Regular",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 20,
    fontFamily: "TitilliumWeb_SemiBold",
  },
  emptyStateSubtext: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "TitilliumWeb_Regular",
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
    maxHeight: "85%",
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "TitilliumWeb_Bold",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: "TitilliumWeb_SemiBold",
  },
  filterOptions: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "TitilliumWeb_Bold",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOptionWrapper: {
    width: "48%",
  },
  filterOption: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: "hidden",
    flex: 1,
  },
  filterOptionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  filterOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  filterOptionText: {
    fontSize: 14,
    flexShrink: 1,
    fontFamily: "FiraSans_Regular",
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
    fontFamily: "FiraSans_Regular",
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "TitilliumWeb_Bold",
  },
});
