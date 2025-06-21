export const rooms = {
  FirstArena: {
    // Tiled JSON exported from the Tiled map editor (Firebase Storage URL)
    mapJsonUrl: 
      'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FFirstArenaVariable.json?alt=media',
    
    playJsonUrl:
      'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2Fkinesthetic.json?alt=media',

    // An array of all tilesets the Tiled map uses
    tilesets: [
      {
        key: 'Interiors',                   // Phaser cache key
        name: 'Interiors_free_32x32',       // tileset name as defined in Tiled
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FInteriors_free_32x32.png?alt=media'
      },
      {
        key: 'RoomBuilder',                 // Phaser cache key
        name: 'Room_Builder_free_32x32',    // tileset name as defined in Tiled
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FRoom_Builder_free_32x32.png?alt=media'
      },
      {
        key: 'Interiors2',
        name: 'Interiors_32x32',
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FInteriors_32x32.png?alt=media'
      },
      {
        key: 'UserInterface',               // Phaser cache key
        name: 'Modern_UI_Style_1_32x32',     // tileset name as defined in kinesthetic.json fileciteturn0file0
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2FModern_UI_Style_1_32x32.png?alt=media'
      },
      // Newly added assets for the play scene
      {
        key: 'Fishing',
        name: '9_Fishing_Black_Shadow_32x32', // tileset name as defined in kinesthetic.json fileciteturn0file0
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2F9_Fishing_Black_Shadow_32x32.png?alt=media'
      },
      {
        key: 'Gym',
        name: '8_Gym_Black_Shadow_32x32',    // tileset name as defined in kinesthetic.json fileciteturn0file0
        url: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FFirstArena%2F8_Gym_Black_Shadow_32x32.png?alt=media'
      }
    ],

    // The Python code snippet that will be displayed in the UI
    codeSnippet: `
 x = 2
 y = 1
 z = 2 * 2
 years = z + y / x
 name = "Rasoa"
 print(name + " is actually " + years + " years old")
    `,

    // The solution to the puzzle. puzzleManager will validate against these counts.
    puzzleGoal: { X: 2, Y: 1, Z: 4 },

    // Whether to enable the LLM-powered "Karo" helper dialogue
    karoEnabled: true
  },

  // To add a new arena:
  // 1. Upload your Tiled JSON & tileset PNGs under PythonGame/SecondArena in Firebase.
  // 2. Copy this block, rename to SecondArena, and update URLs, tileset names, snippet, goals, karoEnabled.
  //
  // SecondArena: {
  //   mapJsonUrl: 'https://firebasestorage.googleapis.com/v0/b/karoka-core-4f251.firebasestorage.app/o/PythonGame%2FSecondArena%2FSecondArenaVariable.json?alt=media',
  //   tilesets: [
  //     { key: 'SomeTileset', name: 'SomeTilesetName', url: 'https://.../SecondArena/SomeTileset.png?alt=media' },
  //     // more tilesets...
  //   ],
  //   codeSnippet: `... your new Python puzzle ...`,
  //   puzzleGoal: { /* your bucket-variable counts */ },
  //   karoEnabled: false
  // }
};
