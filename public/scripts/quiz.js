import { saveKarokaResult } from '../main.js';
import { auth } from './firebase.js';

export async function initQuiz() {
  const questions = [
    { text: "I like learning by doing, not reading.", type: "finisher" },
    { text: "I often copy how others do things.", type: "mirror" },
    { text: "I feel better when I follow a plan.", type: "strategist" },
    { text: "I’d rather support than lead.", type: "shadow" },
    { text: "I learn best when I’m relaxed.", type: "giant" },
    { text: "I naturally take the lead.", type: "visionary" },
    { text: "I improve by practicing a lot.", type: "climber" },
    { text: "I get bored without challenge.", type: "finisher" },
    { text: "I enjoy performing or presenting.", type: "mirror" },
    { text: "I notice small details others miss.", type: "strategist" },
    { text: "I love being the team glue.", type: "shadow" },
    { text: "I step up when needed, not before.", type: "giant" },
    { text: "I recognize talent in others.", type: "visionary" },
    { text: "I grow through hard work.", type: "climber" }
  ];

  const scores = questions.reduce((acc, q) => {
    acc[q.type] = 0;
    return acc;
  }, {});

  const container = document.getElementById("quiz-questions");
  const form = document.getElementById("quiz-form");
  const submitButton = document.getElementById("submit-button");
  const submitText = document.getElementById("submit-text");
  const spinner = document.getElementById("loading-spinner");

  // Render the questions
  questions.forEach((q, index) => {
    const block = document.createElement("div");

    block.innerHTML = `
      <label><strong>Q${index + 1}:</strong> ${q.text}</label><br />
      <input 
        type="range"
        min="1"
        max="5"
        value="3"
        name="q${index}"
        data-type="${q.type}"
      /><br /><br />
    `;

    container.appendChild(block);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // UI: show spinner
    submitButton.disabled = true;
    spinner.classList.remove("hidden");
    submitText.textContent = "Thinking...";

    // Reset scores
    Object.keys(scores).forEach(type => (scores[type] = 0));

    // Collect scores from sliders
    const inputs = form.querySelectorAll("input[type='range']");
    inputs.forEach(input => {
      const type = input.dataset.type;
      const value = Number(input.value);
      scores[type] += value;
    });

    // Normalize top 3 types
    const rawTop3 = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const total = rawTop3.reduce((sum, [, score]) => sum + score, 0) || 1;

    const top3 = rawTop3.map(([type, score]) => ({
      type,
      score,
      percent: Math.round((score / total) * 100)
    }));

    try {
      const response = await fetch("https://us-central1-karoka-game.cloudfunctions.net/generate_karoka_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ top3 })
      });

      const profile = await response.json();

      // Save locally
      

      const user = auth.currentUser;

      if (user) {
        // If logged in, save right away
        await saveKarokaResult(user.uid, profile);
      } else {
        // If guest, mark it for later
        localStorage.setItem("karoka_result", JSON.stringify(profile));
        
      }

      // Redirect to result
      window.location.hash = "/results";

    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      // Reset UI
      submitButton.disabled = false;
      spinner.classList.add("hidden");
      submitText.textContent = "Show me who I am!";
    }
  });
}
