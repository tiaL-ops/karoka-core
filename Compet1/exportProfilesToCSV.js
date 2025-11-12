// exportProfilesToCSV.js
const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK (ensure serviceAccountKey.json is in the same directory)
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  databaseURL: "https://karoka-game.firebaseio.com" // Replace with your project URL
});

const db = admin.firestore();

/**
 * Escapes a CSV field by wrapping in quotes if needed and doubling internal quotes.
 * @param {any} value - The field value.
 * @returns {string} - The escaped field as a string.
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return "";
  }
  let text = value.toString();
  if (text.includes('"')) {
    text = text.replace(/"/g, '""');
  }
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    text = `"${text}"`;
  }
  return text;
}

/**
 * Retrieves all profile documents, converts them to CSV format, and writes the CSV file.
 */
async function exportProfilesToCSV() {
  try {
    const profilesSnapshot = await db.collection("profiles").get();

    // CSV header row. Adjust the order as needed.
    let csvData = "id,bio,email,fieldOfStudy,incorrectAttempts,kname,name,points,programmingLevel,solvedLevels,uid\n";

    profilesSnapshot.forEach(doc => {
      const data = doc.data();

      // Some fields may be objects or arrays. Convert them to JSON strings.
      const csvLine = [
        escapeCSV(doc.id),
        escapeCSV(data.bio),
        escapeCSV(data.email),
        escapeCSV(data.fieldOfStudy),
        escapeCSV(JSON.stringify(data.incorrectAttempts)),
        escapeCSV(data.kname),
        escapeCSV(data.name),
        escapeCSV(data.points),
        escapeCSV(data.programmingLevel),
        escapeCSV(JSON.stringify(data.solvedLevels)),
        escapeCSV(data.uid)
      ].join(",") + "\n";

      csvData += csvLine;
    });

    // Write the CSV string to a file
    fs.writeFileSync("profiles.csv", csvData, "utf8");
    console.log("CSV file created: profiles.csv");
  } catch (error) {
    console.error("Error exporting profiles to CSV:", error);
  }
}

exportProfilesToCSV();
