// Begin Focus: chat UI with bottom input bar
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./theme";

type Role = "user" | "ai";

type Message = {
  id: string;
  role: Role;
  text: string;
};

export default function BeginFocus() {
  // State
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", role: "ai", text: "Hi! What would you like to focus on today?" },
  ]);

  // Layout helpers
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const { colors } = useTheme();

  // Keyboard offset
  const keyboardOffset = Platform.select({ ios: headerHeight, android: headerHeight + 8 }) as number;

  // Auto-scroll to bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timeout);
  }, [messages]);

  // Send a message and simulate a short AI reply
  const onSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: Message = { id: String(Date.now()), role: "user", text: trimmed };
    setMessages((prev) => [...prev, newMsg]);
    setText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "ai", text: "Okay, lets start with the basics." },
      ]);
    }, 500);
  };

  // Render a single chat bubble (left for AI, right for user)
  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
        </View>

        {/* Small microphone button to the right of AI messages for text-to-speech */}
        {!isUser && (
          <TouchableOpacity
            accessibilityLabel="Text to speech"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.ttsButton}
            onPress={() => { /* reserved for future TTS playback */ }}
          >
            <Ionicons
              name="mic-outline"
              size={18}
              color={typeof colors.text === 'string' ? (colors.text as string) : undefined}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const keyExtractor = (item: Message) => item.id;

  return (
    // Keyboard-avoiding container
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={keyboardOffset}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 12, paddingBottom: 12 }}
        style={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.bottomBar, { paddingBottom: Math.max(16, insets.bottom), backgroundColor: colors.card }]}>
        <View style={[styles.inputPill, { borderColor: colors.border, backgroundColor: colors.card }] }>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Ask anything"
            placeholderTextColor={typeof colors.subtleText === 'string' ? colors.subtleText as string : undefined}
            value={text}
            onChangeText={setText}
            returnKeyType="send"
            onSubmitEditing={onSend}
          />

          <View style={styles.rightIcons}>
            <TouchableOpacity accessibilityLabel="Voice input" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="mic-outline" size={20} color={typeof colors.text === 'string' ? colors.text as string : undefined} />
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity accessibilityLabel="Office" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="briefcase-outline" size={20} color={typeof colors.text === 'string' ? colors.text as string : undefined} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
      borderWidth: 2,
      borderRadius: 10,
  },
  list: {
    flex: 1,
  },
  row: {
    width: "100%",
    marginBottom: 8,
    flexDirection: "row",
  },
  rowLeft: {
    justifyContent: "flex-start",
  },
  rowRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "78%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "lightgrey",
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "dodgerblue",
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  aiText: {
    color: "black",
  },
  userText: {
    color: "white",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 16, android: 16 }) as number,
    backgroundColor: "white",
  },
  inputPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "lightgray",
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 14,
  },
  textInput: {
    flex: 1,
    height: 44,
    color: "black",
    paddingVertical: 0,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  ttsButton: {
    marginLeft: 10,
    alignSelf: "center",
    padding: 4,
    borderRadius: 12,
  },
});
