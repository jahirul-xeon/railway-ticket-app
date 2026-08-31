// ============================================================
// Firebase initialisation
// ------------------------------------------------------------
// Fill in firebaseConfig with the values from your Firebase project:
//   Firebase console -> Project settings -> "Your apps" -> Web app (</>)
//
// Then enable, in the console:
//   * Authentication  -> Sign-in method -> Email/Password  (Enable)
//   * Firestore Database -> Create database
//       (start in "test mode" while building; later paste firestore.rules)
//
// The reference data (stations, trains, fares) is written automatically
// the first time the app runs — see services/api.ts -> ensureSeedData().
// ============================================================
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// getReactNativePersistence ships only in Firebase's React Native build, so it
// is absent from the default web type definitions even though Metro resolves it
// at runtime. Pulling it via require keeps `tsc` happy without a directive that
// an import-organiser would strip.
const { getReactNativePersistence } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyAJ_Bc0a5t4PIKYwS7fNNDAF7ikgF5jxOw",
  authDomain: "railway-ticket-app.firebaseapp.com",
  projectId: "railway-ticket-app",
  storageBucket: "railway-ticket-app.firebasestorage.app",
  messagingSenderId: "1067919477066",
  appId: "1:1067919477066:web:68943961e6e24f04bd99b3",
  measurementId: "G-9D6967XG8C",
};

// Avoid re-initialising on Fast Refresh.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;
