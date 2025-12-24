
import React, {useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Switch,
    Modal,
    TextInput
} from "react-native";
import { useTheme } from "../utils/theme";
import {useRouter} from "expo-router";
import {auth,db} from "@/utils/firebase";
import {
    deleteUser,
    signOut,
    updatePassword} from "firebase/auth";
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

  //password change modal state
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const[savingPassword, setSavingPassword] = useState(false);

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

  const handleSaveNewPassword = async () => {
      const user = auth.currentUser;
      if(!user){
          Alert.alert("you are not signed in currently", "please sign-in and try again later");
      return;}

      const password= newPassword.trim();
      if(password.length < 6){
          Alert.alert("password must be at least 6 characters");
          return;
      }
      try{
          setSavingPassword(true);
          await updatePassword(user, password);
          Alert.alert("Password changed successfully");
          setShowPassword(false);
          setNewPassword("");
      }catch(e:any){
          Alert.alert("failed to change password", e.message || "please try again later");
      }finally{
          setSavingPassword(false);
      }
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
            <TouchableOpacity style={styles.itemRow} activeOpacity={0.8} onPress={() => setShowPassword(true)}>
                <Text style={[styles.icon, { color: colors.text }]}>🛡️</Text>
                <Text style={[styles.itemText, { color: colors.text }]}>Password and security</Text>
            </TouchableOpacity>
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

        {/*password change modal*/}
        <Modal visible={showPassword} animationType="slide" onRequestClose={()=>setShowPassword(false)}
               transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalCard,{backgroundColor: colors.card}]}>
                    <Text style={[styles.modalTitle,{color: colors.text}]}> Change Password</Text>
                    <TextInput style={[styles.input, {borderColor: colors.border, color: colors.text}]}
                               secureTextEntry
                               placeholder="Enter new password"
                               value={newPassword}
                               onChangeText={setNewPassword}
                               placeholderTextColor="lightgray"/>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, {backgroundColor: "lightgray"}]}
                            onPress={()=>{
                                setShowPassword(false);
                                setNewPassword("");
                            }}
                            disabled={savingPassword}>
                            <Text style={{fontWeight: "700"}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton,{backgroundColor: "black"}]}
                                          onPress={handleSaveNewPassword}
                                          disabled={savingPassword}
                                          >
                            {savingPassword?(<ActivityIndicator color="white" size="small"/>):(
                                <Text style={{color: "white", fontWeight: "700"}}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 16,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 12,
        textAlign: "center",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        color: "black",
    },
    modalButtons: {
        flexDirection: "row",
        gap: 10,
    },
    modalButton: {
        flex: 1,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
});
