// Notification screen: scrollable list of simple cards with a robot badge
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "./theme";

export default function Notification() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card 1 with message text */}
        <View style={[styles.card, styles.firstCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.notificationText, { color: colors.text }]}>you havent done any focused study in three days</Text>
          <View style={[styles.iconBubble, { backgroundColor: colors.border, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="robot" size={16} color={typeof colors.text === 'string' ? colors.text as string : undefined} />
          </View>
        </View>

        {/* Card 2 */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBubble, { backgroundColor: colors.border, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="robot" size={16} color={typeof colors.text === 'string' ? colors.text as string : undefined} />
          </View>
        </View>

        {/* Card 3 */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconBubble, { backgroundColor: colors.border, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="robot" size={16} color={typeof colors.text === 'string' ? colors.text as string : undefined} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
      borderWidth: 2,
      borderRadius: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  card: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "whitesmoke",
    marginVertical: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  firstCard: {
    padding: 14,
    paddingRight: 16,
    paddingBottom: 36,
    justifyContent: "flex-start",
  },
  notificationText: {
    color: "black",
    top: 30,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 20,
  },
  iconBubble: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "lightgray",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "lightgray",
  },
});
