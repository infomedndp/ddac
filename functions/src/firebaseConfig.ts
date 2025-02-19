// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQsmQdeBFsXR6hWfiPXTwip908rsY98Pg",
  authDomain: "infomed-financial-app.firebaseapp.com",
  projectId: "infomed-financial-app",
  storageBucket: "infomed-financial-app.firebasestorage.app",
  messagingSenderId: "948230987533",
  appId: "1:948230987533:web:b7c15be80a838be8c99a44",
  measurementId: "G-5ENWNL5TG4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { db };
