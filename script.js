document.addEventListener('DOMContentLoaded', () => {
// --- Theme Toggle (Dark/Light Mode) ---
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Load theme, defaulting to dark mode
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    // If the user previously saved light mode, keep it.
    themeToggle.textContent = '🌙';
  } else {
    // For new visitors or if theme is 'dark', apply dark mode.
    body.classList.add('dark');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  });


  // --- Hamburger Menu for Mobile ---
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Toggle between bars and times icon
    const icon = hamburger.querySelector('i');
    if (hamburger.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
      link.addEventListener('click', () => {
          if (navMenu.classList.contains('active')) {
              hamburger.classList.remove('active');
              navMenu.classList.remove('active');
              hamburger.querySelector('i').classList.add('fa-bars');
              hamburger.querySelector('i').classList.remove('fa-times');
          }
      });
  });

// --- Fetch Pinned GitHub Repositories with README Images (Corrected for Relative Paths) ---
  const GITHUB_USERNAME = 'Priyanshu-Kanyal';
  const GITHUB_PAT = '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'; // 👈 PASTE YOUR GITHUB TOKEN HERE
  const projectsContainer = document.getElementById('github-projects');

  // This GraphQL query is updated to get the default branch name (e.g., 'main' or 'master')
  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              defaultBranchRef {
                name
              }
              readme: object(expression: "HEAD:README.md") {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }
  `;

  /**
   * A helper function to find the first Markdown image URL and convert it to an absolute path if necessary.
   * @param {object} repo - The repository object from the GitHub API.
   * @returns {string} The absolute URL of the first image, or a placeholder if none is found.
   */
  const extractFirstImageUrl = (repo) => {
    const readmeText = repo.readme ? repo.readme.text : null;
    const placeholder = 'https://placehold.co/600x400/2E7D32/FFFFFF?text=Project';

    if (!readmeText) {
      return placeholder;
    }

    // This regular expression looks for the first Markdown image: ![alt](url)
    const regex = /!\[.*?\]\((.*?)\)/;
    const match = readmeText.match(regex);

    if (match && match[1]) {
      const imageUrl = match[1];

      // Check if the URL is already absolute (starts with http)
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // If the URL is relative, construct the full raw GitHub content URL
      const branch = repo.defaultBranchRef ? repo.defaultBranchRef.name : 'main';
      return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo.name}/${branch}/${imageUrl}`;
    }

    return placeholder;
  };

  fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_PAT}`
    },
    body: JSON.stringify({ query })
  })
  .then(res => res.json())
  .then(data => {
    // Clear the loader
    projectsContainer.innerHTML = '';
    const pinnedRepos = data.data.user.pinnedItems.nodes;

    pinnedRepos.forEach(repo => {
      // Pass the entire repo object to the helper function
      const imageUrl = extractFirstImageUrl(repo);

      const card = document.createElement('div');
      card.className = 'project-card';
      
      card.innerHTML = `
        <img 
          src="${imageUrl}" 
          alt="${repo.name} project preview" 
          class="project-img"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400/2E7D32/FFFFFF?text=Image+Not+Found';"
        >
        <div class="project-content">
          <h3 class="project-title">${repo.name}</h3>
          <p class="project-description">${repo.description || 'No description available.'}</p>
          <div class="project-links">
            <a href="${repo.url}" target="_blank" rel="noopener noreferrer">
              View on GitHub <i class="fab fa-github"></i>
            </a>
          </div>
        </div>
      `;
      projectsContainer.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Error fetching pinned GitHub repos:', err);
    projectsContainer.innerHTML = `<p style="text-align: center; color: #f44336;">Failed to load pinned projects. Ensure your GitHub token is correct.</p>`;
  });




  

  // --- Animate Sections on Scroll ---
  const sections = document.querySelectorAll('main > section');
  const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = 1;
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
          }
      });
  }, { threshold: 0.1 });

  sections.forEach(section => {
      observer.observe(section);
  });
});