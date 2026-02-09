import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../../theme";

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface FormProgressProps {
  steps: Step[];
}

const CIRCLE_SIZE = 24;

export function FormProgress({ steps }: FormProgressProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const color = step.completed
          ? theme.colors.primary
          : step.active
            ? theme.colors.primary
            : theme.custom.colors.border;

        return (
          <React.Fragment key={step.label}>
            <View style={styles.stepContainer}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: step.completed
                      ? theme.colors.primary
                      : "transparent",
                    borderColor: color,
                  },
                ]}
              >
                {step.completed ? (
                  <MaterialCommunityIcons
                    name="check"
                    size={14}
                    color={theme.custom.colors.surface}
                  />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      theme.custom.typography.small,
                      { color },
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  theme.custom.typography.small,
                  {
                    color: step.completed || step.active
                      ? theme.custom.colors.text
                      : theme.custom.colors.textSecondary,
                    fontWeight: step.active ? "600" : "400",
                  },
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connectorWrapper,
                ]}
              >
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: step.completed
                        ? theme.colors.primary
                        : theme.custom.colors.border,
                    },
                  ]}
                />
              </View>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  stepContainer: {
    alignItems: "center",
    gap: 4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontWeight: "600",
  },
  stepLabel: {},
  connectorWrapper: {
    height: CIRCLE_SIZE,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  connector: {
    height: 2,
  },
});
