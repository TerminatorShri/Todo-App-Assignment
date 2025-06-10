export interface Task {
  id: string;
  desc: string;
  date: string;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  notificationId: string;
  notificationMinutesBefore?: number;
}
