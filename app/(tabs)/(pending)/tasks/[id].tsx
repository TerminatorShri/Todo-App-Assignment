import { Task } from "@/types/types";
import { useLocalSearchParams } from "expo-router";
import { TaskForm } from "./new";

const dummyTask: Task = {
  id: "1",
  desc: "Sample Task",
  isCompleted: false,
  priority: "medium",
  date: new Date().toISOString(),
};

export default function EditTask() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <TaskForm
      initialTask={dummyTask}
      onSubmit={(task: Task) => {
        console.log("Task submitted:", task);
        // Here you would typically handle the task update logic, e.g., API call
      }}
    />
  );
}
