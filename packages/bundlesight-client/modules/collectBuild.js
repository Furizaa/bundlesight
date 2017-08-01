const fetch = require('node-fetch');

export const collectBuild = async (endpoint, repo, branch, assets) => {
  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      repository: repo,
      branch: branch,
      assets: assets,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (result.ok) {
    const json = await result.json();
    return json.id;
  }
  throw new Error(`Unexpected return code ${result.status}.`);
};
