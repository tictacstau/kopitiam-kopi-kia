# Shipping Kopi Kia to Google Play

Everything the repo can automate is automated. This covers the parts that
need you: a signing key, four secrets, and the Play Console forms.

---

## 1. Create the upload key (once, on your Mac)

**Do this on your own machine.** Never generate a signing key in a cloud
container or CI runner, and never commit one. `*.jks`, `*.keystore` and
`keystore.properties` are gitignored.

```bash
keytool -genkeypair -v \
  -keystore ~/kopi-kia-upload.jks \
  -alias kopi-kia-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

It asks for a keystore password, a key password and your name/org. Use a
password manager; write the alias down.

**Back it up somewhere durable** (password manager, encrypted drive) before
you go further.

> Enroll in **Play App Signing** when you create the app — it is the default
> for new apps. Google then holds the actual app signing key and this file is
> only your *upload* key. If you ever lose it, Google can reset it. Without
> Play App Signing, losing this file means you can never update the app again,
> ever. Take the default.

## 2. Point the local build at it

Only needed if you want to build a release locally. CI does not use this file.

```bash
cat > android/keystore.properties <<'EOF'
storeFile=/Users/YOU/kopi-kia-upload.jks
storePassword=...
keyAlias=kopi-kia-upload
keyPassword=...
EOF
```

`android/app/build.gradle` reads it if present and skips release signing if
absent, so debug builds keep working on a fresh clone.

## 3. Add the four CI secrets

Repo → Settings → Secrets and variables → Actions → New repository secret.

```bash
base64 -i ~/kopi-kia-upload.jks | pbcopy   # macOS: puts it on the clipboard
```

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | the base64 blob you just copied |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `kopi-kia-upload` |
| `ANDROID_KEY_PASSWORD` | key password |

## 4. Build the AAB

Actions → **Build Android release AAB** → Run workflow. Give it:

- **versionName** — what players see, e.g. `1.0.0`
- **versionCode** — an integer, **higher than every previous Play upload**.
  Play rejects a duplicate. Start at `1` and increment every single upload,
  including ones you later discard.

Download the `kopi-kia-release-aab-v1.0.0` artifact. Inside is the `.aab`.

Locally instead, if you prefer:
```bash
cd android && ./gradlew bundleRelease -PappVersionName=1.0.0 -PappVersionCode=1
# -> android/app/build/outputs/bundle/release/app-release.aab
```

## 5. Play Console

One-time: create a developer account (**US$25, once, non-refundable**) at
https://play.google.com/console — allow a day or two for identity
verification before you can publish.

Create app → name `Kopi Kia: Kopitiam Game`, type **Game**, free.

Then work the "Set up your app" checklist. Copy for every text field is in
`store/play/listing.md`; the graphics are in `store/play/`.

### Data safety — the answers for this app

Verified against the source: the game has no backend, no network calls, no
analytics SDK, and stores progress only in `localStorage`.

- Does your app collect or share any of the required user data types? → **No**
- Is all data encrypted in transit? → n/a, nothing is transmitted
- Do you provide a way to request data deletion? → n/a, nothing is collected
- Privacy policy URL → `https://kopitiam.lol/privacy`

### Content rating
Fill the questionnaire honestly — no violence, no user interaction, no
purchases, no location. Expect **Everyone / PEGI 3**.

### Other required forms
- **Target audience** — if you include under-13s the app enters the Families
  programme, which adds requirements. Choosing 13+ is the simpler path.
- **Ads** — declare **no ads**. True.
- **Government apps / financial features** — no.
- **App access** — all functionality available without an account.

### Release
Upload the `.aab` to **Production** (or Closed testing first, which is worth
doing). Add release notes. Roll out.

First review typically takes a few days, sometimes longer for a brand-new
developer account. Later updates are usually faster.

---

## Updating later

1. Merge your changes to `main` (this also deploys the web build to Vercel)
2. Run the AAB workflow with a bumped **versionCode** and new **versionName**
3. Upload to Play, add release notes, roll out

The web build ships in seconds and Play takes days, so the two will drift.
That is normal and expected.
