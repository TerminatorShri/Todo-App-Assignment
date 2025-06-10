import { createSelector } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../constants/Store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const selectTasks = (state: RootState) => state.tasks;

export const selectCompletedTasks = createSelector([selectTasks], (tasks) =>
  tasks.tasks.filter((task) => task.isCompleted)
);

export const selectPendingTasks = createSelector([selectTasks], (tasks) =>
  tasks.tasks.filter((task) => !task.isCompleted)
);
