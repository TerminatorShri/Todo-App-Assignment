import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../types/types";

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [
    {
      id: "1",
      desc: "Buy groceries",
      date: "2025-06-10",
      priority: "medium",
      isCompleted: false,
      notificationId: "",
    },
    {
      id: "2",
      desc: "Finish React Native project as soon as possible",
      date: "2025-06-12",
      priority: "high",
      isCompleted: false,
      notificationId: "",
    },
    {
      id: "3",
      desc: "Read a book",
      date: "2025-06-11",
      priority: "low",
      isCompleted: true,
      notificationId: "",
    },
  ],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    updateTask: (
      state,
      action: PayloadAction<Partial<Task> & { id: string }>
    ) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload };
      }
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    markAsCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.isCompleted = true;
      }
    },
  },
});

export const { addTask, removeTask, updateTask, clearTasks, markAsCompleted } =
  tasksSlice.actions;
export default tasksSlice.reducer;
