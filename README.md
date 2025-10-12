# PrettyPrivacy 

PrettyPrivacy is a simple OpenPGP encryption application for Android. Built with React Native (Expo). <br />
[Pretty Good Privacy](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) <br />
<sup>This app uses AI generated code in places</sup>

<img width="128" height="128" alt="pretty privacy logo" src="https://github.com/user-attachments/assets/32350382-619b-4657-95a6-dc9307b7559b" />

***

## Features

-   File and text encryption and decryption
-   Import keys from file/Clipboard or generate one in the app
-   Save password for keys with biometrics, Stored in android's secure store with encryption phrase.
-   Private keys are stored in encrypted mmkv store.
-   Sign and verify files and messages

***

## Installation

```bash
cd android && ./gradlew app:assembleRelease
```
and install the generated apk file. Github releases coming soon.

***

## How to Use

1.  **Import Your Keys:** Go to the 'Keys' tab and import your PGP private key and the public keys of your contacts.
2.  **Share public key:**: If you generated key in app, you can long click on key to copy public key which someone else can import.
3.  **Encrypt/Decrypt:** For encryption choose whom to encrypt for and enter text or select files.

## Screenshots

<img width="540" height="1200" alt="Screenshot_1759068406" src="https://github.com/user-attachments/assets/f5f570af-b6a9-4713-8729-bdfc9273dc4a" />
<img width="540" height="1200" alt="Screenshot_1759068452" src="https://github.com/user-attachments/assets/1dd01427-714a-4d74-8bc1-75bb4f40f457" />
<img width="540" height="1200" alt="Screenshot_1759068471" src="https://github.com/user-attachments/assets/d32f5d2e-cfbf-495f-a4d4-48ce47aedd32" />
<img width="540" height="1200" alt="Screenshot_1759068484" src="https://github.com/user-attachments/assets/c3a75027-a737-47b0-8284-1dcf4b8d4172" />
<img width="540" height="1200" alt="Screenshot_1759068501" src="https://github.com/user-attachments/assets/bd65b2e2-764b-4b37-8980-3f4626062917" />
<img width="540" height="1200" alt="Screenshot_1760292077" src="https://github.com/user-attachments/assets/b7112e1e-d6be-4ba9-8367-092e76ec8fc4" />
