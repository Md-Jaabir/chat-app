
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCDzIBns3Pw1KNcvU5DquPC4IsnbMbYucw",
    authDomain: "fly-chat-ea6a1.firebaseapp.com",
    databaseURL: "https://fly-chat-ea6a1-default-rtdb.firebaseio.com",
    projectId: "fly-chat-ea6a1",
    storageBucket: "fly-chat-ea6a1.firebasestorage.app",
    messagingSenderId: "742719901155",
    appId: "1:742719901155:web:2d766ee365e8cc1788a4d6",
    measurementId: "G-VYRLPNTKVP"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
