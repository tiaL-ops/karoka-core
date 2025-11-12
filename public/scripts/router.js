const routes = {
  "/quiz": "components/quiz.html",
  "/results": "components/results.html",
  "/profile": "components/profile.html",
  "/modify": "components/modify.html",
};

const appView = document.getElementById("app-view");
const indexContent = document.getElementById("index-content");

async function loadRoute() {
  const path = window.location.hash.replace("#", "") || "/";



  // Show or hide homepage content
  if (path === "/") {
    appView.innerHTML = "";
    indexContent?.classList.remove("hidden");
    return;
  } else {
    indexContent?.classList.add("hidden");
  }

  const file = routes[path];
  if (!file) {
    appView.innerHTML = "<h2 class='text-center mt-10 text-red-500'>404 - Page not found</h2>";
    return;
  }

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error("Network response was not ok");

    const html = await res.text();
    appView.innerHTML = html;
  } catch (error) {
    console.error("Failed to load route:", error);
    appView.innerHTML = "<h2>Error loading page</h2>";
  }

  // Init specific modules
  if (path === "/quiz") {
    import("./quiz.js").then(module => module.initQuiz?.());
  } else if (path === "/results") {
    import("./results.js").then(module => module.initResults?.());
  } else if (path === "/profile") {
    import("./profile.js").then(module => module.initProfile?.());
  } else if (path === "/modify") {
    // optional code
  }
}

window.addEventListener("load", loadRoute);
window.addEventListener("hashchange", loadRoute);
