# Firebase Infrastructure

This directory contains the configuration-as-code for our project's Firebase services. This allows us to version control our Firebase rules and indexes.

## Table of Contents
1.  [Overview](#overview)
2.  [File Descriptions](#file-descriptions)
3.  [Deployment](#deployment)
4.  [Initial Setup Guide](#initial-setup-guide)

---

### Overview

We use Firebase for critical parts of our application, and it's essential that its configuration is managed carefully.

* **Firestore**: Our primary NoSQL database for user profiles and session data that needs to be accessed quickly by the frontend.
* **Firebase Hosting**: (If used) Hosts our static frontend assets.
* **Firebase CLI**: The command-line tool used to deploy the configuration in this folder.

---

### File Descriptions

* `firebase.json`: The main configuration file for the Firebase CLI. It tells the CLI where to find our rules and indexes files.
* `firestore.rules`: **This is a critical security file.** It defines who can read, write, update, and delete data in our Firestore database. **All data is denied by default**, so rules must be explicitly written to grant access.
* `firestore.indexes.json`: Defines composite indexes for Firestore. These are required for queries that filter on multiple fields or order by a field not in the query's equality filter. Firestore will usually provide an error with a link to create the required index if one is missing.

---

### Deployment

To deploy any changes made to the files in this directory, you must have the [Firebase CLI](https://firebase.google.com/docs/cli) installed and be logged in (`firebase login`).

From the `kcopy/` root directory (or wherever `firebase.json` is located), run:
```bash
# Deploy both rules and indexes
firebase deploy --only firestore

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

Warning: Deploying firestore.rules can immediately change the security posture of our application. Always review changes carefully before deploying.

Initial Setup Guide
If you are setting up a new Firebase environment for development:

Create a Firebase Project in the Firebase Console.
Enable Firestore: In the console, go to Firestore Database and create a database. Start in production mode.
Enable Authentication: Go to Authentication > Sign-in method and enable the Email/Password and Google providers.
Create a Web App: In project settings, create a new Web App (</>) and copy the firebaseConfig object for your apps/frontend/.env file.
Create a Service Account: In project settings > Service accounts, generate a new private key. This JSON file is what the backend uses. Its path must be configured in backend/.env.