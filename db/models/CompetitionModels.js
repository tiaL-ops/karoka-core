const admin = require("firebase-admin");

// Firebase Admin has already been initialized elsewhere
const db = admin.firestore();

class CompetitionService {
  constructor(competitionId) {
    this.competitionId = competitionId;
    this.competitionRef = db.collection("competitions").doc(competitionId);
  }

  // Sets or overwrites the entire competition data
  async setCompetitionData(data) {
    try {
      await this.competitionRef.set(data);
      console.log(`Competition data set successfully for: ${this.competitionId}`);
    } catch (error) {
      console.error("Error setting competition data:", error);
    }
  }

  // Adds a panel image to the 'images' array field
  async addPanelImage(panelImage) {
    try {
      await this.competitionRef.update({
        images: admin.firestore.FieldValue.arrayUnion(panelImage)
      });
      console.log("Panel image added successfully!");
    } catch (error) {
      console.error("Error adding panel image:", error);
    }
  }

  // Appends a riddle (as a URL or an object) to the 'riddles' array field
  async addRiddle(riddle) {
    try {
      await this.competitionRef.update({
        riddles: admin.firestore.FieldValue.arrayUnion(riddle)
      });
      console.log("Riddle added successfully!");
    } catch (error) {
      console.error("Error adding riddle:", error);
    }
  }

  // Appends one or more instructions to the 'instructions' array field
  async addInstructions(instructions) {
    try {
      await this.competitionRef.update({
        instructions: admin.firestore.FieldValue.arrayUnion(...instructions)
      });
      console.log("Instructions added successfully!");
    } catch (error) {
      console.error("Error adding instructions:", error);
    }
  }

  // Adds new images to the existing 'images' array field
  async addImages(images) {
    try {
      await this.competitionRef.update({
        images: admin.firestore.FieldValue.arrayUnion(...images)
      });
      console.log("Images added successfully!");
    } catch (error) {
      console.error("Error adding images:", error);
    }
  }
}

module.exports = CompetitionService;
