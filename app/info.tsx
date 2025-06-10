import {
  CheckmarkCircle02Icon,
  Flag02Icon,
  Notification03Icon,
  SmartPhone01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useFonts } from "expo-font";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

const InfoScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeColors = {
    background: isDark ? "#0f0f0f" : "#ffffff",
    surface: isDark ? "#1a1a1a" : "#f8f9fa",
    text: isDark ? "#ffffff" : "#1a1a1a",
    textSecondary: isDark ? "#9ca3af" : "#6b7280",
    border: isDark ? "#374151" : "#e5e7eb",
    primary: isDark ? "#10b981" : "#059669",
    accent: isDark ? "#3b82f6" : "#2563eb",
  };

  const infoItems = [
    {
      icon: CheckmarkCircle02Icon,
      title: "Smart Task Management",
      description:
        "Organize your tasks with priority levels and track completion status efficiently and get notified",
      color: themeColors.primary,
    },
    {
      icon: Flag02Icon,
      title: "Priority-Based Organization",
      description:
        "Set task priorities (Low, Medium, High) to focus on what matters most and update them easily",
      color: "#f59e0b",
    },
    {
      icon: Notification03Icon,
      title: "Clean & Intuitive Interface",
      description:
        "Beautifully designed with dark and light theme support for comfortable usage",
      color: themeColors.accent,
    },
    {
      icon: SmartPhone01Icon,
      title: "Cross-Platform Compatible",
      description:
        "Built with React Native for seamless performance across iOS and Android",
      color: "#8b5cf6",
    },
  ];

  const [fontsLoaded] = useFonts({
    TitilliumWeb_Bold: require("@/assets/fonts/TitilliumWeb-Bold.ttf"),
    TitilliumWeb_SemiBold: require("@/assets/fonts/TitilliumWeb-SemiBold.ttf"),
    FiraSans_Regular: require("@/assets/fonts/FiraSans-Regular.ttf"),
    FiraSans_Bold: require("@/assets/fonts/FiraSans-Bold.ttf"),
    FiraSans_Light: require("@/assets/fonts/FiraSans-Light.ttf"),
    FiraSans_Italic: require("@/assets/fonts/FiraSans-Italic.ttf"),
    NovaSquare_Regular: require("@/assets/fonts/NovaSquare-Regular.ttf"),
  });

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View
            style={[
              styles.appIconContainer,
              { backgroundColor: themeColors.primary },
            ]}
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={32}
              color="#ffffff"
              strokeWidth={2}
            />
          </View>
          <Text style={[styles.appTitle, { color: themeColors.text }]}>
            PixelPlan
          </Text>
          <Text
            style={[styles.appVersion, { color: themeColors.textSecondary }]}
          >
            Version 1.0.0
          </Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            About This App
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: themeColors.textSecondary },
            ]}
          >
            PixelPlan is a powerful and intuitive task management application
            designed to help you stay organized and productive. Built with
            modern React Native technology for optimal performance.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Key Features
          </Text>
          {infoItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.featureCard,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.featureIconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={24}
                  color={item.color}
                  strokeWidth={1.5}
                />
              </View>
              <View style={styles.featureContent}>
                <Text
                  style={[styles.featureTitle, { color: themeColors.text }]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Developer Info
          </Text>
          <View
            style={[
              styles.developerCard,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <View
              style={[
                styles.developerIconContainer,
                { backgroundColor: `${themeColors.accent}15` },
              ]}
            >
              <HugeiconsIcon
                icon={UserIcon}
                size={24}
                color={themeColors.accent}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.developerContent}>
              <Text style={[styles.developerName, { color: themeColors.text }]}>
                Built with ❤️ by TerminatorShri
              </Text>
              <Text
                style={[
                  styles.developerDescription,
                  { color: themeColors.textSecondary },
                ]}
              >
                Crafted with attention to detail and user experience in mind
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[styles.footerText, { color: themeColors.textSecondary }]}
          >
            © 2024 PixelPlan. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appTitle: {
    fontSize: 28,
    fontFamily: "NovaSquare_Regular",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontFamily: "FiraSans_Regular",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "TitilliumWeb_Bold",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "FiraSans_Regular",
  },
  featureCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "flex-start",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontFamily: "TitilliumWeb_SemiBold",
    marginBottom: 4,
    lineHeight: 22,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "FiraSans_Regular",
  },
  developerCard: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  developerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  developerContent: {
    flex: 1,
  },
  developerName: {
    fontSize: 17,
    fontFamily: "FiraSans_Bold",
    marginBottom: 4,
  },
  developerDescription: {
    fontSize: 15,
    fontFamily: "FiraSans_Regular",
  },
  footer: {
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(156, 163, 175, 0.2)",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "FiraSans_Light",
  },
});
