import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js'

import { getDatabase, get, set, ref, child, push, update, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js'

const firebaseConfig = {
  apiKey: "AIzaSyAZ0dZ1BWE_GLs7J0LosBTV3P_47aSl_Xs",
  authDomain: "flychat-e6057.firebaseapp.com",
  databaseURL: "https://flychat-e6057-default-rtdb.firebaseio.com",
  projectId: "flychat-e6057",
  storageBucket: "flychat-e6057.appspot.com",
  messagingSenderId: "932936050775",
  appId: "1:932936050775:web:d81eab16d975a788a91b12",
  measurementId: "G-R78N03BNZH",
  realTimeDatabase: "https://flychat-e6057-default-rtdb.firebaseio.com"
};



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const db = getDatabase();

const dbref = ref(db);

const auth = getAuth(app);



function setActiveTime(userId) {
  let updates = {};
  updates[`users/${userId}/lastActive`] = Date.now();
  update(ref(db), updates).then(data => {
    console.log(data);
  });
  setInterval(() => {
    let date = Date.now();
    updates[`users/${userId}/lastActive`] = userId + "/" + date;
    update(ref(db), updates).then(data => {

    });
  }, 15000);
}

export default { db, get, set, ref, onValue, auth, child, push, update, signInWithEmailAndPassword, createUserWithEmailAndPassword, setActiveTime, remove };
