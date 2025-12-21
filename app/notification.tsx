//notification screen: scrollable list of simple card
import React, {useEffect, useMemo, useState} from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import { useTheme } from "../utils/theme";
import {useRouter} from "expo-router";
import {auth, db} from "../utils/firebase";
import {getDocs,collection, onSnapshot, orderBy, query, writeBatch} from "firebase/firestore";

type NotificationItem= {
    id: string;
    text: string;
    type?: "reminder"| "system"| "ai"| "progress";
    route?: string;
    moduleId?: string;
    severity?: "red" |"orange" | "green";
    createdAt?: any;
};

//notifications screen with list and actions
export default function Notification() {
    const {colors} = useTheme();
    const router = useRouter();
    const user = auth.currentUser;
    const [item, setItem] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            const list: NotificationItem[] = snap.docs.map((d) => {
                const data = d.data() as any;
                return {
                    id: d.id,
                    text: data.text || "",
                    type: data.type,
                    route: data.route,
                    moduleId: data.moduleId,
                    severity: data.severity,
                    createdAt: data.createdAt,
                };
            });
            setItem(list);
            setLoading(false);
        });
        return unsub;
    }, []);

    //calculate timestamp to relative time
    const formatRelative = (ts: any) => {
        try {
            const ms = ts && typeof ts.toDate === "function" ? ts.toDate().getTime() : Number(ts) || Date.now();
            const diff = Date.now() - ms;
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return "just now";
            if (mins < 60) return `${mins}m ago`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}h ago`;
            const days = Math.floor(hrs / 24);
            return `${days}d ago`;
        } catch {
            return "";
        }
    };
    //pick specific icon name relative to specific notification
    const iconName = (item: NotificationItem) => {
        if (item.severity === "red") return "alert-circle";
        if (item.severity === "orange") return "alert";
        switch (item.type) {
            case "progress":
                return "chart-line";
            case "system":
                return "information-outline";
            case "reminder":
                return "bell-outline";
            case "ai":
            default:
                return "robot";
        }

    }
    //open modules screen for item
    const press = (item: NotificationItem) => {
        router.push({ pathname: "/modules", params: item.moduleId ? { moduleId: item.moduleId } : {} })
    };

    //delete all notifications for current user
    const clearAllNotifications= async()=>{
        if(!user) return;
        Alert.alert("clear notifications", "delete all notifications?",[{
            text:"cancel", style:"cancel"},{
            text: "delete", style:"destructive",
            onPress: async () => {
                try{
                    setDeleting(true);
                    const col = collection(db, "users", user.uid, "notifications");
                    const snap= await getDocs(col);
                    if(snap.empty){
                        setDeleting(false);
                        return;
                    }
                    const batch = writeBatch(db);
                    snap.docs.forEach((d) => batch.delete(d.ref));
                    await batch.commit();
                } catch(e){
                    console.log("failed to clear notifications ",e);
                }
                finally{
                    setDeleting(false);
                }
            }
        }])
    }

    const sorted = useMemo(() => item, [item]);

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>

            <View style={styles.rightIcons}>
                <TouchableOpacity
                    accessibilityLabel="Clear all notification"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={clearAllNotifications} disabled={deleting}>
                    <Ionicons name="trash-outline" size={20} color={typeof colors.text === "string" ? (colors.text as string) : undefined} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large"
                                   color={typeof colors.text === "string" ? (colors.text as string) : undefined}
                                   style={{marginTop: 50}}/>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {sorted.length === 0 ? (
                        <Text style={{textAlign: "center", marginTop: 40, color: colors.subtleText as string}}>
                            No notifications yet
                        </Text>
                    ) : (
                        sorted.map((item, idx) => (
                            <TouchableOpacity key={item.id} style={[styles.card, idx === 0 ? styles.firstCard : null, {
                                backgroundColor: colors.card,
                                borderColor: colors.border
                            },]}
                                              activeOpacity={0.8} onPress={() => press(item)}>
                                <View style={styles.textRow}>
                                    <Text style={[styles.notificationText, {color: colors.text}]} numberOfLines={3}>
                                        {item.text}
                                    </Text>
                                    <Text
                                        style={[styles.timeText, {color: colors.subtleText as string}]}>{formatRelative(item.createdAt)}</Text>
                                </View>
                                <View style={[styles.iconBubble, {
                                    backgroundColor: colors.border,
                                    borderColor: colors.border
                                }]}>
                                    <MaterialCommunityIcons
                                        name={iconName(item)}
                                        size={16}
                                        color={typeof colors.text === "string" ? (colors.text as string) : undefined}
                                    />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
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
      padding: 14,
      paddingRight: 16,
      paddingBottom: 36,
      paddingLeft: 40,
  },
  firstCard: {
    justifyContent: "flex-start",
  },
    textRow: { flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12 },
    timeText: { fontSize: 12,
        fontWeight: "500",
        alignSelf: "flex-start",
        opacity: 0.8 },


    notificationText: {
      flex: 1,
    color: "black",
    fontSize: 14,
    fontWeight: "600",
  },
  iconBubble: {
    position: "absolute",
    top: 10,
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
    rightIcons: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
    },
});
