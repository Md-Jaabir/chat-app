import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";

  import { getAuth,signInWithEmailAndPassword,createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js'

  import { getDatabase,get,set,ref,child,push,update} from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js'

  const firebaseConfig = {

     apiKey: "AIzaSyCcEgSQKtMpn_EFO4CyO5qK1gRjBw1g7bI",
  authDomain: "chat-app-263f6.firebaseapp.com",
  projectId: "chat-app-263f6",
  storageBucket: "chat-app-263f6.appspot.com",
  messagingSenderId: "856233006299",
  appId: "1:856233006299:web:409a85b04a9d839cbaa8fe",
  measurementId: "G-QB4TFC1FZ7",

    realTimeDatabase:"https://chat-app-263f6-default-rtdb.firebaseio.com"

  };



  // Initialize Firebase

  const app = initializeApp(firebaseConfig);

  const analytics = getAnalytics(app);

  const db=getDatabase();

  const dbref=ref(db);

  const auth=getAuth(app);
  
 export default {db,get,set,ref,auth,child,push,update,signInWithEmailAndPassword,createUserWithEmailAndPassword};
