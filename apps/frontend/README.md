
## Front end setup (Full Summary)

This frontend uses Firebase Auth and Firestore to handle user signup, login, and profile storage. Below is everything you need to know — what files do what, and how to keep the system clean and reusable.

---

###  What Happens When a User Signs Up or Logs In?

* **Firebase Auth** handles the login/signup.
* We **create or fetch** a matching document in Firestore under:
  `/users/{uid}`
  with fields like `email`, `role`, `createdAt`, `lastActiveAt`, etc.
* This info is stored **once**, and updated when the user signs in again (like `lastActiveAt` or `sessionId`).

---

###  What Files Do What?

#### 1. `src/firebase.js`

Initializes Firebase Auth + Firestore once.
All other files import `auth`, `db`, and `googleProvider` from here.

#### 2. `src/services/`

All your Firebase logic lives here. These are **reusable helpers** that handle reading/writing from Firestore and doing Auth actions.

* `authService.js` → login, signup, logout (talks to Firebase Auth)
* `userService.js` → reads/writes to `/users/{uid}`

  * Example: `setSessionId(uid, sessionId)` sets or clears a user's session
* `sessionService.js` (optional) → writes to `/sessions/{sessionId}`
* `controlledUserService.js` (optional) → used for anonymous A/B testing users

You **never call Firebase directly in React components**. Always go through these services.

#### 3. `src/components/Auth/AuthContext.jsx`

A global context that:

* Tracks current signed-in user (`currentUser`)
* Tracks their Firestore profile (`userProfile`)
* Provides functions: `signup()`, `loginEmail()`, `loginGoogle()`, `logout()`

It uses Firebase’s `onAuthStateChanged()` to auto-update when the user logs in/out.

> 🔁 `unsubscribe()` is used to clean up that Firebase listener when the component is removed.

#### 4. `src/pages/`

UI components that the user interacts with.

* `loginPage.jsx` → handles email or Google login
* `signupPage.jsx` → handles account creation and saves profile to Firestore
* `userProfile.jsx` → shows user data from Firestore
* `homepage.jsx` → protected home screen after login

These just call functions from `AuthContext`, like `loginEmail()` or `signup()`.

#### 5. `src/App.jsx`

Main entry point. Wraps everything in `<AuthProvider>`, and sets up routes.

> Example: `PrivateRoute` makes sure some pages only load if the user is logged in.

---

### 🌱 Example User Flow (How it works together)

1. **User signs up** → calls `signup(email, pass, name)` from `authService`
2. **Firebase creates user**, then we **write their profile** to `/users/{uid}`
3. **User logs in** later → we **update `lastActiveAt`** and load their info
4. **Current user and profile** are available via `useAuth()` in any component
5. **You can set or clear session info** (like what game they’re in) using helpers like `setSessionId(uid, sessionId)`

---

### ✏️ Simple Terms Explained

* **`setSessionId(uid, sessionId)`** → Writes which session the user is in (e.g. game level). You can pass `null` to clear it.
* **`unsubscribe()`** → When Firebase tracks login/logout, we “clean up” the listener if the page changes.
* **Why is `logout()` in `AuthContext` *and* `authService`?**
  `authService.logout()` just signs out.
  `AuthContext.logout()` is a wrapper so you can call it from anywhere in React easily, and update local state.

---

### 💡 Aliases

* `import LoginPage from "./pages/loginPage"` → **relative path**
* `import LoginPage from "@/pages/loginPage"` → **alias** to `src/pages/...` (cleaner and consistent)
  Make sure `@` is configured in `vite.config.js`.

---

### 🏁 TL;DR – How to Use

* Add Firebase config to `firebase.js`
* Wrap app in `<AuthProvider>`
* Use `useAuth()` to access:

  * `currentUser` (from Firebase)
  * `userProfile` (from Firestore)
  * Functions: `signup`, `loginEmail`, `loginGoogle`, `logout`
* Call Firestore helpers (like `setSessionId`) from `userService.js`

---

That’s it. This setup gives you a clean, scalable way to manage users, sessions, and auth — all in one place.
