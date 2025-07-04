// ====== SKILLS DATA ======
const skillData = [
  {
    name: "Python",
    icon: "icon icon-python",
    description: "Data analysis, automation, and scripting",
    level: 60
  },
  {
    name: "MATLAB",
    icon: "icon icon-chart",
    description: "Numerical computing and algorithm development",
    level: 80
  },
  {
    name: "Git",
    icon: "icon icon-git",
    description: "Version control and collaboration",
    level: 60
  },
  {
    name: "ETABS",
    icon: "icon icon-apartment",
    description: "Structural design and analysis including wind and earthquake effects",
    level: 70
  },
  {
    name: "AutoCAD",
    icon: "icon icon-ruler",
    description: "Civil and structural engineering drafting",
    level: 90
  },
  {
    name: "MS Excel",
    icon: "icon icon-table",
    description: "Data analysis and visualization",
    level: 85
  },
  {
    name: "Photoshop",
    icon: "icon icon-image",
    description: "Image editing and graphic design",
    level: 90
  },
  {
    name: "DaVinci Resolve",
    icon: "icon icon-film",
    description: "Video editing and color grading",
    level: 85
  },
  {
    name: "HTML & CSS",
    icon: "icon icon-browser",
    description: "Basic front end web development",
    level: 40
  }
];

const showLimited = !window.location.pathname.includes("skills.html");
let currentSkills = [];

function renderSkills() {
  const container = document.getElementById("skills-container");
  if (!container) return;
  container.innerHTML = "";

  let skillsToShow = skillData;

  if (showLimited) {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      skillsToShow = skillData.slice(0, 4);
    } else if (screenWidth < 1024) {
      skillsToShow = skillData.slice(0, 6);
    } else {
      skillsToShow = skillData.slice(0, 6);
    }
  }

  skillsToShow.forEach(skill => {
    const skillCard = document.createElement("div");
    skillCard.className = "skill-card any-card p-6 rounded-lg shadow-md";
    skillCard.innerHTML = `
      <div class="text-indigo-600 text-4xl mb-4">
        <i class="${skill.icon}"></i>
      </div>
      <h3 class="text-xl font-semibold mb-2">${skill.name}</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">${skill.description}</p>
      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
        <div class="bg-indigo-600 h-2.5 rounded-full" style="width: ${skill.level}%"></div>
      </div>
      <div class="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">${skill.level}%</div>
    `;
    container.appendChild(skillCard);
  });
}


// Veiw all & Back Button
function renderButton() {
  const btnWrapper = document.getElementById("skills-navigation-button");
  if (!btnWrapper) return;

  btnWrapper.innerHTML = showLimited
    ? `<a href="./pages/skills.html" class="inline-block button text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-1 hover:shadow-xl transition-all">
          <span class="inline-flex items-center gap-2 transition-all hover:translate-x-1">
              View All Skills <i class="icon icon-caret-right"></i>
          </span>
        </a>`
    : `<a href="../index.html" class="inline-block button text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-1 hover:shadow-xl transition-all">
          <span class="inline-flex items-center gap-2 transition-all hover:-translate-x-1">
              <i class="icon icon-caret-left"></i> Back
          </span>
        </a>`;
}

// Load HTML first, then inject skills and button
const basePath = window.location.pathname.includes('/pages/') ? '../assets/html/' : 'assets/html/';
fetch(`${basePath}skills-grid.html`)
  .then(res => res.text())
  .then(html => {
    const section = document.getElementById("skills-section");
    if (!section) return;
    section.innerHTML = html;
    renderSkills();
    renderButton();
  });

if (showLimited) {
  window.addEventListener("resize", renderSkills);
}
