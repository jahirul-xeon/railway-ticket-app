# Building an Android APK with EAS

EAS Build compiles the app on Expo's cloud servers under **your** Expo account
(free to create). The `preview` profile in `eas.json` produces an installable
**APK**.

## One-time setup
1. Create a free account at https://expo.dev.
2. Install the CLI and log in:
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. Link the project to your account (adds a project id to `app.json`):
   ```bash
   eas build:configure
   ```

## Build the APK
```bash
eas build -p android --profile preview
```

- On the first build, EAS offers to **generate an Android Keystore** — choose
  **Yes** (EAS stores and reuses it).
- The build runs in the cloud; when it finishes the terminal prints a URL where
  you can **download the `.apk`** (also visible under *Builds* on expo.dev).
- Copy the APK to an Android phone and install it (allow "install from unknown
  sources").

## Build profiles (`eas.json`)
| Profile | Output | Use for |
|---|---|---|
| `preview` | **APK** | sideloading / sharing directly |
| `production` | AAB (app-bundle) | uploading to Google Play |
| `development` | APK + dev client | debugging on device |

## Bumping the version
`appVersionSource` is `local`, so before each new build increment
`android.versionCode` in `app.json` (1 → 2 → 3 …). The user-facing `version`
(e.g. `1.0.0`) can stay or change as you like.

## Faster local alternative (no cloud, needs Android Studio + JDK 17)
```bash
eas build -p android --profile preview --local
# or a plain release build:
npx expo run:android --variant release
```

## Notes
- Firebase works out of the box — this app uses the Firebase **JS SDK** with the
  config in `src/lib/firebase.ts`, so no `google-services.json` is required.
- `expo-print` / `expo-sharing` / the date picker are native modules; in a real
  APK build (unlike Expo Go) the share sheet works fully.
