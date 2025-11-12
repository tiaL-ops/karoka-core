import { saveKarokaResult,getKarokaResult } from '../main.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";


export async function initResults() {
  const container = document.getElementById("results-output");
  if (!container) return;

  
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      container.innerHTML = `
        <div class="text-center mt-10">
          <p class="text-lg text-red-500 font-semibold mb-4">You need to be logged in to view your results.</p>
          <button id="login-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500 transition">
            Login / Sign Up
          </button>
        </div>
      `;

      document.getElementById("login-btn").addEventListener("click", () => {
        const authButton = document.getElementById("auth-button");
        if (authButton) authButton.click();
      });

      return;
    }
    const local = localStorage.getItem("karoka_result");
    const l=JSON.parse(local)
    await saveKarokaResult(user.uid, l);
    
    const result = await getKarokaResult(user.uid);

    if (!result) {
      container.textContent = "No result found for your account.";
      return;
    }




    const { topType, alsoTypes, identity, learningStyle, affirmation, careers } = result;

    const typeToCharacter = {
      finisher: { name: "Aomine", image: "aomine.JPG", title: "The Finisher" },
      mirror: { name: "Kise", image: "kise.JPG", title: "The Mirror" },
      strategist: { name: "Midorima", image: "midorima.JPG", title: "The Strategist" },
      giant: { name: "Murasakibara", image: "murasakibara.JPG", title: "The Giant" },
      visionary: { name: "Akashi", image: "akashi.JPG", title: "The Visionary" },
      shadow: { name: "Kuroko", image: "kuroko.JPG", title: "The Shadow" },
      climber: { name: "Kagami", image: "kagami.JPG", title: "The Climber" }
    };

    const character = typeToCharacter[topType] || typeToCharacter["shadow"];
    const imagePath = `images/${character.image}`;

    container.innerHTML = `
      <div class="bg-gray-100 text-gray-800 p-5 rounded-xl shadow-md max-w-xl mx-auto font-sans">
        <div class="flex gap-4 items-center">
          <img src="${imagePath}" alt="${character.name}" class="w-28 h-28 rounded-lg object-cover border border-gray-300 shadow-sm" />
          <div class="flex-1">
            <h2 class="text-xl font-bold text-indigo-600 mb-1">${character.title}</h2>
            <p class="text-sm text-gray-600 mb-1">Inspired by <span class="font-semibold">${character.name}</span></p>
            <p class="text-xs italic text-gray-500">
              Also part of your blend:
              ${alsoTypes?.map(t => `<span class="capitalize">${t}</span>`).join(" & ") || "None"}
            </p>
          </div>
        </div>

        <div class="mt-4 text-sm leading-relaxed">
          <p class="mb-3">${identity}</p>
          <p class="mb-3">${learningStyle}</p>
          <p class="text-indigo-500 font-medium mb-4">💬 ${affirmation}</p>

          <h3 class="text-sm font-semibold mb-1 text-indigo-600">Suggested Career Paths</h3>
          <ul class="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-sm text-gray-700">
            ${careers.map(c => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  });
}
