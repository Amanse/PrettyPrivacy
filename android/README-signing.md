# Android release signing

Release signing uses two local, ignored files:

- `app/release-upload.keystore` — the private upload keystore
- `.release-keystore-password` — the keystore and `upload` key password

The public certificate is exported as `upload_certificate.pem`. It is safe to
share with Google Play when requesting an upload-key reset, but it is ignored
here to keep signing artifacts together.

Back up the private keystore and password in a secure password manager or
encrypted vault. Neither file can be recovered from Git after the history
cleanup.
