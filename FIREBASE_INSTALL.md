# Installation Instructions: Google Firebase Studio

Follow these step-by-step instructions to deploy the Elyria Matrix RFx Engine to Google Firebase Studio using the source files from your ZIP archive.

## Prerequisites
1.  **Google Cloud Project**: You must have an active Google Cloud project with billing enabled.
2.  **Firebase CLI**: Install the Firebase CLI on your local machine:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Node.js**: Ensure you have Node.js (v18+) and npm installed.

## Step 1: Initial Preparation
1.  Extract the provided ZIP file into a new folder on your machine.
2.  Open a terminal or command prompt and navigate to that folder.

## Step 2: Firebase Console Setup
1.  Visit the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and select your existing Google Cloud project.
3.  Enable **Google Analytics** (optional but recommended).
4.  Navigate to **Project Settings** (gear icon) > **General**.
5.  Click the **Web icon (</>)** to register a new Web App.
6.  Give it a nickname (e.g., "Elyria-Production") and click **Register app**.
7.  **IMPORTANT**: Copy the `firebaseConfig` object provided in the setup screen.

## Step 3: Configure the Application
1.  In your project folder, create or edit the file `src/lib/firebase-applet-config.json` (or similar config file).
2.  Paste the configuration values you copied into this file.
3.  In the Firebase Console, enable the following services:
    *   **Authentication**: Enable "Google" as a sign-in provider.
    *   **Firestore Database**: Create a database in "Production mode" and choose a location.
    *   **Hosting**: Click "Get Started" to initialize hosting for your project.

## Step 4: Initialize Firebase Locally
1.  In your terminal, run:
    ```bash
    firebase login
    firebase init
    ```
2.  Select the following features:
    *   `Firestore`: Configure security rules and indexes.
    *   `Hosting`: Configure files for Firebase Hosting and setup GitHub Action deploys (optional).
3.  Select **Use an existing project** and pick your project from the list.
4.  **Firestore Setup**: Accept defaults for rules and indexes files.
5.  **Hosting Setup**:
    *   What do you want to use as your public directory? Enter `dist`.
    *   Configure as a single-page app (rewrite all urls to /index.html)? Enter `Yes`.
    *   Set up automatic builds and deploys with GitHub? Enter `No`.

## Step 5: Build and Deploy
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Build the production distribution:
    ```bash
    npm run build
    ```
3.  Deploy everything to Firebase:
    ```bash
    firebase deploy
    ```

## Step 6: Final Verification
1.  Once the deployment is complete, Firebase will provide a **Hosting URL** (e.g., `https://your-project.web.app`).
2.  Open this URL in your browser to verify the application is running.
3.  In the Firebase Console under **Firestore > Rules**, ensure your `firestore.rules` match the contents of the `firestore.rules` file in your source code.
