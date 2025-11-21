import React from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from "react-native";
import { useTheme } from "./theme";
import { modulesData } from "../data/modules";

export default function Modules(){
  const { colors } = useTheme();
    const onAdd = () => {};
    return (
    // Overall container: "Modules"
    <View
      accessibilityLabel="Modules"
      testID="Modules"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Module cards driven by shared data. Add new items in data/modules.ts */}
        {modulesData.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Left colored square */}
            <View style={[styles.colorSquare, { backgroundColor: item.color }]} />
            {/* Title on the right */}
            <Text style={[styles.titleText, { color: colors.text }]}>{item.title}</Text>
          </View>
        ))}

      </ScrollView>
        <TouchableOpacity style={styles.bottomButton} onPress={onAdd} activeOpacity={0.8}>
            <Text style={styles.bottomButtonText}>Add Module</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
      borderWidth: 2,
      borderRadius: 10,
  },
  content: {
    padding: 16,
  },
  // Each rectangle (module card)
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  // Smaller rectangle on the left (color from item)
  colorSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },

    bottomButton: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        height: 48,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
    },
    bottomButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});
