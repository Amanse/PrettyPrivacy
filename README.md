# PrettyPrivacy 

PrettyPrivacy is a simple OpenPGP encryption application for Android. Built with React Native (Expo). <br />
[Pretty Good Privacy](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) <br />
<sup>This app uses AI generated code in places</sup>

<img width="128" height="128" alt="pretty privacy logo" src="https://github.com/user-attachments/assets/32350382-619b-4657-95a6-dc9307b7559b" />

***

<a href="https://www.buymeacoffee.com/sanuki" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
[![TestFlight](https://img.shields.io/badge/TestFlight-Join_Beta-007AFF?style=for-the-badge&logo=testflight&logoColor=white)](https://testflight.apple.com/join/Nwp2zR9z)

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

<img width="603" height="1311" alt="Screenshot 2026-04-12 at 8 52 04 PM" src="https://github.com/user-attachments/assets/e6874e06-0ed5-4e0a-aec5-28dc473245e0" />
<img width="603" height="1311" alt="Screenshot 2026-04-12 at 8 52 29 PM" src="https://github.com/user-attachments/assets/8c6d3e8c-0362-40ac-8844-520ea40ce8db" />
<img width="603" height="1311" alt="Screenshot 2026-04-12 at 8 54 53 PM" src="https://github.com/user-attachments/assets/65464d2d-f1ee-48e4-868d-02a42fd0da67" />
<img width="603" height="1311" alt="Screenshot 2026-04-12 at 8 53 04 PM" src="https://github.com/user-attachments/assets/f450b6a5-5138-4204-b5d8-2fdbb47aa2e7" />
