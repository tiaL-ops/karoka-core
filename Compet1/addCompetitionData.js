// IMPORTANT
// THIS HAS ALREADY BEEN ADDED
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  databaseURL: "https://karoka-game.firebaseio.com", // Replace with your project URL
});

const db = admin.firestore();

// Define the competition data
const competitionData = {
  images: [
    {
      key: "House",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FHouse.png?alt=media",
    },
    {
      key: "house1",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fhouse1.png?alt=media",
    },
    {
      key: "Tilemap",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FTileMap.png?alt=media",
    },
  ],
  spritesheet: [
    {
      key: "girl",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fgirl.png?alt=media",
      frameWidth: 48,
      frameHeight: 48,
    },
    {
      key: "boiTest",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FboiTest.png?alt=media",
      frameWidth: 48,
      frameHeight: 48,
    },
  ],
  tilemap: {
    key: "test",
    url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Ftest.json?alt=media",
  },
};

// Function to add competition data
async function addCompetitionData() {
  try {
    const competitionId = "compet1Test";
    await db.collection("competitions").doc(competitionId).set(competitionData);
    console.log(`Competition data added successfully for: ${competitionId}`);
  } catch (error) {
    console.error("Error adding competition data:", error);
  }
}

async function addPanelImage() {
  try {
    const competitionId = "compet1Test";
    const competitionRef = db.collection("competitions").doc(competitionId);

    // Define the new panel image
    const panelImage = {
      key: "panel",
      url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fpanel.png?alt=media",
    };

    // Update Firestore to append the new image to the images array
    await competitionRef.update({
      images: admin.firestore.FieldValue.arrayUnion(panelImage),
    });

    console.log("Panel image added successfully!");
  } catch (error) {
    console.error("Error adding panel image:", error);
  }
}

// IMPORTANT: Firebase Admin already initialized above

const riddle = "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FCompet1Riddle.json?alt=media";

// Function to add the riddle to Firestore under a separate 'riddles' array
async function addRiddleToFirestore() {
  try {
    const competitionId = "compet1Test";
    const competitionRef = db.collection("competitions").doc(competitionId);

    // Update Firestore to append the riddle object to a dedicated 'riddles' array
    await competitionRef.update({
      riddles: admin.firestore.FieldValue.arrayUnion(riddle),
    });

    console.log("Riddle added successfully!");
  } catch (error) {
    console.error("Error adding riddle:", error);
  }
}

// Function to add the instructions to Firestore under a separate 'instructions' array
async function addInstructionsToFirestore() {
  try {
    const competitionId = "compet1Test";
    const competitionRef = db.collection("competitions").doc(competitionId);

    const instructions = [
      {
        key: "PI",
        url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FPInstruction.png?alt=media",
      },
      {
        key: "RI",
        url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2FRInstruction.png?alt=media",
      },
    ];

    // Update Firestore to append the instruction objects to the 'instructions' array
    await competitionRef.update({
      instructions: admin.firestore.FieldValue.arrayUnion(...instructions),
    });

    console.log("Instructions added successfully!");
  } catch (error) {
    console.error("Error adding instructions:", error);
  }
}

const newImages = [
  {
    key: "wiseman",
    url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fwiseman.png?alt=media",
  },
  {
    key: "forest",
    url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fforest.png?alt=media",
  },
  {
    key: "ktilestest",
    url: "https://firebasestorage.googleapis.com/v0/b/karoka-game.firebasestorage.app/o/Compet1test%2Fktilestest.png?alt=media",
  }
];

// Update the document by adding the new images to the existing 'images' array
function addData(){
  db.collection("competitions")
  .doc("compet1Test")
  .update({
    images: admin.firestore.FieldValue.arrayUnion(...newImages)
  })
  .then(() => {
    console.log("New images added successfully!");
  })
  .catch((error) => {
    console.error("Error adding images:", error);
  });
}







