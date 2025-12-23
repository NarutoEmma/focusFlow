// Begin Focus: chat UI with bottom input bar
import React, { useRef, useState, useEffect } from "react";
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, FlatList, Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Speech from "expo-speech"
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../utils/theme";
import{useRouter} from "expo-router";
import {auth,db} from "../utils/firebase";
import {onAuthStateChanged} from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
type Role = "user" | "ai";

type Message = {
  id: string;
  role: Role;
  text: string;
};

const API_URL= Platform.select({
    ios: "http://192.168.0.19:3000/api/chat",
    android: "http://192.168.0.19:3000/api/chat", // Android emulator
    default: "http://192.168.0.19:3000/api/chat",
})
const API_KEY= "my-very-secret-string";

//helper to compute days left for each module
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysUntil = (due: Date | null) => {
    if (!due) return null;
    const today = startOfDay(new Date());
    const end = startOfDay(due);
    return Math.ceil((end.getTime() - today.getTime()) / MS_PER_DAY);
};

type ModuleSummary = {
    id: string;
    title: string;
    dueDate?: Date | null;
    daysLeft?: number | null
    completed?: boolean;
};

const initialWelcomeMessage: Message={
        id: "m1",
        role: "ai",
        text: "Hi! What would you like to focus on today?" };

const userStorageKey = (uid: string)=>`begin_focus:${uid}:messages_v1`;

export default function BeginFocus() {
    //authenticate user
    const router = useRouter();
    const[uid, setUid]= useState<string|null>(null);
    const[displayName, setDisplayName]= useState<string>("");

    useEffect(() => {
        const unsub= onAuthStateChanged(auth,(u)=>{
            if(!u){
                setUid(null);
                router.replace("/")
                return
            }
            setUid(u.uid);

            //get name from firebase so the ai can personalize responses
            setDisplayName(
                (u.displayName && u.displayName.trim()) ||
                (u.email ? u.email.split("@")[0] : "") ||
                ""
            );
        });
        return unsub;
    },[router]);

    const [text, setText] = useState("");
    const [messages, setMessages] = useState<Message[]>([initialWelcomeMessage]);
    const[sending, setSending] = useState(false);
    const[speaking, setSpeaking] = useState<boolean>(false); //tts playback state

    //layout helpers
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();
    const listRef = useRef<FlatList<Message>>(null);
    const { colors } = useTheme();

    //Keyboard offset
    const keyboardOffset = Platform.select({ ios: headerHeight, android: headerHeight + 8 }) as number;

    const [modules, setModules] = useState<ModuleSummary[]>([]);
    //load messages for current user from async storage
    useEffect(() => {
        (async ()=>{
            if(!uid){
                setMessages([initialWelcomeMessage]);
                setText("");
                return;
            }
            try {
                const key = userStorageKey(uid)!;
                const raw = await AsyncStorage.getItem(key);
                if(raw){
                    const saved = JSON.parse(raw) as Message[];
                    if(Array.isArray(saved) && saved.length>0){
                        setMessages(saved);
                        return;
                    }
                }
                //if no saved messages for current user, start afresh
                setMessages([initialWelcomeMessage]);
            } catch (e){
                console.log("failed to load messages ",e);
                setMessages([initialWelcomeMessage]);
            } finally {
                setText("")
            }
        })();
    }, [uid]);

    //subscribe to modules for current user
    useEffect(() => {
        if(!uid) {setModules([]); return;}
        const q = query(collection(db,"users",uid, "modules"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap)=>{
            const list: ModuleSummary[] = snap.docs.map((d)=>{
                const data = d.data() as any;
                const due =
                    data?.dueDate?.toDate? data.dueDate.toDate():
                        typeof data?.dueDate ==="string"|| typeof data?.dueDate ==="number"? new Date(data.dueDate):
                            null;
                return {
                    id: d.id,
                    title: data.title,
                    dueDate: due,
                    daysLeft: daysUntil(due),
                    completed: data.completed,
                };
                });
            setModules(list);
        });
        return unsub;
    }, [uid]);
//persist messages per user upon change
    useEffect(() => {
        if(!uid) return;
        const key = userStorageKey(uid)!;
        const timeout = setTimeout(()=>{
            AsyncStorage.setItem(key, JSON.stringify(messages)).catch(()=>{});
        }, 100);
        return () => clearTimeout(timeout);
    }, [messages, uid]);

    //auto-scroll to the bottom of chat
    useEffect(() => {
        const timeout = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }),50);
        return () => clearTimeout(timeout);
    },[messages]);

    //clear saved chat session for the current user
    async function clearSession(){
        try{
            if(uid) {
                const key = userStorageKey(uid)!;
                await AsyncStorage.removeItem(key);
            }
        }catch(e){
            console.log("failed to clear session",e);
        }
        setMessages([initialWelcomeMessage]);
        setText("");}

        //Send message and fetch AI reply
        const onSend = async () => {
            const trimmed = text.trim();
            if (!trimmed || sending || !uid) return;

            const userMsg: Message = { id: String(Date.now()), role: "user", text: trimmed };
            const nextMessage=[...messages, userMsg];

            setMessages(nextMessage);
            setText("");
            setSending(true);

            try{
                const key = userStorageKey(uid)!;
                await AsyncStorage.setItem(key, JSON.stringify(nextMessage)).catch(()=>{});
                //include modules context in request payload
                const modulesPayload = modules.map((m)=>({
                    id:m.id,
                    title: m.title,
                    daysLeft: m.daysLeft,
                    dueDate: m.dueDate ? m.dueDate.toISOString() : null,
                    completed: !!m.completed,
                }))
                const response = await fetch(API_URL!,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": API_KEY,
                        "x-user-id": uid,
                        "x-user-name": displayName || "",//pass the current user's name to ai
                    },
                    body: JSON.stringify({messages:nextMessage,
                    modules:modulesPayload}),
                });

                if(!response.ok){
                    const errorText = await response.text();
                    throw new Error(`API error ${response.status}: ${errorText}`);
                }
                const data = await response.json();
                const aiText: string = data?.reply?? " i couldnt generate a reply,";
                const aiMessage: Message = {id: String(Date.now()+1), role: "ai", text: aiText};
                const finalMessage =[...nextMessage, aiMessage];
                setMessages(finalMessage);
                await AsyncStorage.setItem(key, JSON.stringify(finalMessage)).catch(()=>{});
            } catch(err:any){
                const aiMsg: Message= {
                    id: String(Date.now()+1),
                    role: "ai",
                    text: err?.message || "network error please try again",
                };
                const errMessage = [...nextMessage, aiMsg];
                setMessages(errMessage);
                if(uid){
                    const key = userStorageKey(uid)!;
                    await  AsyncStorage.setItem(key, JSON.stringify(errMessage)).catch(()=>{});
                }
            } finally{
                setSending(false);
            }
        };
        //read ai responses with tts
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
                            <TouchableOpacity accessibilityLabel="Send" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={onSend} disabled={sending || !uid} >
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
