import { auth, googleProvider } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { db } from './firebase.js'; // Ensure you have db initialized

// Helper function to convert Firebase errors into user-friendly messages.
function getFriendlyErrorMessage(error) {
  const errorCode = error.code;
  const errorMessages = {
    "auth/invalid-email": "The email address is not valid. Please check and try again.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again or reset your password.",
    "auth/email-already-in-use": "This email is already in use. Try logging in instead.",
    "auth/weak-password": "Your password is too weak. Use at least 6 characters.",
    "auth/popup-closed-by-user": "Google login was canceled. Please try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
}

export function createAuthForm(loadMainMenu) {
  // Create the container and form elements
  const container = document.createElement('div');
  container.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50';

  const form = document.createElement('div');
  form.className = 'bg-white rounded-lg shadow-lg w-96 p-6 text-center';

  // Title
  const title = document.createElement('h2');
  title.innerText = 'Welcome!';
  title.className = 'text-2xl font-bold text-gray-800 mb-4';
  form.appendChild(title);

  // Name input (for sign up)
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name (for Sign Up)';
  nameInput.className = 'w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400';
  form.appendChild(nameInput);

  // Email input
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email';
  emailInput.className = 'w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400';
  form.appendChild(emailInput);

  // Password input
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.className = 'w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400';
  form.appendChild(passwordInput);

  // Error message element
  const errorMessage = document.createElement('p');
  errorMessage.className = 'text-red-500 text-sm hidden';
  form.appendChild(errorMessage);

  // Login button
  const loginButton = document.createElement('button');
  loginButton.innerText = 'Login';
  loginButton.className = 'w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-400 mb-3';
  form.appendChild(loginButton);

  // Sign Up button
  const signupButton = document.createElement('button');
  signupButton.innerText = 'Sign Up';
  signupButton.className = 'w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-400 mb-3';
  form.appendChild(signupButton);

  // Google Login button
  const googleButton = document.createElement('button');
  googleButton.innerText = 'Login with Google';
  googleButton.className = 'w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-400';
  form.appendChild(googleButton);

  container.appendChild(form);
  document.body.appendChild(container);

  // --------------------
  // Email/Password Login
  // --------------------
  loginButton.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = "Please enter both email and password.";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      container.remove();
      loadMainMenu();
    } catch (error) {
      console.error('Login failed:', error.message);
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = getFriendlyErrorMessage(error);
    }
  });

  // --------------------
  // Email/Password Sign Up
  // --------------------
  signupButton.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = "Name, email, and password are required.";
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create or update the user's profile in Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          name,
          email,
          uid: user.uid,
        });
      } else {
        console.log('Profile already exists for this user. Skipping creation.');
      }

      container.remove();
      loadMainMenu();
    } catch (error) {
      console.error('Signup failed:', error.message);
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = getFriendlyErrorMessage(error);
    }
  });

  // --------------------
  // Google Login
  // --------------------
  googleButton.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create or update the user's profile in Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          name: user.displayName || 'Unknown User',
          email: user.email,
          uid: user.uid,
        });
      } else {
        console.log('Profile already exists for this user. No changes made.');
      }

      container.remove();
      loadMainMenu();
    } catch (error) {
      console.error('Google login failed:', error.message);
      errorMessage.classList.remove('hidden');
      errorMessage.innerText = getFriendlyErrorMessage(error);
    }
  });

  // --------------------
  // Close the form when clicking outside of it
  // --------------------
  const handleClickOutside = (event) => {
    if (!form.contains(event.target)) {
      container.remove();
      document.removeEventListener('click', handleClickOutside);
    }
  };

  // Add a slight delay to avoid immediately closing the form on its own click event
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
  }, 0);
}
