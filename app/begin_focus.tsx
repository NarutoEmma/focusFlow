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
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Speech from "expo-speech"
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

const STORAGE_KEY = "begin_focus_messages_v1";


const API_URL= Platform.select({
    ios: "http://192.168.0.19:3000/api/chat",
    android: "http://192.168.0.19:3000/api/chat", // Android emulator
    default: "http://192.168.0.19:3000/api/chat",
})
const API_KEY= "my-very-secret-string";

//Main chat screen component
export default function BeginFocus() {
  // State
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", role: "ai", text: "Hi! What would you like to focus on today?" },
  ]);
  const[sending, setSending] = useState(false);
  const[speaking, setSpeaking] = useState<boolean>(false); //Tts playback state

  //Layout helpers
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const { colors } = useTheme();

  //Keyboard offset
  const keyboardOffset = Platform.select({ ios: headerHeight, android: headerHeight + 8 }) as number;
    //Clear saved chat session
    async function clearSession() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.log("Failed to clear storage:", e);
        }
        setMessages([{ id: "m1", role: "ai", text: "Hi! What would you like to focus on today?" }]);
        setText("");
    }
  //load persisted saved chats
    useEffect(() => {
        (async () => {
            try{
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if(raw){
                    const saved = JSON.parse(raw) as Message[];
                    if(Array.isArray(saved) && saved.length>0){
                        setMessages(saved);
                    }
                }
            }catch(e){
                console.log("failed to load messages ",e);
            }
        })();
    }, []);
    //persist on change
    useEffect(()=>{
        const timeout = setTimeout(()=>{
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(()=>{});
        }, 100);
        return () => clearTimeout(timeout);
    }, [messages]);

  //Auto-scroll to bottom
  useEffect(() => {
    const timeout = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }),50);
    return () => clearTimeout(timeout);
    },[messages]);

    const payload = {messages};
  //Send message and fetch AI reply
  const onSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = { id: String(Date.now()), role: "user", text: trimmed };
    const nextMessage=[...messages, userMsg];

    setMessages(nextMessage);
    setText("");
    setSending(true);

    try{
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextMessage)).catch(()=>{});
        const response = await fetch(API_URL!,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
            },
            body: JSON.stringify({messages:nextMessage}),
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const aiText: string = data?.reply?? "sorry, i couldnt generate a reply,";
        const aiMessage: Message = {id: String(Date.now()+1), role: "ai", text: aiText};
        const finalMessage =[...nextMessage, aiMessage];
        setMessages(finalMessage);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(finalMessage)).catch(()=>{});
    } catch(err:any){
        const aiMsg: Message= {
            id: String(Date.now()+1),
            role: "ai",
            text: err?.message || "please try again, network error",
        };
        const errMessage = [...nextMessage, aiMsg];
        setMessages(errMessage);
        await  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(errMessage)).catch(()=>{});
    } finally{
        setSending(false);
    }
  };
  //perform tts on ai messages
    //read AI text with TTS
    const readText = (text: string) => {
        if(!text) return;
        //toggle stop if already speaking
        if(speaking){
            Speech.stop();
            setSpeaking(false);
            return;
        }
        setSpeaking(true);
        Speech.speak(text,{
            language: "en-US",
            pitch: 1.0,
            rate: Platform.OS === "ios"? 1:2.0,
            onDone:()=> setSpeaking(false),
            onError:()=> setSpeaking(false),
            onStopped:() => setSpeaking(false),
        });
    };

  //render a chat bubble row
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
            accessibilityLabel={speaking? "Stop Speech" : "Text to speech"}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.ttsButton, speaking && {opacity: 0.7}]}
            onPress={() => readText(item.text)}
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

  //extract unique key for messages
  const keyExtractor = (item: Message) => item.id;

  return (
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
          <View style={styles.rightIcons}>
              <TouchableOpacity accessibilityLabel="Clear session" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={clearSession} disabled={sending}>
                  <Ionicons name="trash-outline" size={20} color={typeof colors.text === "string" ? (colors.text as string) : undefined} />
              </TouchableOpacity>
              <View style={{ width: 12 }} />

          </View>
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
              <TouchableOpacity accessibilityLabel="Send" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onSend} disabled={sending}>
                  <Ionicons name="send" size={20} color={typeof colors.text === "string" ? (colors.text as string) : undefined} />
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
