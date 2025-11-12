import { getFirestore, doc, getDoc } from "../public/game/scripts/firebase.js";
import competTest from "./competTest.js";

// Fetch competition data
async function fetchCompetitionData() {
    const competitionKey = "compet1Test";
    const db = getFirestore();
    try {
        const docRef = doc(db, "competitions", competitionKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Competition data fetched:", docSnap.data());
            return docSnap.data();
        } else {
            console.error("No competition data found for:", competitionKey);
            return null;
        }
    } catch (error) {
        console.error("Error fetching competition data:", error);
        return null;
    }
}

// Start the game
async function startGame() {
    const competitionData = await fetchCompetitionData();

    if (!competitionData) {
        console.error("Failed to fetch competition data. Game cannot start.");
        return;
    }

    // Pass the fetched data to the scene
    const config = {
        type: Phaser.AUTO, // Auto-detect WebGL or Canvas rendering
        width: 800, // Set a larger default canvas width
        height: 600, // Set a larger default canvas height
        backgroundColor: '#000000', // Set a default background color
        scene: [new competTest(competitionData)], // Pass data to the scene
        physics: {
            default: 'arcade', // Use Arcade physics
            arcade: {
                gravity: { y: 0 }, // No gravity for top-down or non-falling physics
                debug: true, // Enable debug mode for easier troubleshooting
            },
        },
        scale: {
            mode: Phaser.Scale.FIT, // Adjust the canvas size to fit the browser window
            autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
        },
    };

    new Phaser.Game(config);
}

startGame();
