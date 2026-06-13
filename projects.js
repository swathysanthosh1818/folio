// ─── LANGUAGE COLOR MAP ──────────────────────────────────────────────────────
const LANG_COLORS = {
  JavaScript: "#f7df1e",
  Python:     "#3572A5",
  HTML:       "#e34c26",
  CSS:        "#563d7c",
  TypeScript: "#2b7489",
  Java:       "#b07219",
  "C++":      "#f34b7d",
  C:          "#555555",
  React:      "#61dafb",
  Code:       "#8b949e",
};

// ─── FETCH & RENDER ──────────────────────────────────────────────────────────
async function loadProjects() {
  const container = document.getElementById("projects-container");
  const countEl   = document.getElementById("projects-count");

  if (!container) return;

  try {
    // Add cache-buster so Netlify always serves fresh JSON
    const res  = await fetch(`projects.json?t=${Date.now()}`);
    const data = await res.json();
    const projects = data.projects || [];

    // Update count badge
    if (countEl) countEl.textContent = projects.length;

    // Clear loading state
    container.innerHTML = "";

    if (projects.length === 0) {
      container.innerHTML = `<p style="color:#888;text-align:center;">No projects found.</p>`;
      return;
    }

    // Render each project card
    projects.forEach(project => {
      const langColor = LANG_COLORS[project.language] || "#8b949e";
      const homepage  = project.homepage
        ? `<a href="${project.homepage}" target="_blank" class="proj-live-btn">🌐 Live Demo</a>`
        : "";

      const topics = project.topics.length
        ? project.topics.map(t => `<span class="proj-topic">${t}</span>`).join("")
        : "";

      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <div class="proj-header">
          <h3 class="proj-name">
            <a href="${project.url}" target="_blank">${project.name}</a>
          </h3>
          <span class="proj-visibility ${project.visibility}">${project.visibility}</span>
        </div>

        <p class="proj-desc">${project.description}</p>

        ${topics ? `<div class="proj-topics">${topics}</div>` : ""}

        <div class="proj-footer">
          <div class="proj-meta">
            <span class="proj-lang">
              <span class="lang-dot" style="background:${langColor}"></span>
              ${project.language}
            </span>
            ${project.stars > 0 ? `<span class="proj-stars">⭐ ${project.stars}</span>` : ""}
            ${project.forks > 0 ? `<span class="proj-forks">🍴 ${project.forks}</span>` : ""}
            <span class="proj-updated">📅 ${project.updated}</span>
          </div>
          <div class="proj-links">
            <a href="${project.url}" target="_blank" class="proj-github-btn">GitHub →</a>
            ${homepage}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Failed to load projects.json:", err);
    container.innerHTML = `
      <p style="color:#e74c3c;text-align:center;">
        ⚠️ Could not load projects. Make sure projects.json exists in the repo.
      </p>`;
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadProjects);
