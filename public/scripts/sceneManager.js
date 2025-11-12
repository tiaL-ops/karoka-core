import MainMenuScene from './scenes/MainMenuScene.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import { createAuthForm } from './authform.js';

export default class SceneManager {
    constructor(game) {
        this.game = game;
    }

    // Transition to the main menu
    goToMainMenu() {
        if (!this.game.scene.keys['MainMenuScene']) {
            this.game.scene.add('MainMenuScene', MainMenuScene, true); // Add and start MainMenuScene
        } else {
            this.game.scene.start('MainMenuScene'); // Start MainMenuScene if already added
        }
    }

    // Show the authentication form
    showAuthForm() {
        console.log("No user logged in. Displaying authentication form.");
        createAuthForm(() => {
            this.goToMainMenu(); // Callback to load MainMenuScene after login
        });
    }

    // Initialize the scene manager based on authentication state
    init() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is logged in. Going to MainMenuScene.");
                this.goToMainMenu();
            } else {
                console.log("No user logged in.");
                this.showAuthForm();
            }
        });
    }
}
