# Vane House: Four Colors in the Rain

A 1928 narrative strategy game as an offline-capable Progressive Web App, ready to wrap as a Google Play Trusted Web Activity (TWA).

You are the new live-in maid. Seven days, four hours a day, four siblings (Red, Yellow, Green, Blue), each hiding a silent burden. Lower each sibling's **Mask** without losing their **Trust**, keep **Scrutiny** below 100, collect colour-tagged **clues**, and pin them together into **Realizations**. Nine endings, 35 persistent achievements.

### New in 2.1
- **House cutaway hub**: a cross-section of the house with four windows lit in each sibling's colour; tap a room to go there.
- **New scenes**: The Telephone at 3 a.m., the Back-Door Pawnbroker (timed), the Bailiff's Early Visit, the Storm Walk (Julian, dissociation and grounding), Lady Eleanor's Record, and the Day 7 reference twist.
- **Touch tools**: Victor's breathing, Clara's chime-counting, Julian's "name five things". Never punishing; Skip or Choose another way always available.
- **Moments**: seven scenes that expire if you are elsewhere.
- **New Game+**: the Ledger remembers which style each sibling answered best to; Mrs. Pell's hidden arc unlocks (tea with her in the kitchen).
- **Sound** (synthesised, no audio files): rain, chimes, phone, thunder; mute switch and a muffled-chime toggle for Clara. Settings also offer relaxed timing and assist mode.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `styles.css` | 1928 look, mobile-first |
| `story.js` | Base text and data: siblings, encounters, events, clues, realizations, endings |
| `story-extra.js` | v2.1 expansion: new events, Moments, touch rituals, Mrs. Pell, extra ending text |
| `audio.js` | WebAudio sound synthesis (rain, chimes, phone, thunder) |
| `engine.js` | Pure game rules (no DOM), so it can be simulated in Node |
| `app.js` | UI, `localStorage` persistence, install prompt, service-worker registration |
| `sw.js` | Versioned service worker (precache + cache-first with background refresh) |
| `manifest.json` | PWA manifest (`standalone`, PNG + maskable icons) |
| `icon-*.png / .svg` | Icons (180, 192, 512, maskable 192/512) |
| `img/*.jpg` | The four sibling portraits |
| `privacy.html` | Privacy policy (Play Console requires a URL) |
| `.well-known/assetlinks.json` | **Template**: fill in before publishing |
| `tests/sim.js` | Headless playthrough simulator |

All paths are relative (`./…`), so the app works at a domain root or in a sub-folder.

## 1. Local testing

Service workers need `localhost` or HTTPS, so do not open `index.html` by double-clicking.

```bash
cd vane-house
python3 -m http.server 8080        # or:  npx serve -l 8080 .
```

Open <http://localhost:8080> in Chrome or Edge, then open **DevTools (F12) → Application**:

1. **Manifest**: name "Vane House: Four Colors in the Rain", Display `standalone`, Start URL `./`, theme `#1b1411`, background `#120e0c`. Icons all render. "Installability" shows no errors.
2. **Service Workers**: `sw.js` is *activated and running*, source `sw.js`.
3. **Cache Storage**: `vane-house-v2.1.0` contains `index.html`, `styles.css`, `story.js`, `story-extra.js`, `engine.js`, `audio.js`, `app.js`, icons, the four portraits, `manifest.json`, `privacy.html`.
4. **Offline mode**: tick **Application → Service Workers → Offline** (or Network → Offline), then reload. The game must load and play, portraits included.
5. **Install**: on the title screen an *Install as an App* button appears when Chrome decides the app is installable (or use the address-bar install icon).
6. **Persistence**: play a few moves, reload, press *Continue*. Trophies live in `localStorage` key `vane_house_meta_v2`, and the run in `vane_house_run_v2`.
7. **Lighthouse** (optional): *PWA* / installability checks should pass.

Test on a real phone on the same Wi-Fi: use `chrome://inspect` with USB debugging and port-forward 8080, because plain `http://<LAN-IP>` is not a secure context and the service worker will not register there.

### Automated checks

```bash
node tests/sim.js               # 4,000 random runs + scripted bots
node tests/sim.js --verbose     # print the "optimal" playthrough turn by turn
```

It asserts that meters stay in range, every clue is obtainable, all content references resolve, and **all eight endings are reachable**.

### Releasing an update

Edit any file, then bump `VERSION` in `sw.js` (for example `2.0.1`). Installed copies fetch the new cache on next launch, and the old cache is deleted on activate.

## 2. Google Play (Trusted Web Activity)

### 2a. Host over HTTPS at a domain root
Deploy the folder to any static HTTPS host (Netlify, Cloudflare Pages, Firebase Hosting, your own server). A TWA verifies the **origin**, and `/.well-known/assetlinks.json` must be served from the domain root, so use a custom domain or a user-level site, not `user.github.io/repo/`. On GitHub Pages keep the `.nojekyll` file so the `.well-known` folder is published. Check:

```bash
curl -I https://YOUR-DOMAIN/manifest.json
curl -I https://YOUR-DOMAIN/.well-known/assetlinks.json   # must be 200, application/json
```

Before publishing, put a contact email in `privacy.html`; its URL is `https://YOUR-DOMAIN/privacy.html`.

### 2b. Generate the Android App Bundle (`.aab`)

**Option A: Bubblewrap CLI** (needs Node 14.15+; it offers to download the JDK and Android SDK on first run)

```bash
npm i -g @bubblewrap/cli
mkdir vane-house-android && cd vane-house-android
bubblewrap init --manifest=https://YOUR-DOMAIN/manifest.json
```

At the prompts choose: package ID (for example `com.yourname.vanehouse`; it is permanent on Play), launcher name `Vane House`, display `standalone`, orientation `portrait`, and let it create a signing key (keep the keystore file and passwords safe and backed up). Then:

```bash
bubblewrap build
```

This outputs `app-release-bundle.aab` (upload to Play) and `app-release-signed.apk` (install on a device for testing). Keep `twa-manifest.json` under version control.

**Option B: PWABuilder**: go to <https://www.pwabuilder.com>, enter your HTTPS URL, choose **Package for stores → Android**, set the package ID and signing options, download the zip, and use the `.aab` inside. It also gives you a ready `assetlinks.json` snippet.

### 2c. `assetlinks.json` with your signing-key SHA-256

Edit `.well-known/assetlinks.json`: set `package_name` to your package ID and put the SHA-256 certificate fingerprint(s) in `sha256_cert_fingerprints`, in `AA:BB:…` format. **Which key matters:**

- **Local test APK** (`app-release-signed.apk`) is signed by your Bubblewrap keystore. Get its fingerprint with `bubblewrap fingerprint list`, or `keytool -list -v -keystore android.keystore -alias <alias>`.
- **Play-distributed app** (with Play App Signing, the default) is re-signed by Google. Copy the fingerprint from **Play Console → your app → Setup → App signing → App signing key certificate**.

Put **both** fingerprints in the array so local testing and Play installs both launch full-screen. Bubblewrap can manage this: `bubblewrap fingerprint add <SHA-256>` then `bubblewrap fingerprint generateAssetLinks`. Deploy the file, then confirm it loads at `https://YOUR-DOMAIN/.well-known/assetlinks.json`.

If the installed app shows a browser address bar, verification failed: the fingerprint or package name does not match, the file is not served from the root, or Chrome cached an older response (clear Chrome's data on the device and relaunch).

### 2d. Test through Play Console tracks before release

1. Create the app in Play Console; fill the store listing, content rating questionnaire, Data safety form (answer: no data collected), and the privacy-policy URL.
2. **Testing → Internal testing → Create release**, upload the `.aab`, add yourself as a tester, and install via the opt-in link. Confirm: launches full-screen, no URL bar, works in airplane mode.
3. Promote to **Closed testing** and invite testers by email list or Google Group.
4. **Heads-up for new personal developer accounts** (created after 13 Nov 2023): Google requires a closed test with **at least 12 testers opted in continuously for 14 days** before you can apply for Production. Organization accounts are exempt. Recruit more than 12 so attrition does not reset the clock. Check Google's current requirements page when you start.
5. After approval: **Production → Create release** (same `.aab`, or a newer one with a higher version code), roll out.

Each new upload needs a higher `appVersionCode` (`bubblewrap update` bumps it). Play also expects a recent target API level, which current Bubblewrap releases handle when you update the CLI.

## 3. Design notes

- **Dual meters**: Trust 0→100, Mask 100→0. Deep scenes (tiers 3 and 4) need low Mask *and* high Trust. Prying drops the Mask but costs Trust and raises Scrutiny, which closes those scenes.
- **Four styles** (Deferential, Direct, Warm, Quiet) behave differently per sibling. The Household tab in the Ledger records what you have learned.
- **Clue-gated ✦ choices** appear when you hold the right clue or Realization. Locked options show what they require.
- **Realizations**: pin two clues. The last one ("Everyone Is Protecting Everyone") needs three others and Day 4+.
- **Endings**: Dismissed, Illusion, Tragic Overreach, four sibling arcs, and the True Ending.
- **Respectful portrayal**: a Content Note and kind, non-diagnostic "Understanding" entries. The game is fiction and does not depict self-harm.
