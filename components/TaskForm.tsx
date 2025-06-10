import { addTask, updateTask } from "@/contexts/taskSlice";
import { updateTaskInDb } from "@/db/handleTasks";
import { useAppDispatch } from "@/hooks/useStore";
import {
  cancelNotification,
  scheduleNotification,
} from "@/services/notificationService";
import { Task } from "@/types/types";
import {
  ArrowUp02Icon,
  Calendar03Icon,
  DigitalClockIcon,
  Flag02Icon,
  NoteEditIcon,
  Notification02Icon,
  Tick01Icon,
  TimeQuarter02Icon,
  Timer02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useFonts } from "expo-font";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import * as Yup from "yup";

type TaskFormProps = {
  initialTask?: Task;
  onTaskSave: () => void;
  mode?: "add" | "edit";
};

const TaskForm = ({ initialTask, onTaskSave, mode = "add" }: TaskFormProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedPriority, setSelectedPriority] = useState<Task["priority"]>(
    initialTask?.priority || "low"
  );
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(
    initialTask?.date ? new Date(initialTask.date) : new Date()
  );
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
  const [selectedNotificationTime, setSelectedNotificationTime] =
    useState<number>(initialTask?.notificationMinutesBefore || 15);

  const [fontsLoaded] = useFonts({
    TitilliumWeb_Bold: require("@/assets/fonts/TitilliumWeb-Bold.ttf"),
    TitilliumWeb_SemiBold: require("@/assets/fonts/TitilliumWeb-SemiBold.ttf"),
    FiraSans_Regular: require("@/assets/fonts/FiraSans-Regular.ttf"),
    FiraSans_Bold: require("@/assets/fonts/FiraSans-Bold.ttf"),
    FiraSans_Light: require("@/assets/fonts/FiraSans-Light.ttf"),
  });

  const priorityColors = {
    low: isDark ? "#10b981" : "#059669",
    medium: isDark ? "#f59e0b" : "#d97706",
    high: isDark ? "#ef4444" : "#dc2626",
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  const notificationOptions = [
    { value: 0, label: "At time" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 45, label: "45 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 120, label: "2 hours before" },
    { value: 1440, label: "1 day before" },
  ];

  const themeColors = {
    background: isDark ? "#0f0f0f" : "#ffffff",
    surface: isDark ? "#1a1a1a" : "#f8f9fa",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    primary: isDark ? "#10b981" : "#059669",
  };

  const onDateTimeSave = () => {
    setShowDateTimePicker(false);
  };

  const openDatePicker = () => {
    setPickerMode("date");
    setShowDateTimePicker(true);
  };

  const openTimePicker = () => {
    setPickerMode("time");
    setShowDateTimePicker(true);
  };

  const dispatch = useAppDispatch();

  const toastTiming = (date: string, notificationMinutesBefore: string) => {
    const taskDate = new Date(date);
    const notificationTime = new Date(
      taskDate.getTime() - (parseInt(notificationMinutesBefore) || 0) * 60000
    );

    if (notificationTime <= new Date()) {
      console.warn("Notification time is in the past.");
      return null;
    }

    ToastAndroid.show(
      `Notification scheduled for ${format(notificationTime, "MMM d, h:mm a")}`,
      ToastAndroid.SHORT
    );
  };

  const handleSubmit = async (task: Task) => {
    try {
      if (mode === "edit" && initialTask) {
        console.log("Editing task:", { ...initialTask, ...task });

        // Cancel previous notification if it exists
        if (initialTask.notificationId) {
          await cancelNotification(initialTask.notificationId);
        }

        // Schedule updated notification
        const notificationId = await scheduleNotification({
          ...initialTask,
          ...task,
        });

        console.log("Notification ID after scheduling:", notificationId);

        if (notificationId) {
          const updatedTask = { ...task, notificationId };

          console.log("🚀 ~ handleSubmit ~ updatedTask:", updatedTask);
          dispatch(updateTask(updatedTask));

          try {
            await updateTaskInDb(updatedTask);
          } catch (error) {
            console.error("Failed to update task in DB:", error);
          }

          toastTiming(
            task.date,
            task.notificationMinutesBefore?.toString() || "0"
          );

          onTaskSave();
        }
      } else {
        console.log("Adding new task:", task);

        const notificationId = await scheduleNotification(task);

        const newTask = notificationId ? { ...task, notificationId } : task;

        dispatch(addTask(newTask));

        if (notificationId) {
          console.log("Notification scheduled with ID:", notificationId);
          toastTiming(
            task.date,
            task.notificationMinutesBefore?.toString() || "0"
          );
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const getNotificationLabel = (minutes: number) => {
    const option = notificationOptions.find((opt) => opt.value === minutes);
    return option ? option.label : "Custom";
  };

  const DateTimePickerModal = () => (
    <Modal
      visible={showDateTimePicker}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: themeColors.background },
        ]}
      >
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDateTime}
          mode={pickerMode}
          themeVariant={isDark ? "dark" : "light"}
          minimumDate={pickerMode === "date" ? new Date() : undefined}
          onChange={(event, dateTime) => {
            if (dateTime) {
              const now = new Date();
              const selected = new Date(dateTime);

              const isSameDay = now.toDateString() === selected.toDateString();

              if (pickerMode === "time" && isSameDay && selected < now) {
                ToastAndroid.show(
                  "Please select a valid time",
                  ToastAndroid.SHORT
                );
                setShowDateTimePicker(false);
                setSelectedDateTime(now);
                return;
              }

              setShowDateTimePicker(false);
              setSelectedDateTime(selected);
            }
          }}
          accentColor={themeColors.primary}
          display="inline"
          style={styles.datePicker}
        />
      </View>
    </Modal>
  );

  const PriorityModal = () => (
    <Modal visible={showPriorityModal} transparent animationType="fade">
      <View style={styles.priorityModalOverlay}>
        <View
          style={[
            styles.priorityModal,
            { backgroundColor: themeColors.background },
          ]}
        >
          <Text
            style={[styles.priorityModalTitle, { color: themeColors.text }]}
          >
            Select Priority
          </Text>
          {(["low", "medium", "high"] as Task["priority"][]).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.priorityModalItem,
                { borderBottomColor: themeColors.border },
              ]}
              onPress={() => {
                setSelectedPriority(level);
                setShowPriorityModal(false);
              }}
            >
              <HugeiconsIcon
                icon={Flag02Icon}
                size={20}
                color={priorityColors[level]}
              />
              <Text
                style={[styles.priorityModalText, { color: themeColors.text }]}
              >
                {priorityLabels[level]}
              </Text>
              {selectedPriority === level && (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  size={20}
                  color={themeColors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.priorityModalCancel}
            onPress={() => setShowPriorityModal(false)}
          >
            <Text
              style={[
                styles.priorityModalCancelText,
                { color: themeColors.textSecondary },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const NotificationModal = () => (
    <Modal visible={showNotificationModal} transparent animationType="fade">
      <View style={styles.priorityModalOverlay}>
        <View
          style={[
            styles.priorityModal,
            { backgroundColor: themeColors.background },
          ]}
        >
          <Text
            style={[styles.priorityModalTitle, { color: themeColors.text }]}
          >
            Notification Timing
          </Text>
          {notificationOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.priorityModalItem,
                { borderBottomColor: themeColors.border },
              ]}
              onPress={() => {
                setSelectedNotificationTime(option.value);
                setShowNotificationModal(false);
              }}
            >
              <HugeiconsIcon
                icon={Timer02Icon}
                size={20}
                color={themeColors.primary}
              />
              <Text
                style={[styles.priorityModalText, { color: themeColors.text }]}
              >
                {option.label}
              </Text>
              {selectedNotificationTime === option.value && (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  size={20}
                  color={themeColors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.priorityModalCancel}
            onPress={() => setShowNotificationModal(false)}
          >
            <Text
              style={[
                styles.priorityModalCancelText,
                { color: themeColors.textSecondary },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    console.log("Initial task:", initialTask);
    if (initialTask) {
      setSelectedDateTime(new Date(initialTask.date));
      setSelectedPriority(initialTask.priority);
      setSelectedNotificationTime(initialTask.notificationMinutesBefore || 15);
    }
  }, [initialTask]);

  return (
    <>
      <Formik
        initialValues={{
          id: initialTask?.id || Date.now().toString(),
          desc: initialTask?.desc || "",
          date: selectedDateTime.toISOString(),
        }}
        validationSchema={Yup.object({
          desc: Yup.string().required("Description is required"),
        })}
        onSubmit={(values) => {
          const task: Task = {
            ...values,
            date: selectedDateTime.toISOString(),
            priority: selectedPriority,
            isCompleted: false,
            notificationMinutesBefore: selectedNotificationTime,
            notificationId: initialTask?.notificationId || "",
          };
          console.log("Submitting task:", task);
          handleSubmit(task);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <ScrollView
            style={[
              styles.container,
              { backgroundColor: themeColors.background },
            ]}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Description Input */}
            <View style={styles.inputSection}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <HugeiconsIcon
                  icon={NoteEditIcon}
                  size={24}
                  color={themeColors.primary}
                />
                <Text style={[styles.label, { color: themeColors.text }]}>
                  Description
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                placeholder="What needs to be done?"
                placeholderTextColor={themeColors.textSecondary}
                onChangeText={handleChange("desc")}
                onBlur={handleBlur("desc")}
                value={values.desc}
                multiline
                numberOfLines={3}
              />
              {touched.desc && errors.desc && (
                <Text style={styles.error}>{errors.desc}</Text>
              )}
            </View>

            {/* First Action Row - Date, Time, Priority */}
            <View style={styles.actionRow}>
              {/* Date Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={openDatePicker}
              >
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={20}
                  color={themeColors.primary}
                />
                <View style={styles.actionButtonContent}>
                  <Text
                    style={[
                      styles.actionButtonLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Date
                  </Text>
                  <Text
                    style={[
                      styles.actionButtonValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {format(selectedDateTime, "MMM d")}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Time Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={openTimePicker}
              >
                <HugeiconsIcon
                  icon={TimeQuarter02Icon}
                  size={20}
                  color={themeColors.primary}
                />
                <View style={styles.actionButtonContent}>
                  <Text
                    style={[
                      styles.actionButtonLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Time
                  </Text>
                  <Text
                    style={[
                      styles.actionButtonValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {format(selectedDateTime, "h:mm a")}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Priority Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => setShowPriorityModal(true)}
              >
                <HugeiconsIcon
                  icon={Flag02Icon}
                  size={20}
                  color={priorityColors[selectedPriority]}
                />
                <View style={styles.actionButtonContent}>
                  <Text
                    style={[
                      styles.actionButtonLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Priority
                  </Text>
                  <Text
                    style={[
                      styles.actionButtonValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {priorityLabels[selectedPriority]}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Notification Section */}
            <View style={styles.notificationSection}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <HugeiconsIcon
                  icon={Notification02Icon}
                  size={24}
                  color={themeColors.primary}
                />
                <Text style={[styles.label, { color: themeColors.text }]}>
                  Notification
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.notificationButton,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => setShowNotificationModal(true)}
              >
                <HugeiconsIcon
                  icon={DigitalClockIcon}
                  size={20}
                  color={themeColors.primary}
                />
                <View style={styles.actionButtonContent}>
                  <Text
                    style={[
                      styles.actionButtonLabel,
                      { color: themeColors.textSecondary },
                    ]}
                  >
                    Remind me
                  </Text>
                  <Text
                    style={[
                      styles.actionButtonValue,
                      { color: themeColors.text },
                    ]}
                  >
                    {getNotificationLabel(selectedNotificationTime)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={() => handleSubmit()}
            >
              <HugeiconsIcon
                icon={ArrowUp02Icon}
                size={24}
                color="#ffffff"
                strokeWidth={2}
              />
              <Text style={styles.saveButtonText}>
                {mode === "edit" ? "Update Task" : "Add Task"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Formik>

      <DateTimePickerModal />
      <PriorityModal />
      <NotificationModal />
    </>
  );
};

export default TaskForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 24,
  },
  inputSection: {
    gap: 8,
  },
  label: {
    fontFamily: "TitilliumWeb_Bold",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    fontFamily: "FiraSans_Regular",
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontFamily: "TitilliumWeb_SemiBold",
    marginBottom: 2,
  },
  actionButtonValue: {
    fontSize: 12,
    fontFamily: "TitilliumWeb_SemiBold",
  },
  notificationSection: {
    gap: 8,
  },
  notificationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "FiraSans_Bold",
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  datePicker: {
    flex: 1,
    marginTop: 20,
  },

  // Priority Modal
  priorityModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  priorityModal: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  priorityModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "TitilliumWeb_Bold",
  },
  priorityModalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  priorityModalText: {
    fontSize: 16,
    flex: 1,
    fontFamily: "FiraSans_Regular",
  },
  priorityModalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  priorityModalCancelText: {
    fontSize: 16,
    fontFamily: "FiraSans_Light",
  },
});
