import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "./theme";
import { modulesData } from "../data/modules";

export default function Progress(){
  const { colors } = useTheme();

  // Count modules by the three canonical colors
  const counts = useMemo(() => {
    const base = { red: 0, green: 0, orange: 0 } as Record<'red'|'green'|'orange', number>;
    for (const m of modulesData) {
      if (m.color in base) base[m.color as 'red'|'green'|'orange'] += 1;
    }
    return base;
  }, []);

  const items: { key: 'red'|'green'|'orange'; label: string; color: string }[] = [
    { key: 'red', label: 'Urgent', color: 'red' },
    { key: 'green', label: 'Completed', color: 'green' },
    { key: 'orange', label: 'Due soon', color: 'orange' },
  ];

  const maxVal = Math.max(1, ...items.map(i => counts[i.key]));
  const chartHeight = 180; // px

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Modules by color</Text>

      <View
        accessibilityLabel="Progress Bar Chart"
        testID="ProgressBarChart"
        style={[styles.chartArea, { borderColor: colors.border }]}
      >
        {/* Y-axis baseline */}
        <View style={[styles.axis, { backgroundColor: colors.border }]} />

        <View style={styles.barsRow}>
          {items.map((it) => {
            const value = counts[it.key];
            const height = (value / maxVal) * chartHeight;
            return (
              <View key={it.key} style={styles.barWrapper}>
                {/* Value label above bar */}
                <Text style={[styles.valueLabel, { color: colors.text }]}>{value}</Text>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: it.color,
                      borderColor: colors.border,
                    },
                  ]}
                  accessibilityLabel={`${it.label} count ${value}`}
                />
                <Text style={[styles.barLabel, { color: colors.text }]}>{it.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <Text style={[styles.hint, { color: colors.subtleText as string | undefined }]}>Add a new module with color red/green/orange and the corresponding bar will grow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
      borderWidth: 2,
      borderRadius: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  chartArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 16,
  },
  axis: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginTop: 190,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
  },
  barWrapper: {
    alignItems: 'center',
    width: 70,
  },
  valueLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  bar: {
    width: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },
});
