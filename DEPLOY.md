```markdown
# DEPLOY.md

This document outlines how to deploy this Vite React PWA to Vercel, Netlify, and Firebase Hosting.

## General Information

*   **Build Command:** `npm run build`
*   **Output Directory:** `dist`
*   **Environment Variable:** `VITE_GEMINI_API_KEY` - Must be set in your hosting provider's environment variables settings.  Obtain your API key from Google AI Studio.

## Deployment Platforms

### 1. Vercel (Recommended - One-Click)

1.  **Import Project:** Import your Git repository into Vercel.
2.  **Configure:** Vercel should automatically detect the Vite/React project. If not:
    *   Set "Build Command" to `npm run build`
    *   Set "Output Directory" to `dist`
3.  **Environment Variable:** Add `VITE_GEMINI_API_KEY` in the "Environment Variables" section.
4.  **Deploy:** Click "Deploy".

    Vercel typically handles PWA requirements automatically, but it is advised to check service worker registration after deployment.

### 2. Netlify

1.  **Import Project:** Import your Git repository into Netlify.
2.  **Configure:**
    *   Set "Build command" to `npm run build`
    *   Set "Publish directory" to `dist`
3.  **Environment Variable:** Add `VITE_GEMINI_API_KEY` in "Site settings" -> "Build & deploy" -> "Environment".
4.  **Deploy:** Click "Deploy site".

    **PWA Gotchas on Netlify:**

    *   **Headers:**  Ensure the correct headers are served for service workers.  Create a `netlify.toml` file in the root of your project with the following content:

        ```toml
        [[headers]]
          for = "/*"
            [headers.values]
              Link = "</sw.js>; rel=preload; as=script"
              Content-Security-Policy = "default-src 'self' https://*.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.google.com; connect-src 'self' https://generativelanguage.googleapis.com"

        [[redirects]]
          from = "/*"
          to = "/index.html"
          status = 200
        ```

        **Important:** Adjust the `Content-Security-Policy` directive to match your application's needs.  The example above assumes connections to Google services.

### 3. Firebase Hosting

1.  **Install Firebase CLI:** `npm install -g firebase-tools`
2.  **Login:** `firebase login`
3.  **Initialize:** `firebase init`

    *   Select "Hosting"
    *   Choose your Firebase project
    *   Set "What do you want to use as your public directory?" to `dist`
    *   Configure as a single-page app (SPA): `Yes`
    *   Overwrite `index.html`: `No` (unless you made changes to the default Firebase index.html).
4.  **Build:** `npm run build`
5.  **Set Environment Variable:**  Use the Firebase CLI to set environment variables.  You'll need to install the `firebase-functions` package:

    ```bash
    npm install firebase-functions --save
    ```

    Then, in your `functions` folder (if you don't have one, create it at the root of your project and add `functions/index.js` and `functions/package.json`), add the following in `functions/index.js`:

    ```javascript
    const functions = require('firebase-functions');

    exports.setConfig = functions.https.onRequest((req, res) => {
      functions.config().gemini.api_key = process.env.VITE_GEMINI_API_KEY; // This won't work.  See below.
      res.send("Config set!");
    });
    ```

    *WARNING: THIS METHOD IS ONLY FOR FUNCTIONS AND NOT DIRECTLY AVAILABLE IN THE CLIENT-SIDE APPLICATION.  THE VITE_GEMINI_API_KEY NEEDS TO BE EMBEDDED DURING THE BUILD PROCESS VIA ANOTHER MEANS.  THIS IS SHOWN FOR DEMONSTRATION ONLY.*

    **Alternative Approach:**  Directly inject the environment variable during the build process using a script:

    ```bash
    REACT_APP_GEMINI_API_KEY=$VITE_GEMINI_API_KEY npm run build
    ```

    Then modify your code to access it using `process.env.REACT_APP_GEMINI_API_KEY`

6.  **Deploy:** `firebase deploy --only hosting`

    **PWA Gotchas on Firebase:**

    *   **Firebase Hosting Rewrites:** Ensure your `firebase.json` file includes rewrites to serve your application correctly:

        ```json
        {
          "hosting": {
            "public": "dist",
            "ignore": [
              "firebase.json",
              "**/.*",
              "**/node_modules/**"
            ],
            "rewrites": [
              {
                "source": "**",
                "destination": "/index.html"
              }
            ]
          }
        }
        ```

        This is usually configured correctly during the `firebase init` process when selecting "single-page app."

    *   **Service Worker Caching:** Firebase Hosting automatically caches static assets.  Ensure your service worker is configured to handle caching and updates appropriately.

Remember to test your PWA thoroughly after deployment on various devices and browsers to ensure it functions as expected.  Check the service worker registration and ensure the app is installable.
```