// This is your new serverless function: /api/github.js

export default async function handler(request, response) {
  const GITHUB_USERNAME = 'Priyanshu-Kanyal';
  const GITHUB_PAT = process.env.GITHUB_PAT; // Access the token from Vercel's environment variables

  if (!GITHUB_PAT) {
    return response.status(500).json({ error: 'GitHub token not configured' });
  }

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

  try {
    const githubResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_PAT}`
      },
      body: JSON.stringify({ query })
    });

    if (!githubResponse.ok) {
        const errorBody = await githubResponse.text();
        throw new Error(`GitHub API responded with ${githubResponse.status}: ${errorBody}`);
    }
    
    const data = await githubResponse.json();
    
    // Set caching headers
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
    return response.status(200).json(data);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Failed to fetch data from GitHub' });
  }
}