import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/theme";

// Firebase
import { auth, db } from "../utils/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function SignUp() {
    const { colors } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email.trim()) return "Please enter an email.";
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        if (password !== confirm) return "Passwords do not match.";
        return null;
    };

    const ensureUserDoc = async (uid: string) => {
        const ref = doc(db, "users", uid);
        await setDoc(
            ref,
            {
                email: email.trim().toLowerCase(),
                displayName: displayName.trim() || null,
                photoURL: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        );
    };

    const onSignUp = async () => {
        const err = validate();
        if (err) {
            Alert.alert("Sign up", err);
            return;
        }
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            if (displayName.trim()) {
                await updateProfile(cred.user, { displayName: displayName.trim() });
            }
            //create profile in Firestore
            await ensureUserDoc(cred.user.uid);

            try {
                await sendEmailVerification(cred.user);
            } catch {}

            router.replace("/home");
        } catch (e: any) {
            let message = "Failed to create account. Please try again.";
            switch (e?.code) {
                case "auth/email-already-in-use":
                    message = "This email is already in use.";
                    break;
                case "auth/invalid-email":
                    message = "Invalid email address.";
                    break;
                case "auth/weak-password":
                    message = "Password is too weak.";
                    break;
                case "auth/network-request-failed":
                    message = "Network error. Check your connection.";
                    break;
            }
            Alert.alert("Sign up", message);
        } finally {
            setLoading(false);
        }
    };

    const goToSignIn = () => router.replace("/home");

    return (
        <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Create your account</Text>

                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Display name (optional)"
                    placeholderTextColor={colors.subtleText as string}
                    autoCapitalize="words"
                    value={displayName}
                    onChangeText={setDisplayName}
                    returnKeyType="next"
                />

                <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="Email"
                    placeholderTextColor={colors.subtleText as string}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                />

                <View style={[styles.passwordRow, { borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: colors.text }]}
                        placeholder="Password (min 6 chars)"
                        placeholderTextColor={colors.subtleText as string}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        returnKeyType="next"
                    />
                    <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={typeof colors.text === "string" ? (colors.text as string) : undefined}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[styles.passwordRow, { borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.passwordInput, { color: colors.text }]}
                        placeholder="Confirm password"
                        placeholderTextColor={colors.subtleText as string}
                        secureTextEntry={!showConfirm}
                        value={confirm}
                        onChangeText={setConfirm}
                        returnKeyType="done"
                        onSubmitEditing={onSignUp}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons
                            name={showConfirm ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={typeof colors.text === "string" ? (colors.text as string) : undefined}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: "black" }]}
                    onPress={onSignUp}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={goToSignIn} style={styles.secondaryLink}>
                    <Text style={[styles.secondaryLinkText, { color: colors.text }]}>
                        Already have an account? Sign in
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.hint, { color: colors.subtleText as string }]}>
                    By creating an account, you agree to our Terms and Privacy Policy.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center" },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    passwordRow: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 2,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    passwordInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
    primaryButton: {
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    primaryButtonText: { color: "white", fontWeight: "800", fontSize: 16 },
    secondaryLink: { alignSelf: "center", marginTop: 16 },
    secondaryLinkText: { fontWeight: "700" },
    hint: { marginTop: 16, textAlign: "center", fontSize: 12 },
});