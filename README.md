# PixelPlan

## Getting Started

Follow these steps to set up and run the project:

1. **Clone the repository** to your local machine.
2. Open a terminal, navigate to the project root directory, and install dependencies:

   ```bash
   npm install
   ```

3. **Install the [Expo Go](https://expo.dev/client)** app on your Android or iOS device from the Play Store or App Store.
4. Start the development server:

   ```bash
   npx expo start
   ```

5. Scan the QR code displayed in your terminal using the Expo Go app to launch PixelPlan on your device.

## Features

- **Smart Task Scheduling:** Organize your tasks by priority and receive timely reminders so you never miss an important deadline.
- **Flexible Task Management:** Easily add, edit, and update your tasks as your plans change.
- **Automatic Reminder Handling:** Reminders are automatically cancelled when a task is completed or deleted, keeping your notifications relevant.
- **Advanced Filtering & Sorting:** Effortlessly filter and sort tasks based on priority and predefined time intervals to focus on what matters most.

## Challenges Faced

While implementing persistent storage using Expo SQLite and Drizzle ORM, I encountered issues where some functionalities did not work as expected. Specifically, I faced race conditions and database locking problems, even though only a single transaction was being executed at a time. As a result, database operations were not performed reliably. Despite investigating the root cause, I was unable to find sufficient documentation or a solution for this issue. Due to these challenges, I reverted to using store-based state management for the application.
