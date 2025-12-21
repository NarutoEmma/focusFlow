/*
  Beginner-friendly guide to this file (Login screen):
  - Lines below import React, some UI components from React Native, and a navigation helper from expo-router.
  - Then we define a component called Login which is the default export for this file.
  - Inside it, we keep track of what the user types for email and password using React "state".
  - We also grab a router object so we can move to the Home screen when the user presses Login.
  - The returned JSX describes how the screen looks: a container, a form, two text inputs, and a button.
  - At the bottom, we define styles (like CSS for React Native) using StyleSheet.create.
*/
import React, { useState } from "react"; // Import React and the useState hook to store input values
import {Text, Alert, View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native"; // Import basic UI building blocks
import { useRouter } from "expo-router"; // Import navigation helper to move between screens
import { useTheme } from "../utils/theme";

//firebase imports
import {signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../utils/firebase"

//login screen component
export default function Login() { // Define the main component for this screen
  const [email, setEmail] = useState(""); // email will store what's typed in the Email field
  const [password, setPassword] = useState(""); // password will store what's typed in the Password fiel
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // router lets us navigate to other screens
  const { colors } = useTheme();

  //handle login and navigate to home
  const onLogin = async () => { // Function that runs when the Login button is pressed
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

  return ( // Describe what we want to show on the screen
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={styles.form}>
        <Text style={[styles.title, { color: colors.text }]}>WELCOME TO FOCUSFLOW</Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]} // Use the input style defined below
          placeholder="Email" // Placeholder text inside the input
          placeholderTextColor={typeof colors.subtleText === 'string' ? colors.subtleText as string : undefined} // Placeholder color
          keyboardType="email-address" // Shows an email-friendly keyboard on phones
          autoCapitalize="none" // Do not auto-capitalize text
          autoCorrect={false} // Do not auto-correct text
          value={email} // Bind the input value to our email state
          onChangeText={setEmail} // Update email state whenever the user types
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Password"
          placeholderTextColor={typeof colors.subtleText === 'string' ? colors.subtleText as string : undefined}
          secureTextEntry // Hide the characters as dots for privacy
          autoCapitalize="none"
          autoCorrect={false}
          value={password} // Bind the input value to our password state
          onChangeText={setPassword} // Update password state whenever the user types
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
      </View>
    </View>
  );
}

// Styles for the screen (similar to CSS but in JavaScript)
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up the full screen height
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 24, // Add space on the left/right
    backgroundColor: "white", // White background
      borderWidth: 2,
      borderRadius: 10,
  },
  form: {
    width: "100%", // Let the form stretch
    maxWidth: 360, // But not wider than 360 pixels
    alignItems: "stretch", // Children can stretch to the full width
  },
  title: {
    textAlign: "center", // Center the title text
    fontSize: 22, // Make it larger
    fontWeight: "700", // Make it bold
    marginBottom: 24, // Space below the title
    color: "black", // Dark gray text color
  },
  input: {
    height: 48, // Input height
    borderColor: "lightgray", // Light gray border color
    borderWidth: 1, // 1 pixel border
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 12, // Space inside the input on left/right
    marginBottom: 12, // Space below each input
    backgroundColor: "white", // White background inside the input
  },
  button: {
    height: 48, // Button height
    borderRadius: 8, // Rounded corners
    alignItems: "center", // Center the label horizontally
    justifyContent: "center", // Center the label vertically
    backgroundColor: "dodgerblue", // blue button
    marginTop: 8, // Space above the button
  },
  buttonText: {
    color: "white", // White text on the button
    fontWeight: "700", // Bold text
    fontSize: 16, // Slightly larger text
  },
});
