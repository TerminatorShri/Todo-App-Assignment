import TaskForm from "@/components/TaskForm";
import { useAppSelector } from "@/hooks/useStore";
import { Task } from "@/types/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const EditTask = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const onTaskSave = () => {
    console.log("Task saved");
    router.back();
  };

  useEffect(() => {
    console.log("Editing task with ID:", id);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      console.log("Found task to edit:", task);
      setTaskToEdit(task);
    }
  }, [id, tasks]);

  return (
    <View style={{ flex: 1 }}>
      {taskToEdit && (
        <TaskForm
          initialTask={taskToEdit}
          onTaskSave={onTaskSave}
          mode="edit"
        />
      )}
    </View>
  );
};

export default EditTask;

const styles = StyleSheet.create({});
