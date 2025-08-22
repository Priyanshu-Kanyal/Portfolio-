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
  
  // --- Fetch Pinned GitHub Repositories via Vercel Serverless Function ---
  const projectsContainer = document.getElementById('github-projects');

  // Helper function to handle images remains the same
  const extractFirstImageUrl = (repo) => {
      // ... (keep the existing extractFirstImageUrl function here)
      const GITHUB_USERNAME = 'Priyanshu-Kanyal'; // Keep username here for URL construction
      const readmeText = repo.readme ? repo.readme.text : null;
      const placeholder = 'https://placehold.co/600x400/2E7D32/FFFFFF?text=Project';

      if (!readmeText) { return placeholder; }

      const regex = /!\[.*?\]\((.*?)\)/;
      const match = readmeText.match(regex);

      if (match && match[1]) {
          const imageUrl = match[1];
          if (imageUrl.startsWith('http')) { return imageUrl; }
          const branch = repo.defaultBranchRef ? repo.defaultBranchRef.name : 'main';
          return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo.name}/${branch}/${imageUrl}`;
      }
      return placeholder;
  };

  // The fetch call is now much simpler and more secure
  fetch('/api/github') // This calls your new serverless function
    .then(res => {
        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
      projectsContainer.innerHTML = ''; // Clear the loader
      const pinnedRepos = data.data.user.pinnedItems.nodes;

      pinnedRepos.forEach(repo => {
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
      console.error('Error fetching projects:', err);
      projectsContainer.innerHTML = `<p style="text-align: center; color: #f44336;">Failed to load projects from Vercel function.</p>`;
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