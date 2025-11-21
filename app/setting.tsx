/*
  Settings screen UI
  - Two large rectangles stacked vertically.
  - First large rectangle contains three smaller rows stacked vertically:
      1) 👔  User details
      2) 🛡️  Password and security
      3) ⚙️  Other settings (placeholder)
  - Second large rectangle contains a setting:
      - Toggle background  [switch]
*/
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "./theme";

// The main component for the Settings screen
export default function Setting() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      {/* First big rectangle */}
      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: "black" }]}>
        <View style={styles.itemRow}>
          <Text style={[styles.icon, { color: colors.text }]}>👔</Text>
          <Text style={[styles.itemText, { color: colors.text }]}>User details</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <View style={styles.itemRow}>
          <Text style={[styles.icon, { color: colors.text }]}>🛡️</Text>
          <Text style={[styles.itemText, { color: colors.text }]}>Password and security</Text>
        </View>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <View style={styles.itemRow}>
          <Text style={[styles.icon, { color: colors.text }]}>⚙️</Text>
          <Text style={[styles.itemText, { color: colors.text }]}>Other settings</Text>
        </View>
      </View>

      {/* Second big rectangle */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.itemRowBetween}>
          <Text style={[styles.itemText, { color: colors.text }]}>Toggle background</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "lightgray", true: "dodgerblue" }}
            thumbColor={isDark ? "dimgray" : "white"}
          />
        </View>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "whitesmoke",
      borderWidth: 2,
      borderRadius: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  icon: {
    width: 28,
    marginRight: 10,
    fontSize: 18,
  },
  itemText: {
    fontSize: 16,
    color: "black",
    fontWeight: "600",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "gainsboro",
  },
});
