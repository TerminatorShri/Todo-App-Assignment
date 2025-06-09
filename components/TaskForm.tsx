import { Task } from "@/types/types";
import {
  ArrowUp02Icon,
  Calendar03Icon,
  Flag02Icon,
  NoteEditIcon,
  Tick04Icon,
  TimeQuarter02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Formik } from "formik";
import React, { useState } from "react";
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
  onSubmit: (task: Task) => void;
  mode?: "add" | "edit";
};

const TaskForm = ({ initialTask, onSubmit, mode = "add" }: TaskFormProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [selectedPriority, setSelectedPriority] = useState<Task["priority"]>(
    initialTask?.priority || "low"
  );
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(
    initialTask?.date ? new Date(initialTask.date) : new Date()
  );
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

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
                  icon={Tick04Icon}
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
            isCompleted: initialTask?.isCompleted || false,
          };
          console.log("Submitting task:", task);
          onSubmit(task);
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

            {/* Action Buttons */}
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
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
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
    fontWeight: "500",
    marginBottom: 2,
  },
  actionButtonValue: {
    fontSize: 12,
    fontWeight: "600",
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
    fontWeight: "600",
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
  },
  priorityModalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  priorityModalCancelText: {
    fontSize: 16,
  },
});
