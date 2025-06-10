import { ThemedView } from "@/components/ThemedView";
import { clearTasks } from "@/contexts/taskSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { Task } from "@/types/types";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Calendar02Icon,
  Delete02Icon,
  FilterIcon,
  Flag02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { format, isThisMonth, isThisWeek, isToday } from "date-fns";
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
type SortOrder = "asc" | "desc";
type TimeFilter = "daily" | "weekly" | "monthly" | "all";

export default function CompletedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dispatch = useAppDispatch();
  const [selectedPriority, setSelectedPriority] = useState<Priority>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const completedTasks = useAppSelector((state) =>
    state.tasks.tasks.filter((task) => task.isCompleted)
  );

  // Filter tasks based on selected priority and time filter
  const getFilteredTasks = () => {
    let filtered = completedTasks;

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
    if (priority === "all") return completedTasks.length;
    return completedTasks.filter((task) => task.priority === priority).length;
  };

  const getTimeFilterCount = (filter: TimeFilter) => {
    if (filter === "all") return completedTasks.length;
    const now = new Date();
    return completedTasks.filter((task) => {
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
        {selectedPriority === "all" && timeFilter === "all"
          ? "No completed tasks"
          : "No matching completed tasks"}
      </Text>
      <Text
        style={[styles.emptyStateSubtext, { color: themeColors.textSecondary }]}
      >
        {selectedPriority === "all" && timeFilter === "all"
          ? "Complete some tasks to see them here"
          : `Try adjusting your filters`}
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

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
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
              {filteredTasks.length === 1 ? "task" : "tasks"} shown
            </Text>
          </View>

          <View style={styles.headerActions}>
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
                <Text style={[styles.clearButtonText, { color: "#ef4444" }]}>
                  Clear All
                </Text>
              </Pressable>
            )}
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
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: "600",
  },
  activeFiltersContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    fontWeight: "500",
    fontStyle: "italic",
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
    maxHeight: "85%",
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
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
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
    fontWeight: "600",
    flexShrink: 1,
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
