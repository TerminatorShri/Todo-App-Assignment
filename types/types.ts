export interface Task {
  id: string;
  desc: string;
  date: string;
  priority: "low" | "medium" | "high";
}
