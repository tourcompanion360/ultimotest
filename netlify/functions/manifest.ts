// Netlify function stub removed per repository cleanup.
// The dynamic manifest previously generated here is no longer used.
// The app serves a static manifest at /site.webmanifest. This file
// is intentionally a harmless stub so local dev and builds won't
// attempt to import Netlify-specific packages.

export const handler = async (_event: any) => {
  return {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Netlify function removed. Use static site manifest.' })
  };
};
