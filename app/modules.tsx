import React,{useState, useEffect} from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator} from "react-native";
import { useTheme } from "./theme";
import { Ionicons } from "@expo/vector-icons";

//firebase
import { db, auth } from "./firebase";
import {writeBatch,getDoc, collection, addDoc, query, onSnapshot,deleteDoc, doc, orderBy,serverTimestamp,where, getDocs} from "firebase/firestore";

//add a notification document for a module
async function addNotificationForModule(uid: string, data: {
    text: string;
    type?: "reminder" | "system" | "ai" | "progress";
    route?: string;
    moduleId?: string;
    severity?: "red" | "orange" | "green";
}) {
    await addDoc(collection(db, "users", uid, "notifications"), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

//modules creation and management
export default function Modules(){
  const { colors } = useTheme();

  const  user = auth.currentUser;

  //state of data from firebase
  const[modules,setModules]=useState<any[]>([]);
  const[loading,setLoading]=useState(true);

  //state for add module popup
  const[isModalVisible,setIsModalVisible]=useState(false);
  const[newTitle,setNewTitle]=useState("");
  const[selectColor,setSelectedColor]=useState("orange"); //default color

  //fetch data from firebase
    useEffect(() => {
        if(!user) return;

        const q = query(
            collection(db,"users", user.uid, "modules"),
            orderBy("createdAt", "desc")
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchData = snapshot.docs.map(doc=>({
                id:doc.id,
                ...doc.data()}));
            setModules(fetchData);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    //add any new module to Firestore
    const addModule=async()=>{
        if(!newTitle.trim()){
            Alert.alert("Please enter a module title");
            return;
        }

        try{
            const title = newTitle.trim();

            const moduleRef = await addDoc(collection(db, "users", user!.uid, "modules"),{
                title,
                color:selectColor,
                createdAt: serverTimestamp()
            });

            //if new module is red/amber, a notification will be created
            if(selectColor === "red"|| selectColor=== "orange"){
                const severityLabel = selectColor === "red"?"urgent" :"amber";

                await addNotificationForModule(user!.uid,{
                    text: `New ${severityLabel} module: ${title}`,
                    type: "reminder",
                    route: "/modules",
                    moduleId: moduleRef.id,
                    severity:selectColor as "red"|"orange"
                })
            }
            //reset form and close popup
            setNewTitle("");
            setIsModalVisible(false);
        } catch(error: any){
            Alert.alert("cannot save module " + error.message);
        }
    };

    //delete notifications tied to a module
    async function deleteNotification(uid: string, moduleId: string){
        const q= query(
            collection(db,"users", uid, "notifications"),
            where("moduleId", "==", moduleId)
        );
        const snap = await getDocs(q);
        if(snap.empty) return;
        const batch = writeBatch(db);
        snap.docs.forEach((d)=> batch.delete(d.ref));
        await  batch.commit();
    }
    //delete a module by id
    const deleteModule=async(id:string)=>{
        Alert.alert("Are you sure you want to delete this module?", "", [
            {text: "Cancel"},
            {text: "delete", style:"destructive", onPress: async() =>{
                try{
                    await deleteNotification(user!.uid, id);
                    await deleteDoc(doc(db,"users",user!.uid,"modules",id));
                }catch(e: any){
                    Alert.alert("delete failed", e?.message || "please try again");
                }
                }
            }

        ]);
    }

    return (
    //overall container: "Modules"
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
        {loading? (
            <ActivityIndicator size="large" color="black"  style={{marginTop:50}}/>
        ):(
            <ScrollView contentContainerStyle={styles.content}>
                {modules.length===0 && <Text style={styles.emptyText}>No modules yet, add one</Text>}
                {modules.map((item) =>(
                    <TouchableOpacity
                        key={item.id}
                        onLongPress={()=>deleteModule(item.id)}
                        style={[styles.card,{backgroundColor:colors.card, borderColor:colors.border}]}>
                    <View style={[styles.colorSquare,{ backgroundColor: item.color }]} />
                    <Text style={[styles.titleText, {color:colors.text}]}>{item.title}</Text>
                </TouchableOpacity>))}
            </ScrollView>
        )}

        {/*add module button*/}
        <TouchableOpacity style={styles.bottomButton} onPress={()=> setIsModalVisible(true)} activeOpacity={0.8}>
            <Text style={styles.bottomButtonText}>Add Module</Text>
        </TouchableOpacity>

        {/*popup window*/}
        <Modal transparent={true} visible={isModalVisible} animationType="slide">
            <View style={styles.windowOverlay}>
                <View style={styles.windowView}>
                    <Text style={styles.windowTitle}>Add New Module</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Module Name (e.g Psychology essay)"
                        onChangeText={setNewTitle}
                        value={newTitle}/>

                    {/*color picker*/}

                    <Text style={{marginBottom:10, fontWeight:"600"}}>Select Status</Text>
                    <View style={styles.colorRow}>
                        {["red","orange","green"].map((c) => (
                            <TouchableOpacity
                            key={c}
                            style={[styles.colorButton, { backgroundColor: c, borderWidth: selectColor===c ? 3 : 0 }]}
                            onPress={() => setSelectedColor(c)}/>
                        ))}
                    </View>

                    {/*cancel and save button*/}
                    <View style={styles.windowButton}>
                        <TouchableOpacity onPress={()=>setIsModalVisible(false)} style={styles.cancelButton}>
                            <Text style={{fontWeight: "bold"}}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={addModule} style={styles.saveButton}>
                            <Text style={{color:"white", fontWeight:"bold"}}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
      borderWidth: 2,
      borderRadius: 10,
  },
  content: {
    padding: 16,
  },
  // Each rectangle (module card)
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  // Smaller rectangle on the left (color from item)
  colorSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },

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

  windowOverlay:{
      flex:1,
      backgroundColor:"rgba(0,0,0,0.5)",
      justifyContent:"center",
      alignItems:"center"
  },
   windowView:{
      backgroundColor:"white",
       width:"85%",
       alignItems:"center",
       elevation:5,
       padding:20,
       borderRadius:20,
   },
    windowTitle:{
       fontSize:20,
       fontWeight:"bold",
       marginBottom:15
    },
    windowButton:{
      flexDirection:"row",
      width:"100%",
      gap: 10
    },
    cancelButton:{
      borderRadius: 8,
      padding: 12,
      flex: 1,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor:"lightgray",
    },
    saveButton:{
      backgroundColor:"black",
      borderRadius: 8,
      padding: 12,
      flex: 1,
      justifyContent:"center",
      alignItems:"center"
    },
    input:{
      width:"100%",
        padding:10,
        borderWidth:1,
        borderColor:"gray",
        borderRadius:8,
        marginBottom:20,
    },
    colorRow:{
        flexDirection:"row",
        gap:15,
        marginBottom:25
    },
    colorButton:{
        width:40,
        height:40,
        borderColor:"black",
        borderRadius:6,
        marginRight:10,
        borderWidth:3,
    }
});
