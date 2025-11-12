import {db, auth } from '../../scripts/firebase.js'; // Import Firebase configuration and auth
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";
import game from '../../scripts/game.js';
import MainMenuScene from './MainMenuScene.js';

export default class ProfileScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ProfileScene' });
    this.inputs = {};
    this.currentUserId = ''; // Store the current user's ID
  }

  preload() {
    // Load any assets if needed
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Add a background
    const background = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x222222);
    this.cameras.main.setBounds(0, 0, this.game.config.width, this.game.config.height);

    // Add a title
    this.add.text(centerX, 100, 'Player Profile', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Check authentication and load user data
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid; // Use Firebase Auth UID
        await this.loadProfileData(user.uid); // Pass the user ID to load profile
      } else {
        console.error('User not logged in.');
      }
    });

    // Create input fields
    this.createInputField(centerX, centerY - 100, 'KName:', 'kname');
    this.createInputField(centerX, centerY - 50, 'Field of Study:', 'fieldOfStudy');
    this.createInputField(centerX, centerY, 'Programming Level (B/I/A):', 'programmingLevel');
    this.createInputField(centerX, centerY + 50, 'Bio:', 'bio');

    // Create a submit button
    const submitButton = this.add.text(centerX, centerY + 150, 'Submit', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#d9534f',
      padding: { x: 10, y: 5 },
      borderRadius: 5,
    })
      .setOrigin(0.5)
      .setInteractive();

    submitButton.on('pointerdown', async () => {
    
      const profileData = {
        kname: this.inputs.kname.value || this.inputs.kname.placeholder,
        fieldOfStudy: this.inputs.fieldOfStudy.value || this.inputs.fieldOfStudy.placeholder,
        programmingLevel: this.inputs.programmingLevel.value || this.inputs.programmingLevel.placeholder,
        bio: this.inputs.bio.value || this.inputs.bio.placeholder,
      };

      try {
        localStorage.setItem('Kname', this.inputs.kname.value || this.inputs.kname.placeholder);
        const docRef = doc(db, 'profiles', this.currentUserId); // Use user ID as document ID
        await setDoc(docRef, profileData, { merge: true }); // Merge updates
        //console.log('Profile updated successfully:', profileData);
        

        this.add.text(centerX, centerY + 200, 'Profile updated successfully!', {
          fontSize: '18px',
          color: '#00ff00',
          fontFamily: 'Arial',
        }).setOrigin(0.5);
      } catch (error) {
        //console.error('Error saving profile:', error);
        this.add.text(centerX, centerY + 200, 'Error saving profile. Please try again.', {
          fontSize: '18px',
          color: '#ff0000',
          fontFamily: 'Arial',
        }).setOrigin(0.5);
      }
    });

    // Create a return button
    const returnButton = this.add.text(centerX, centerY + 200, 'Return', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#d9534f',
      padding: { x: 10, y: 5 },
      borderRadius: 5,
    })
      .setOrigin(0.5)
      .setInteractive();

    returnButton.on('pointerdown', () => {
      game.loadScene('MainMenuScene', MainMenuScene);
    });
  }

  async loadProfileData(userId) {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Update input fields with current data as placeholders
        this.inputs.kname.placeholder = data.kname || 'Enter your name';
        this.inputs.fieldOfStudy.placeholder = data.fieldOfStudy || 'Enter your field of study';
        this.inputs.programmingLevel.placeholder = data.programmingLevel || 'Enter your programming level';
        this.inputs.bio.placeholder = data.bio || 'Enter your bio';

        // Dynamically update the input field values
        this.inputs.kname.value = '';
        this.inputs.fieldOfStudy.value = '';
        this.inputs.programmingLevel.value = '';
        this.inputs.bio.value = '';

        //console.log('Profile data loaded:', data);
      } else {
        //console.log('No profile found for user ID:', userId);
      }
    } catch (error) {
      //console.error('Error loading profile:', error);
    }
  }

  createInputField(x, y, label, key) {
    // Add a label for the input field
    this.add.text(x - 200, y, label, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'right',
    }).setOrigin(1, 0.5);

    // Create the input element
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.placeholder = label;
    inputElement.value = this.inputs[key]?.value || '';

    // Style the input element
    inputElement.style.position = 'absolute';
    inputElement.style.padding = '5px';
    inputElement.style.fontSize = '16px';
    inputElement.style.border = '1px solid #ccc';
    inputElement.style.borderRadius = '5px';

    // Position and size dynamically
    const updateInputPositionAndSize = () => {
      const canvasBounds = this.sys.game.canvas.getBoundingClientRect();
      const rectWorldPosition = this.cameras.main.worldView;
      const scaleX = canvasBounds.width / this.sys.game.scale.width;
      const scaleY = canvasBounds.height / this.sys.game.scale.height;

      // Calculate the position relative to the canvas
      const domX = canvasBounds.left + (x - rectWorldPosition.x) * scaleX;
      const domY = canvasBounds.top + (y - rectWorldPosition.y) * scaleY;

      // Adjust size dynamically based on screen width
      const maxWidth = Math.min(window.innerWidth, 300); // Cap the width at 300px
      const inputWidth = maxWidth * scaleX;
      const inputHeight = 30 * scaleY;

      inputElement.style.width = `${inputWidth}px`;
      inputElement.style.height = `${inputHeight}px`;
      inputElement.style.left = `${domX}px`;
      inputElement.style.top = `${domY}px`;
      inputElement.style.transform = 'translate(-50%, -50%)'; // Center on rect
    };

    updateInputPositionAndSize();
    document.body.appendChild(inputElement);
    this.inputs[key] = inputElement;

    window.addEventListener('resize', updateInputPositionAndSize);
    this.events.on('shutdown', () => {
      inputElement.remove();
      window.removeEventListener('resize', updateInputPositionAndSize);
    });
  }
}
