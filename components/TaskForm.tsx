import { Task } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Yup from "yup";

type TaskFormProps = {
  initialTask?: Task;
  onSubmit: (task: Task) => void;
};

const TaskForm = ({ initialTask, onSubmit }: TaskFormProps) => {
  const [selectedPriority, setSelectedPriority] = useState<Task["priority"]>(
    initialTask?.priority || "low"
  );

  return (
    <Formik
      initialValues={{
        id: initialTask?.id || Date.now().toString(),
        desc: initialTask?.desc || "",
        date: initialTask?.date || new Date().toISOString().split("T")[0],
      }}
      validationSchema={Yup.object({
        desc: Yup.string().required("Description is required"),
        date: Yup.string().required("Date is required"),
      })}
      onSubmit={(values) => {
        onSubmit({ ...values, priority: selectedPriority, isCompleted: false });
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
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task description"
            onChangeText={handleChange("desc")}
            onBlur={handleBlur("desc")}
            value={values.desc}
          />
          {touched.desc && errors.desc && (
            <Text style={styles.error}>{errors.desc}</Text>
          )}

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            onChangeText={handleChange("date")}
            onBlur={handleBlur("date")}
            value={values.date}
          />
          {touched.date && errors.date && (
            <Text style={styles.error}>{errors.date}</Text>
          )}

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {["low", "medium", "high"].map((level) => (
              <Pressable
                key={level}
                style={[
                  styles.priorityButton,
                  selectedPriority === level && styles.prioritySelected,
                ]}
                onPress={() => setSelectedPriority(level as Task["priority"])}
              >
                <Text
                  style={[
                    styles.priorityText,
                    selectedPriority === level && styles.priorityTextSelected,
                  ]}
                >
                  {level.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.submitButton} onPress={() => handleSubmit()}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Submit</Text>
          </Pressable>
        </ScrollView>
      )}
    </Formik>
  );
};

export default TaskForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 14,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 12,
  },
  priorityButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  prioritySelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  priorityText: {
    color: "#333",
    fontWeight: "500",
  },
  priorityTextSelected: {
    color: "#fff",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    gap: 6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
