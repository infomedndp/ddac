import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  initializeFirestore,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

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

// Initialize Firestore with settings
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
});

// Initialize other services
const auth = getAuth(app);
const storage = getStorage(app);

// Set auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

// Initialize analytics only if supported
const analytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

// Check online status
const isOnline = () => {
  return typeof window !== 'undefined' ? window.navigator.onLine : true;
};

// Export initialized services
export {
  db,
  auth,
  storage,
  analytics,
  isOnline
};
