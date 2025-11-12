// main.js
//deploy

import { createAuthForm } from '/scripts/authform.js';
import { auth, signOut } from '/scripts/firebase.js';
import { getFirestore, doc, getDocs, setDoc, collection, getDoc } from '/scripts/firebase.js';

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


//locally
/*
import { createAuthForm } from './scripts/authform.js';
import { auth, signOut } from './scripts/firebase.js';
import { getFirestore, doc, getDocs, setDoc, collection, getDoc } from '../public/scripts/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
*/
// Initialize Firestore
const db = getFirestore();

// DOM Elements
let usernameElement, profileSection, competitionContainer, authButton;
let currentUserId = '';

// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  usernameElement = document.getElementById('username'); 
  profileSection = document.getElementById('profile-section');
  competitionContainer = document.getElementById('competition-container');
  authButton = document.getElementById('auth-button');

  if (!authButton) {
    console.error('Auth button not found.');
    return;
  }

  // Attach click listener on the auth button.
  // If the user is logged in, clicking will sign out;
  // if not, it will open the auth form.
  authButton.addEventListener('click', () => {
    if (auth.currentUser) {
      handleLogout();
    } else {
      openAuthForm();
    }
  });

  // Set up save and cancel profile buttons if they exist.
  const saveProfileButton = document.getElementById('save-profile');
  const cancelProfileButton = document.getElementById('cancel-profile');

  if (saveProfileButton) {
    saveProfileButton.addEventListener('click', () => {
      if (currentUserId) {
        saveProfileData(currentUserId);
      }
    });
  } else {
    console.error('Save profile button not found.');
  }

  if (cancelProfileButton) {
    cancelProfileButton.addEventListener('click', () => {
      console.log("Profile update canceled.");
    });
  } else {
    console.error('Cancel profile button not found.');
  }

  // Display competitions
  displayCompetitions();

  // (Optional) Get the profile toggle button if it exists.
  const buttonProfile = document.getElementById('profile-button');

  // Listen for authentication state changes and update the UI accordingly.
  onAuthStateChanged(auth, async (user) => {
    currentUserId = user ? user.uid : '';
    updateUIForUser(user);
    if (user) {
      await loadProfileData(user.uid);
      if (buttonProfile) {
        buttonProfile.style.display = "block";
      }
    } else {
      if (buttonProfile) {
        buttonProfile.style.display = "none";
      }
      // Hide the profile container if it exists.
      const profileContainer = document.getElementById('profile-container');
      if (profileContainer) {
        profileContainer.style.display = "none";
      }
    }
  });
});

// Update UI for User Login/Logout
function updateUIForUser(user) {
  if (user) {
    // Display the user's displayName if available; otherwise, use email.
    usernameElement.textContent = user.displayName || user.email || 'User';
    authButton.textContent = 'Logout';
    if (profileSection) profileSection.classList.remove('hidden');
  } else {
    usernameElement.textContent = 'Guest';
    authButton.textContent = 'Login / Sign Up';
    if (profileSection) profileSection.classList.add('hidden');
  }
}

// Open Authentication Form only if the user is not already logged in.
function openAuthForm() {
  if (!auth.currentUser) {
    createAuthForm(() => {
      console.log('Authentication form closed after successful login/signup.');
    });
  }
}

// Handle Logout
function handleLogout() {
  signOut(auth)

    .then(() => {
      localStorage.removeItem("karoka_result");
      console.log('User logged out successfully.');
      updateUIForUser(null);
    })
    .catch((error) => console.error('Error during logout:', error.message));
}

// Load Profile Data
async function loadProfileData(userId) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      //console.log("Profile data loaded:", data);

      // Update the profile form inputs using placeholders (or you can update .value if preferred)
      document.getElementById('kname').placeholder = data.kname || 'Enter your name';
      document.getElementById('fieldOfStudy').placeholder = data.fieldOfStudy || 'Enter your field of study';
      document.getElementById('programmingLevel').placeholder = data.programmingLevel || 'Enter your programming level';
      document.getElementById('bio').placeholder = data.bio || 'Write a short bio about yourself';
    } else {
      console.log('No profile data found.');
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
}

// Display Competitions
async function displayCompetitions() {
  console.log("Displaying competitions...");
  try {
    const competitionsRef = collection(db, "competitions");
    const competitionsSnapshot = await getDocs(competitionsRef);

    competitionContainer.innerHTML = "";

    competitionsSnapshot.forEach((docSnapshot) => {
      const name = docSnapshot.id;
      const data = docSnapshot.data();
      const status = data.status || "unknown";
      const thumbnail = data.thumbnail || "";

      console.log("Competition:", name);

      // Create a container for the competition.
      const competitionDiv = document.createElement("div");
      competitionDiv.className = `competition ${status}`;
      competitionDiv.dataset.status = status;
      competitionDiv.dataset.name = name;

      // Status label
      const statusLabel = document.createElement("span");
      statusLabel.className = "status-label";
      statusLabel.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      competitionDiv.appendChild(statusLabel);

      // Competition name header
      const nameHeader = document.createElement("h3");
      nameHeader.textContent = name;
      //competitionDiv.appendChild(nameHeader);

      // Thumbnail image if available
      if (thumbnail) {
        const thumbnailImg = document.createElement("img");
        thumbnailImg.className = "thumbnail";
        thumbnailImg.src = thumbnail;
        thumbnailImg.alt = `${name} Thumbnail`;
        competitionDiv.appendChild(thumbnailImg);
      }

      competitionDiv.addEventListener("click", () => {
        if (!auth.currentUser) {
          // If not logged in, open the authentication form first.
          openAuthForm();
        } else {
          // If logged in, proceed with redirecting.
          window.location.href = `game/game.html?competition=${encodeURIComponent(name)}`;
        }
      });
      

      competitionContainer.appendChild(competitionDiv);
    });

    console.log("Competitions displayed successfully.");
  } catch (error) {
    console.error("Error fetching competitions:", error);
  }
}

// Save Profile Data
async function saveProfileData(userId) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);
    let existingData = {};

    if (profileSnap.exists()) {
      existingData = profileSnap.data();
    } else {
      console.log('No existing profile data found; creating a new one.');
    }

    // Gather updated values from form inputs.
    const updatedData = {
      kname: document.getElementById('kname').value.trim(),
      fieldOfStudy: document.getElementById('fieldOfStudy').value.trim(),
      programmingLevel: document.getElementById('programmingLevel').value.trim(),
      bio: document.getElementById('bio').value.trim(),
    };

    // Merge updated data with existing data.
    const profileData = { ...existingData };
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key]) {
        profileData[key] = updatedData[key];
      }
    });

    // Check if there is any actual change to save.
    if (JSON.stringify(profileData) === JSON.stringify(existingData)) {
      alert('No changes to save.');
      return;
    }

    await setDoc(profileRef, profileData, { merge: true });
    
    alert('Profile saved successfully!');
  } catch (error) {
    console.error('Error saving profile data:', error);
    alert('Failed to save profile. Please try again.');
  }
}

// Toggle Profile Container Visibility (exposed globally)
function hideProfileContainer() {
  const container = document.getElementById('profile-container');
  if (container) {
    container.style.display = (container.style.display === "block" ? "none" : "block");
  } else {
    console.error("Element with ID 'profile-container' not found");
  }
}
window.hideProfileContainer = hideProfileContainer;

// Filter Competitions (exposed globally)
function filterCompetitions(status) {
  const competitions = document.querySelectorAll('.competition');
  competitions.forEach((competition) => {
    competition.style.display = (status === 'all' || competition.classList.contains(status)) ? 'block' : 'none';
  });
}
window.filterCompetitions = filterCompetitions;

// Hide profile container when clicking outside of it.
document.addEventListener('click', (event) => {
  const profile = document.getElementById('profile-container');
  const toggleButton = document.getElementById('profile-button');

  if (profile && toggleButton) {
    if (
      profile.style.display === 'block' && // Only if visible
      !profile.contains(event.target) &&    // Click outside profile container
      event.target !== toggleButton           // and not on the toggle button
    ) {
      profile.style.display = 'none';
    }
  }

});

function redirectFeedback() {
  // Redirect the browser to the specified URL
  window.location.href = "https://forms.gle/hdwpx64Z7xYwmMKU9";
}
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("feedback");
  if (button) {
    button.addEventListener("click", redirectFeedback);
  } else {
    console.error("Feedback button not found!");
  }
});

export async function saveKarokaResult(userId, resultData) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    const existingData = profileSnap.exists() ? profileSnap.data() : {};

    const updatedData = {
      ...existingData,
      karokaResult: resultData
    };

    await setDoc(profileRef, updatedData, { merge: true });

    //console.log("Karoka result saved to profile:", resultData);
  } catch (error) {
    console.error("Error saving Karoka result:", error);
  }
}

export async function getKarokaResult(userId) {
  try {
    const profileRef = doc(db, 'profiles', userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return data.karokaResult || null;
    } else {
      console.warn("No profile found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching Karoka result:", error);
    return null;
  }
}

