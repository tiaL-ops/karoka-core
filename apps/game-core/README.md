# Game Core README

## 1. Project Overview

Welcome to Game Core! This is a data-driven RPG puzzle game built with Phaser 3 and ES modules. The core philosophy is to define all puzzle rooms ("Arenas") entirely through configuration and data, with zero hard-coded logic per room.

This allows for rapid development of new content. A new arena can be created simply by editing a configuration file and adding new assets, without touching the core game engine code.

## 2. How to Add a New Arena

Adding a new room is a simple, data-only process:

1.  **Create the Map:** Design your arena in the **Tiled Map Editor**. Lay out the visual tiles and, most importantly, the object layers that define the puzzle logic (see Section 4).
2.  **Upload Assets:** Upload the exported map `.json` file and all required `.png` tileset images to a publicly accessible web host (like Firebase Storage).
3.  **Update Configuration:** Open `game-core/config/roomData.js` and add a new entry to the `rooms` object.

    ```javascript
    // In game-core/config/roomData.js
    export const rooms = {
      FirstArena: { /* ...existing config... */ },

      // Add your new arena here
      SecondArena: {
        mapJsonUrl: 'https://.../SecondArena.json?alt=media',
        tilesets: [
          // IMPORTANT: 'name' must match the tileset name in Tiled
          { key: 'MyTileset', name: 'my-tileset-name-in-tiled', url: 'https://.../MyTileset.png?alt=media' },
        ],
        codeSnippet: `... your new Python puzzle ...`,
        puzzleGoal: { A: 3, B: 1 }, // Your new puzzle goals
        karoEnabled: false
      }
    };
    ```

## 3. Engine Architecture

The project is organized to separate data, game logic, and scenes.

* `/config`: Contains `roomData.js`, the central configuration for the entire game. This is the only file you should need to edit to add a new arena.
* `/scenes`: Contains the main Phaser scenes.
    * `BootScene.js`: The first scene to run. It reads `roomData.js` and preloads all map and tileset assets for the entire game.
    * `ArenaScene.js`: The main gameplay scene. It is given a `roomKey` (e.g., "FirstArena") and builds the level by creating the tilemap and calling the `puzzleManager` to spawn objects.
    * `UIScene.js`: Renders on top of `ArenaScene` to display UI elements like the code panel and dialogue boxes.
* `/systems`: Contains managers that handle core game logic across scenes.
    * `puzzleManager.js`: The brain of the puzzle. Its `spawnObjects()` method reads the object layers from the Tiled map to create interactive elements. It also tracks the puzzle state against the `puzzleGoal`.
    * `dragManager.js`: Provides generic drag-and-drop functionality for objects like gems.
    * `interactionManager.js`: Handles clicks on static objects like terminals or NPCs.
* `/objects`: Contains the ES module classes for all interactive game objects (e.g., `Player`, `Gem`, `Bucket`, `Door`).
* `/ui`: Contains classes for UI components like `codePanel.js` and `dialogBox.js`.

## 4. Tilemap Structure Explained

The Tiled `.json` map file is the blueprint for each arena. The structure of its layers is critical for the game engine to understand how to build the level.

### Tile Layers

These layers are used for visual presentation. The names must be consistent for the engine to render them correctly. Based on your `FirstArenaVariable.json`, these include:

* **Floor**: The base floor tiles.
* **Walls**: The wall tiles. This layer can have collision properties set on its tiles.
* **Furniture**: Decorative items that the player may interact with or move around.
* **Collision**: An optional, often invisible layer used to define collidable areas using tile properties in Tiled.

### Object Layers

Object layers are the most important part of the data-driven design. They tell the `puzzleManager` where to spawn interactive game objects. Objects are placed in Tiled, and their **Name** property determines what kind of object is created.

Based on `FirstArenaVariable.json`, here is how your object layers are interpreted:

* **`Logic` (Object Layer):** This is the primary layer for puzzle elements.
    * An object named **`door`** will spawn the main `Door` object for the room.
    * Objects named **`x`**, **`y`**, and **`z`** will spawn `Bucket` objects. The name of the object is used as the bucket's variable (`bucket.var = 'x'`).
    * An object named **`ball`** or **`gem`** will spawn a draggable `Gem` instance.
* **`Hints` (Object Layer):** This layer is used for placing non-puzzle interactive elements.
    * An object named **`code_snippet`** could define the location of a terminal that displays the puzzle's code.
    * An object named **`karo`** could define the spawn point or interaction spot for the "Karo" AI helper.

By using this structure, level design becomes a process of painting tiles and placing named objects in Tiled, which the game engine will then bring to life automatically.