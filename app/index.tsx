import React, { useState } from "react"; // Import React and the useState hook to store input values
import {Text, Alert, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native"; // Import basic UI building blocks
import { useRouter } from "expo-router"; // Import navigation helper to move between screens
import { useTheme } from "../utils/theme";

//firebase imports
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../utils/firebase"

//login screen component
export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  //handle login and navigate to home
  const onLogin = async () => {
    //navigate to Home page
    if(email===""||password===""){
        Alert.alert("please enter both email and password")
        return;
    }
    setLoading(true);
    try{
        await signInWithEmailAndPassword(auth,email,password);

        router.replace("/home");
    }
    catch(error: any){
        let messaage = "Something went wrong";
        if(error.code ==="auth/invalid-credential") messaage = "Invalid email or password";
        if(error.code ==="auth/user-not-found") messaage = "User not found";
        Alert.alert("login failed", messaage);
    }
    finally{
        setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>WELCOME TO FOCUSFLOW</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor={typeof colors.subtleText === 'string' ? colors.subtleText as string : undefined}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          placeholderTextColor={typeof colors.subtleText === 'string' ? colors.subtleText as string : undefined}
          secureTextEntry //hide password characters as dots for privacy
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.button, {opacity: loading ? 0.7:1}]}
          onPress={onLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading? (
              <ActivityIndicator size="small" color="white" />) : (
                  <Text style = {styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/*sign up prompt */}
        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.subtleText as string | undefined }]}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")} activeOpacity={0.7}>
            <Text style={[styles.signupLink, { color: colors.primary as string | undefined }]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "white",
      borderWidth: 2,
      borderRadius: 10,
  },
  form: {
    width: "100%",
    maxWidth: 360,
    alignItems: "stretch",
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    color: "black",
  },
  input: {
    height: 48,
    borderColor: "lightgray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "dodgerblue",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  signupRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
