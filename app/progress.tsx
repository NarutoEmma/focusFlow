import React, {useEffect, useMemo, useState} from "react";
import {ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useTheme} from "./theme";

//firebase
import {auth, db} from "./firebase";
import {collection, onSnapshot, query} from "firebase/firestore";

type ModuleColor = "red" | "orange" | "green";

function isModuleColor(value: any): value is ModuleColor {
    return value === "red" || value === "orange" || value === "green";
}

export default function Progress() {
    const {colors} = useTheme();
    const user = auth.currentUser;

    const [modules, setModules] = useState<any[]>([])
    const [loading, setLoading] = useState(true);

    //use module collection for current user
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const q = query(collection(db, "users", user.uid, "modules"))
        return onSnapshot(
            q, (snapshot) => {
                const data = snapshot.docs.map((d) => ({id: d.id, ...d.data()}));
                setModules(data);
                setLoading(false);
            },
            (err) => {
                console.warn("Error in progress", err);
                setLoading(false);
            }
        );
    }, [user]);

    const counts = useMemo(() => {
        const base = {red: 0, orange: 0, green: 0} as Record<ModuleColor, number>;
        for (const m of modules) {
            const c = m.color;
            if (isModuleColor(c)) {base[c] += 1;}
        }
        return base;
    }, [modules]);

    // Count modules by the three canonical color

    const items: { key: "red" | "orange" | "green"; label: string; color: string }[] = [
        {key: "red", label: "Urgent", color: "red"},
        {key: "orange", label: "Due soon", color: "orange"},
        {key: "green", label: "Completed", color: "green"},

    ];
const maxVal= Math.max(1, ...items.map((i)=> counts[i.key]));
const chartHeight =180;

const onPressBar=(key:ModuleColor) => {
    Alert.alert(items.find((i)=> i.key === key)!.label,`${counts[key]} module(s)`);
}

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.header, {color: colors.text}]}>Modules by status</Text>
            {loading ? (
                <ActivityIndicator size="large" color="blue" style={{marginTop: 30}}/>
            ) : (
                <View style={[styles.chartArea, {borderColor: colors.border}]}>
                    <View style={[styles.axis, {borderColor: colors.border}]}/>

                    <View style={styles.barsRow}>
                        {items.map((it) => {
                            const value = counts[it.key];
                            const height = (value / maxVal) * chartHeight;
                            return (
                                <View key={it.key} style={styles.barWrapper}>
                                    <Text style={[styles.valueLabel, { color: colors.text }]}>{value}</Text>

                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => onPressBar(it.key)}
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
            )}
            <Text style={[styles.hint, {color: (colors.subtleText as string) || "gray"}]}>
                Tap a bar to see the count. Add modules and set their color (red/orange/green) to update the chart.
            </Text>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, borderWidth: 2, borderRadius: 10 },
    header: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },

    chartArea: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 16,
    },
    axis: { height: StyleSheet.hairlineWidth, width: "100%", marginTop: 190 },

    barsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "flex-end",
        height: 200,
    },
    barWrapper: { alignItems: "center", width: 90 },
    valueLabel: { fontSize: 12, marginBottom: 6 },
    bar: { width: 40, borderWidth: StyleSheet.hairlineWidth, borderRadius: 6 },
    barLabel: { marginTop: 8, fontSize: 12, fontWeight: "600" },

    hint: { marginTop: 10, fontSize: 12, textAlign: "center" },
});