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
      high: { urgency: "high" as const, emoji: "🔥" },
      medium: { urgency: "normal" as const, emoji: "⚡" },
      low: { urgency: "low" as const, emoji: "💡" },
    };

    const config = priorityConfig[task.priority];

    // Create time-based notification body with task description included
    const getNotificationContent = () => {
      const minutesBefore = task.notificationMinutesBefore || 0;
      const priorityText = ` ${task.priority.toUpperCase()} PRIORITY`;

      let timeText = "";
      if (minutesBefore === 0) {
        timeText = "Due now!";
      } else if (minutesBefore < 60) {
        timeText = `Due in ${minutesBefore} minutes`;
      } else if (minutesBefore < 1440) {
        const hours = Math.floor(minutesBefore / 60);
        timeText = `Due in ${hours} hour${hours > 1 ? "s" : ""}`;
      } else {
        const days = Math.floor(minutesBefore / 1440);
        timeText = `Due in ${days} day${days > 1 ? "s" : ""}`;
      }

      return {
        title: `TASK REMINDER - ${priorityText}`,
        body: `${task.desc}\n ${timeText}\n ${taskDateFormatted} at ${taskTimeFormatted}`,
      };
    };

    const content = getNotificationContent();

    const notificationId = await Notification.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: {
          taskId: task.id,
          taskDescription: task.desc, // Include task description in data
          priority: task.priority,
          taskDate: task.date,
          minutesBefore: task.notificationMinutesBefore,
        },
        sound: true,
        badge: 1,
        // iOS specific
        categoryIdentifier: "TASK_REMINDER",
        // Android specific
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
      `✅ Notification scheduled for task: "${task.desc}" at ${format(
        notificationTime,
        "MMM d, h:mm a"
      )}`
    );

    return notificationId;
  } catch (error) {
    console.error("❌ Failed to schedule notification:", error);
    return null;
  }
};

export const cancelNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    // Add validation
    if (!notificationId) {
      console.warn(
        "Cannot cancel notification: notificationId is empty or undefined"
      );
      return;
    }

    console.log(`Attempting to cancel notification: ${notificationId}`);

    // Check if notification exists before canceling
    const scheduledNotifications =
      await Notification.getAllScheduledNotificationsAsync();
    const notificationExists = scheduledNotifications.some(
      (notification) => notification.identifier === notificationId
    );

    if (!notificationExists) {
      console.warn(
        `Notification with ID ${notificationId} not found in scheduled notifications`
      );
      return;
    }

    // Cancel the notification
    await Notification.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ Notification cancelled successfully: ${notificationId}`);

    // Verify cancellation
    const updatedNotifications =
      await Notification.getAllScheduledNotificationsAsync();
    const stillExists = updatedNotifications.some(
      (notification) => notification.identifier === notificationId
    );

    if (stillExists) {
      console.error(
        `❌ Notification still exists after cancellation: ${notificationId}`
      );
    } else {
      console.log(
        `✅ Verified: Notification ${notificationId} successfully removed`
      );
    }
  } catch (error) {
    console.error("Failed to cancel notification:", error);
    console.error("Error details:", {
      notificationId,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw to let caller handle if needed
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
