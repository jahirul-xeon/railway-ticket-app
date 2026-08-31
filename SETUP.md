# Railway Ticket — Setup Guide

A React Native (Expo SDK 57) app that reproduces the PHP *Railway Ticket
Management* system, using **Firebase** (Auth + Firestore) as the backend and
**React Navigation** for navigation.

---

## 1. Prerequisites

- Node.js 18+ and npm
- The **Expo Go** app on your phone (Android/iOS), or an emulator/simulator

Install dependencies (already done if you scaffolded here):

```bash
npm install
```

---

## 2. Firebase setup — the full checklist

Everything below is done once, in the [Firebase console](https://console.firebase.google.com).

### 2.1 Create the project
1. **Add project** → name it (e.g. `railway-ticket-app`) → continue.
2. Google Analytics is optional; you can disable it.

### 2.2 Register a Web app
1. On the project overview, click the **Web** icon (`</>`).
2. Give it a nickname → **Register app**.
3. Copy the `firebaseConfig` object shown.
4. Paste those values into **`src/lib/firebase.ts`** (replace the placeholders).
   *(Already filled in for the current project.)*

### 2.3 Enable Email/Password authentication
1. Left menu → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Email/Password** → **Enable** → **Save**.

### 2.4 Create the Firestore database
1. Left menu → **Build → Firestore Database → Create database**.
2. Choose a location (e.g. `asia-south1`).
3. Start in **Test mode** while developing (open read/write for 30 days).
   - When ready to lock it down, open the **Rules** tab and paste the contents
     of [`firestore.rules`](./firestore.rules) → **Publish**.

> The app **auto-seeds** stations, trains and fares into Firestore on first
> launch (`ensureSeedData()`), and also ships the same data locally as a
> fallback — so trains appear even before seeding succeeds.

That's the entire Firebase setup. No Cloud Functions, no billing needed.

### Collections created by the app
| Collection | Written by | Purpose |
|---|---|---|
| `stations`, `trains`, `meta` | app (seed) | reference data (from the SQL) |
| `users` | signup | profile: firstName, lastName, email, phone |
| `bookings` | booking | one doc per booking (passenger, seats, fare, status) |
| `seatReservations` | booking | one doc per reserved seat (deterministic id → no double-booking) |

---

## 3. Run the app

```bash
npm start
```

Then press **a** (Android), **i** (iOS), or scan the QR with Expo Go.

> **Note on the date picker:** `@react-native-community/datetimepicker` is a
> native module. It works in Expo Go for SDK 57. If you build a custom dev
> client instead, it is already configured as a plugin in `app.json`.

---

## 4. First use

1. **Sign up** with any email + a password (min 6 chars — a Firebase rule).
   *(The old SQL user `mahmud123@gmail.com / 12345` won't work: Firebase needs
   6+ char passwords, so create a fresh account.)*
2. On **Search**, pick From / To stations and a date → **Search Trains**.
3. Pick a train → a class → seats → passenger & payment → **Confirm & Pay**.
4. See it under **My Tickets** (pull to refresh; cancel frees the seats).

---

## 5. How this maps to the PHP project

| PHP file | App equivalent |
|---|---|
| `login.php` | `AuthContext.login` (Firebase Auth) |
| *(register)* | `AuthContext.signup` + `users` doc |
| `stations.php` | `getStations()` |
| `search_trains.php` | `searchTrains()` |
| `seats.php` | `getSeats()` (seat map) |
| `book_ticket.php` | `createBooking()` — atomic Firestore transaction |
| `my_bookings.php` | `getMyBookings()` |
| cancel (web app) | `cancelBooking()` |

The booking transaction re-checks every seat inside a Firestore transaction,
exactly like the PHP `SELECT ... FOR` guard, so two phones can't grab the same
seat at once.

---

## 6. Project structure

```
App.tsx                     # providers + splash + auth switch
index.ts                    # entry (registerRootComponent)
src/
  lib/firebase.ts           # Firebase init (paste your config here)
  constants/
    appTheme.ts             # colours / spacing
    seedData.ts             # stations, trains, classes, fares (from the SQL)
  context/AuthContext.tsx   # login / signup / logout + profile
  services/api.ts           # Firestore data layer (the "endpoints")
  navigation/               # React Navigation stacks + tabs
  components/               # Button, Field, Card, StationPicker, ...
  screens/                  # Splash, Login, Signup, Home, Results,
                            #   Seats, Passenger, Confirmation,
                            #   MyBookings, Profile
firestore.rules             # paste into Firestore → Rules when going live
```
