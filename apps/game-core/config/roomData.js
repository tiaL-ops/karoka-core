export const rooms = {
  FirstArena: {
    // Tiled JSON and tileset URLs from Firebase
    mapJsonUrl: 
      'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FFirstArenaVariable.json?alt=media',
    playJsonUrl:
      'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2Fkinesthetic.json?alt=media',
    tilesets: [
      { key: 'Interiors', name: 'Interiors_free_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FInteriors_free_32x32.png?alt=media' },
      { key: 'RoomBuilder', name: 'Room_Builder_free_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FRoom_Builder_free_32x32.png?alt=media' },
      { key: 'Interiors2', name: 'Interiors_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FInteriors_32x32.png?alt=media' },
      { key: 'UserInterface', name: 'Modern_UI_Style_1_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FModern_UI_Style_1_32x32.png?alt=media' },
      { key: 'Fishing', name: '9_Fishing_Black_Shadow_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2F9_Fishing_Black_Shadow_32x32.png?alt=media' },
      { key: 'Gym', name: '8_Gym_Black_Shadow_32x32', url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2F8_Gym_Black_Shadow_32x32.png?alt=media' }
    ],

    // --- NEW: Code exercise data ---
    exercise: {
      title: 'Swap Variables Challenge',
      description: "Fill in the blanks so it prints 'Galaxia has 4 town and 2 Tera'",
      template: [
        "# Fill in the blanks to make this code work",
        "# It should print: 'Galaxia has 4 town and 2 Tera'",
        "",
        "# --- Write your code below--- ",
        "",
        "",
        "# ── Do not change this line ──",
        "print(city + ' has ' + str(c) + ' town and ' + str(b) + ' ' + town)"
      ],
      readOnlyRegions: [
        { "from": { "line": 0, "ch": 0 }, "to": { "line": 3, "ch": "Infinity" } },
        { "from": { "line": 6, "ch": 0 }, "to": { "line": 7, "ch": "Infinity" } }
      ],
      validation: {
        b: 2,
        c: 4,
        city: "Galaxia",
        town: "Tera"
      }
    },
    
    karoEnabled: true
  },
  
  // To add a new arena with a new exercise, just copy the block above
  // and update the URLs and the 'exercise' object.
};