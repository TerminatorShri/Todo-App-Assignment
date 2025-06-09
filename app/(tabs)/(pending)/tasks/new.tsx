import TaskForm from "@/components/TaskForm";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const NewTask = () => {
  const router = useRouter();

  const onTaskSave = () => {
    console.log("New task saved");
    router.back();
  };
  return (
    <View style={{ flex: 1 }}>
      <TaskForm onTaskSave={onTaskSave} />
    </View>
  );
};

export default NewTask;

const styles = StyleSheet.create({});
