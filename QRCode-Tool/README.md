# QR Code Tool — Energy & Fuel Tracker

A simple standalone tool that generates a QR code so you can open the Energy & Fuel Tracker on your phone.

---

## How It Works

This is a single HTML file — no install, no build step. It generates a QR code from a URL you provide. When scanned with a phone camera, it opens that URL in the phone's browser.

---

## How to Use

### Step 1 — Start the main website
Open a terminal in the `Uni-main` project folder and run:
```
npm run dev
```

### Step 2 — Find your network IP
In the same terminal, Vite will print something like:
```
  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.1.231:8080/
```
Copy the **Network** URL (not localhost).

> If you don't see the Network line, run `ipconfig` in a new terminal and look for **IPv4 Address** under your Wi-Fi adapter.

### Step 3 — Generate the QR code
1. Open `index.html` by double-clicking it (no server needed)
2. Paste your Network URL into the input box, e.g:
   ```
   http://192.168.1.231:8080
   ```
3. Click **Generate**

### Step 4 — Scan with your phone
- Make sure your phone is connected to the **same Wi-Fi** as your computer
- Open your phone camera and point it at the QR code
- Tap the link that appears — it will open the Energy & Fuel Tracker in your phone browser

---

## Troubleshooting

| Problem | Fix |
|---|---|
| QR code doesn't open on phone | Make sure you used the Network IP, not `localhost` |
| Phone says "site can't be reached" | Check your phone is on the same Wi-Fi as your computer |
| No Network URL shown in Vite | Run `ipconfig` and use the IPv4 address with `:8080` at the end |
| `npm run dev` fails | Make sure you're in the `Uni-main` folder, not the `QRCode-Tool` folder |

---

## Notes

- This tool only works on your **local network** — it won't work over mobile data
- The QR code changes every time you click Generate — you don't need to regenerate unless your IP changes
- Your IP address may change if you reconnect to Wi-Fi — just generate a new QR code if it stops working
