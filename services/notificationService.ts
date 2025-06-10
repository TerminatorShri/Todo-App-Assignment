import { Task } from "@/types/types";
import { format } from "date-fns";
import * as Notification from "expo-notifications";

export const scheduleNotification = async (
  task: Task
): Promise<string | null> => {
  try {
    const taskDate = new Date(task.date);
    const notificationTime = new Date(
      taskDate.getTime() - (task.notificationMinutesBefore || 0) * 60000
    );

    if (notificationTime <= new Date()) {
      console.warn("Notification time is in the past. Task:", task);
      return null;
    }

    // Format the task time for display
    const taskTimeFormatted = format(taskDate, "h:mm a");
    const taskDateFormatted = format(taskDate, "MMM d");

    // Create priority-based urgency
    const priorityConfig = {
      high: { urgency: "high" as const },
      medium: { urgency: "normal" as const },
      low: { urgency: "low" as const },
    };

    const config = priorityConfig[task.priority];

    // Create time-based notification body
    const getNotificationBody = () => {
      const minutesBefore = task.notificationMinutesBefore || 0;

      if (minutesBefore === 0) {
        return `Your task is due now!\n${taskDateFormatted} at ${taskTimeFormatted}`;
      } else if (minutesBefore < 60) {
        return `Your task is due in ${minutesBefore} minutes\n${taskDateFormatted} at ${taskTimeFormatted}`;
      } else if (minutesBefore < 1440) {
        const hours = Math.floor(minutesBefore / 60);
        return `Your task is due in ${hours} hour${
          hours > 1 ? "s" : ""
        }\n${taskDateFormatted} at ${taskTimeFormatted}`;
      } else {
        const days = Math.floor(minutesBefore / 1440);
        return `Your task is due in ${days} day${
          days > 1 ? "s" : ""
        }\n${taskDateFormatted} at ${taskTimeFormatted}`;
      }
    };

    const notificationId = await Notification.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: getNotificationBody(),
        subtitle: task.desc,
        data: {
          taskId: task.id,
          priority: task.priority,
          taskDate: task.date,
        },
        sound: true,
        badge: 1,
        // iOS specific styling
        categoryIdentifier: "task-reminder",
        // Android specific styling
        color:
          config.urgency === "high"
            ? "#ef4444"
            : config.urgency === "normal"
            ? "#f59e0b"
            : "#10b981",
        priority: config.urgency,
      },
      trigger: {
        type: Notification.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
      },
    });

    console.log(
      `Notification scheduled for task: ${task.desc} at ${format(
        notificationTime,
        "MMM d, h:mm a"
      )}`
    );
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
};

export const cancelNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await Notification.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notification cancelled: ${notificationId}`);
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
};

export const cancelAllTaskNotifications = async (): Promise<void> => {
  try {
    await Notification.cancelAllScheduledNotificationsAsync();
    console.log("All notifications cancelled");
  } catch (error) {
    console.error("Failed to cancel all notifications:", error);
  }
};

// Request notification permissions with better UX
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notification.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notification.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: true,
          allowProvisional: false,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus === "granted") {
      console.log("Notification permissions granted");
      return true;
    } else {
      console.log("Notification permissions denied");
      return false;
    }
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Get all scheduled notifications for debugging
export const getScheduledNotifications = async () => {
  try {
    const notifications =
      await Notification.getAllScheduledNotificationsAsync();
    console.log("Scheduled notifications:", notifications);
    return notifications;
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
};

// Utility function to format notification preview text
export const getNotificationPreviewText = (task: Task): string => {
  const taskDate = new Date(task.date);
  const notificationTime = new Date(
    taskDate.getTime() - (task.notificationMinutesBefore || 0) * 60000
  );

  const minutesBefore = task.notificationMinutesBefore || 0;

  if (minutesBefore === 0) {
    return `Your task "${task.desc}" is due now!`;
  } else if (minutesBefore < 60) {
    return `Your task "${task.desc}" is due in ${minutesBefore} minutes`;
  } else if (minutesBefore < 1440) {
    const hours = Math.floor(minutesBefore / 60);
    return `Your task "${task.desc}" is due in ${hours} hour${
      hours > 1 ? "s" : ""
    }`;
  } else {
    const days = Math.floor(minutesBefore / 1440);
    return `Your task "${task.desc}" is due in ${days} day${
      days > 1 ? "s" : ""
    }`;
  }
};
