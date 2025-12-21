
import React, {useState} from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Switch } from "react-native";
import { useTheme } from "../utils/theme";
import {useRouter} from "expo-router";
import {auth,db} from "@/utils/firebase";
import {
    deleteUser,
    signOut
}from "firebase/auth";
import {
    collection,
    getDocs,
    deleteDoc,
    doc
} from "firebase/firestore";

//Settings screen with theme toggle
export default function Setting() {
  const { isDark, toggleTheme, colors } = useTheme();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const[Deleting, setDeleting]=useState(false);
  const[Userdelete, setDeleteUser]=useState(false);

  const handleLogot = async()=>{
      try{
          setLoggingOut(true);
          await signOut(auth);

          router.replace("/");
      } catch(e: any){
          Alert.alert("failed to logout", e.message || "please try again later");
      } finally{
          setLoggingOut(false);
      }
  }
  const deleteUserAccount = async(uid: string)=>{
      const subcollections = ["notifications", "modules", "progress", "begin_focus"];
      for(const subcollection of subcollections){
          const colRef = collection(db, "users", uid, subcollection);
          const snap = await getDocs(colRef);
          const ops = snap.docs.map((d) => deleteDoc(doc(db, "users", uid, subcollection, d.id)));
          await Promise.all(ops);
      }
      await deleteDoc(doc(db,"users",uid));
  };
  const handleAccountdeletion = ()=>{
      const user = auth.currentUser;
      if(!user){
          Alert.alert("you are not signed in currently", "please sign-in and try again later");
      return;}
      Alert.alert("Are you sure you want to delete your account?", "This action cannot be undone", [
          {text: "Cancel", style: "cancel"},
          {text: "Delete", style:"destructive", onPress: async () => {
              try{
                  setDeleting(true);

                  await deleteUserAccount(user.uid);
                  await deleteUser(user);
                  router.replace("/");
              }catch(e:any){
                  if(e.code === "auth/requires-recent-login"){
                      Alert.alert("please sign-in again", "your account has been deleted");
                      try{await signOut(auth);}catch{}
                      router.replace("/");
                  }else{
                      Alert.alert("failed to delete account", e.message || "please try again later");
                  }
              }finally{
                  setDeleteUser(false);
              }

            }
          }
      ]
      );
  }

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
        <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: "red" }]}
            onPress={handleAccountdeletion}
            disabled={Deleting}
            activeOpacity={0.8}
        >
            {Deleting ? <ActivityIndicator color="white" /> : <Text style={styles.deleteButtonText}>Delete account</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.logout,{backgroundColor: "black"}]}
        onPress={handleLogot}
        disabled={loggingOut}
        activeOpacity={0.8}>
            {loggingOut? <ActivityIndicator color="white" size="small"/>:<Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
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
    logout:{
      position: "absolute",
      bottom: 32,
      alignSelf: "center",
      height: 48,
      paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        position: "absolute",
        bottom: 90,
        alignSelf: "center",
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "black",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    deleteButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    logoutText:{
      color: "red",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
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
