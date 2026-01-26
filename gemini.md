# Gemini Agent Notes

This file is for the Gemini agent's internal notes and observations about the project.

## Project Structure and Conventions:
- React Native project using Expo.
- Uses native UI components (`components/ui/*`) instead of a UI library.
- Navigation handled by `expo-router`.
- Cryptographic operations are in `helpers/cryptoOps.js`.
- Key management is in `helpers/keyManager.js`.
- Context API is used via `helpers/contextProvider.js`.

## Task-Specific Notes:
- The current task involved adding scrolling to a `TextInput` component in `app/encrypt/encryptText.jsx`. This was achieved by wrapping the `TextInput` in a `ScrollView` and applying `flex: 1` to the `ScrollView`.
