// Import the required Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc,collection, getDocs ,setDoc} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyBbnJtJDDMRxfffYLs1VmRhnhvzPZJqyiE",
    authDomain: "karoka-game.firebaseapp.com",
    projectId: "karoka-game",
    storageBucket: "karoka-game.firebasestorage.app",
    messagingSenderId: "640359613656",
    appId: "1:640359613656:web:randomid",
    measurementId: "G-73PPRJDMDJ",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

async function getUserName(uid) {
    // Check localStorage first
    let name = localStorage.getItem("Name");
    if (name !== undefined) {
        return name;
    }

    try {
        // If not in localStorage, fetch from Firestore
        const docRef = doc(db, "profiles", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data()); // Log the entire document data
            name = docSnap.data().name; // Access the single 'name' field
            localStorage.setItem("Name", name); // Store it in localStorage for future use
            return name;
        } else {
            console.error("No user document found in Firestore.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user name from Firestore:", error);
        return null;
    }
}
const fetchCompetitionData = async () => {
    try {
        const docRef = doc(db, "competitions", "Compet1test");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Competition Data:", docSnap.data());
        } else {
            console.error("No such document!");
        }
    } catch (error) {
        console.error("Error fetching competition data:", error);
    }
};

// Run the fetch function
//fetchCompetitionData();


// Wait for user authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        const currentUserId = user.uid;
        console.log("User ID:", currentUserId);
        getUserName(currentUserId);
    } else {
        console.error("No user is signed in.");
    }
});

// Export Firebase services
export { db, auth, googleProvider,doc, getDoc,getFirestore ,signOut,collection, getDocs,setDoc,onAuthStateChanged};
