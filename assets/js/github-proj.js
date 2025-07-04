// ====== CONFIGURATION ======
const repoURLs = [
    "https://api.github.com/repos/StructGeek/RCC_Designs_Excel",
];

const useLimitedDisplay = !window.location.pathname.includes("projects.html");
const CACHE_KEY = "github_repos_cache";
const CACHE_TIMESTAMP_KEY = "github_repos_cache_timestamp";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

let filterButtons = [];
let allRepos = [];
let currentFilter = 'all';
let searchTerm = '';

// ====== FETCH AND CACHE HANDLING ======
async function fetchRepos() {
    const reposContainer = document.getElementById('repos-container');
    const repoSearch = document.getElementById('repo-search');

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        const now = Date.now();

        if (cached && timestamp && now - parseInt(timestamp, 10) < CACHE_TTL) {
            allRepos = JSON.parse(cached);
            generateFilters();
            filterRepos();
            return;
        }

        const fetchedRepos = await Promise.all(repoURLs.map(async url => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
            return await res.json();
        }));

        allRepos = fetchedRepos.map(repo => ({
            name: repo.name ?? "",
            description: repo.description ?? "",
            language: repo.language || "Unknown",
            stars: repo.stargazers_count ?? 0,
            forks: repo.forks_count ?? 0,
            updated: repo.updated_at ?? null,
            link: repo.html_url ?? "#"
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(allRepos));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

        generateFilters();
        filterRepos();
    } catch (error) {
        console.error("Failed to fetch repos. Using cached version if available.", error);
        const cached = localStorage.getItem(CACHE_KEY);
        const reposContainer = document.getElementById('repos-container');

        if (cached) {
            allRepos = JSON.parse(cached);
            generateFilters();
            filterRepos();
        } else if (reposContainer) {
            reposContainer.innerHTML = `<p class="text-red-500">Unable to load projects at this time.</p>`;
        }
    }
}


// ====== DISPLAY LOGIC ======
function displayRepos(repos) {
    const reposContainer = document.getElementById('repos-container');
    if (!reposContainer) return;

    reposContainer.innerHTML = '';
    let displayCount = repos.length;

    if (useLimitedDisplay) {
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) displayCount = 2;
        else if (screenWidth < 1024) displayCount = 4;
        else displayCount = 6;
    }

    const limitedRepos = repos.slice(0, displayCount);

    if (limitedRepos.length === 0) {
        reposContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="icon icon-circle-exclamation text-4xl text-indigo-600 mb-4"></i>
                <h3 class="text-xl font-semibold">No repositories found</h3>
            </div>
        `;
        return;
    }

    limitedRepos.forEach(repo => {
        const updatedDate = repo.updated ? new Date(repo.updated) : null;
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const formattedDate = updatedDate ? updatedDate.toLocaleDateString('en-US', options) : 'Unknown';

        const repoCard = document.createElement('div');
        repoCard.className = 'repo-card any-card rounded-lg shadow-md overflow-hidden transition-all hover:border-indigo-500 border border-transparent';
        repoCard.setAttribute('data-lang', repo.language.toLowerCase());

        repoCard.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                        <a href="${repo.link}" class="hover:underline">${repo.name}</a>
                    </h3>
                    <span class="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full">${repo.language}</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">${repo.description || 'No description provided'}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center space-x-4">
                        <span class="flex items-center">
                            <i class="icon icon-star mr-1"></i> ${repo.stars}
                        </span>
                        <span class="flex items-center">
                            <i class="icon icon-code-fork mr-1"></i> ${repo.forks}
                        </span>
                    </div>
                    <span>Updated ${formattedDate}</span>
                </div>
            </div>
        `;

        reposContainer.appendChild(repoCard);
    });
}


// ====== FILTERING ======
function generateFilters() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    if (!filterWrapper) return;

    const languages = new Set(allRepos.map(repo => repo.language.toLowerCase()));
    languages.add('all');

    filterWrapper.innerHTML = '';

    languages.forEach(lang => {
        const btn = document.createElement('button');
        const isActive = lang === currentFilter;

        btn.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
        btn.dataset.filter = lang;

        btn.className = `filter-btn px-4 py-2 rounded-lg border transition-all`;

        if (isActive) {
            btn.classList.add(
                'bg-indigo-600', 'text-white', 'border-indigo-600',
                'dark:bg-indigo-700', 'dark:border-indigo-400', 'dark:text-white'
            );
        } else {
            btn.classList.add(
                'border-gray-300', 'text-gray-700', 'hover:bg-gray-100', 'hover:text-black',
                'dark:text-white', 'dark:border-gray-600', 'dark:hover:bg-gray-700'
            );
        }

        btn.addEventListener('click', () => {
            currentFilter = lang;
            generateFilters();
            filterRepos();
        });

        filterWrapper.appendChild(btn);
    });

    filterButtons = document.querySelectorAll('.filter-btn');
}

function filterRepos() {
    let filtered = allRepos;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(repo => repo.language.toLowerCase() === currentFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(repo =>
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description && repo.description.toLowerCase().includes(searchTerm))
        );
    }

    displayRepos(filtered);
}


// ====== EVENT LISTENERS ======
window.addEventListener('DOMContentLoaded', () => {
    const basePath = window.location.pathname.includes('/pages/') ? '../assets/html/' : 'assets/html/';
    fetch(`${basePath}proj-grid.html`)
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById('projects-section');
            if (!container) return;

            container.innerHTML = html;

            // View all & Back button
            const navBtn = document.getElementById('projects-navigation-button');
            const isMainPage = !window.location.pathname.includes("projects.html");
            if (navBtn) {
                navBtn.innerHTML = isMainPage
                    ? `<a href="./pages/projects.html" class="inline-block button text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-1 hover:shadow-xl transition-all">
                            <span class="inline-flex items-center gap-2 transition-all hover:translate-x-1">
                                View All Projects <i class="icon icon-caret-right"></i>
                            </span>
                        </a>`
                    : `<a href="../index.html" class="inline-block button text-white px-6 py-3 rounded-lg font-semibold hover:-translate-y-1 hover:shadow-xl transition-all">
                            <span class="inline-flex items-center gap-2 transition-all hover:-translate-x-1">
                                <i class="icon-caret-left"></i> Back
                            </span>
                        </a>`;
            }

            const repoSearch = document.getElementById('repo-search');
            if (repoSearch) {
                repoSearch.addEventListener('input', (e) => {
                    searchTerm = e.target.value.toLowerCase();
                    filterRepos();
                });
            }

            fetchRepos();
        })
        .catch(console.error);
});