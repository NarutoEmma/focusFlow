import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import React,{useEffect, useState} from "react";
import { View, Alert, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "./theme";

//Home screen with navigation shortcuts
export default function Home() {
  const router = useRouter();
  const { colors } = useTheme();
  const [userEmail, setUserEmail] = useState("Student");

  //check what user is logged in when the screen loads
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth,(user) =>{
            if(user && user.email){
                const name = user.email.split("@")[0];
                setUserEmail(name.charAt(0).toUpperCase() + name.slice(1));
            }
            else{
                router.replace("/");
            }
        })
    }, []);
  //Show placeholder speak alert
  const onSpeak = () => {Alert.alert("Ai speech feature coming soon");}; // Placeholder for the SPEAK button action

    //Open notifications screen
  const onNotification = () => router.push("/notification"); // Go to the Notification screen

    //Open settings screen
  const onSetting = () => router.push("/setting"); // Go to the Setting screen

    //open begin focus screen
  const onBeginFocus = () => router.push("/begin_focus"); // Go to the Begin Focus chat screen

    //Open modules screen
  const onModules = () => router.push("/modules");

  //open progress screen
  const onProgress = () => router.push("/progress"); // Placeholder for the Project button action

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
        <Text style={[styles.welcometext]}> Welcome, {userEmail}</Text>
      {/* Top Left: Setting */}
      <TouchableOpacity style={[styles.topButton, styles.topLeft, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={onSetting} activeOpacity={0.8}>
        <Ionicons name="settings-outline" size={18} color={typeof colors.text === 'string' ? colors.text as string : undefined} style={styles.icon} />
        <Text style={[styles.topButtonText, { color: colors.text }]}>Setting</Text>
      </TouchableOpacity>

      {/* Top Right: Notification */}
      <TouchableOpacity style={[styles.topButton, styles.topRight, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={onNotification} activeOpacity={0.8}>
        <Ionicons name="notifications-outline" size={18} color={typeof colors.text === 'string' ? colors.text as string : undefined} style={styles.icon} />
        <Text style={[styles.topButtonText, { color: colors.text }]}>Notification</Text>
      </TouchableOpacity>

      {/* Center: Round Blue SPEAK Button */}
      <TouchableOpacity style={styles.speakButton} onPress={onSpeak} activeOpacity={0.8}>
        <Text style={styles.speakText}>SPEAK</Text>
      </TouchableOpacity>

      {/* Add Modules */}
      <TouchableOpacity style={styles.middleButton} onPress={onModules} activeOpacity={0.8}>
        <Text style={styles.middleButtonText}>Modules</Text>
      </TouchableOpacity>

      {/* Opposite side: Project button with chart icon and text underneath */}
      <TouchableOpacity style={styles.projectButton} onPress={onProgress} activeOpacity={0.8}>
        <Ionicons name="stats-chart" size={18} color="white" style={styles.projectIcon} />
        <Text style={styles.projectButtonText}>Progress</Text>
      </TouchableOpacity>


      {/* Bottom: Begin Focus Button */}
      <TouchableOpacity style={styles.bottomButton} onPress={onBeginFocus} activeOpacity={0.8}>
        <Text style={styles.bottomButtonText}>Begin Focus</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "white",
  },
  // Top rectangle buttons
  topButton: {
    position: "absolute",
    top: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "whitesmoke",
  },
  welcometext:{
      position: "absolute",
      top: 100,
      fontSize: 20,
      fontWeight: "bold",
      color: "black"

  },
  topLeft: {
    left: 20,
  },
  topRight: {
    right: 20,
  },
  icon: {
    marginRight: 6,
  },
  topButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
  },
  // Center round SPEAK button
  speakButton: {
    width: 160,
    height: 160,
    borderWidth: 4,
    borderRadius: 80,
    borderColor: "red",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "blue",
    shadowColor: "green",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  speakText: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
  },
  // Bottom begin focus button
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

  middleButton: {
    position: "absolute",
    bottom: 200,
    right: 0,
    alignSelf: "center",
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  middleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  projectButton: {
    position: "absolute",
    bottom: 200,
    left: 0,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  projectIcon: {
    marginBottom: 4,
  },
  projectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
