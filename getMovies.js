import fetch from 'node-fetch';
import fs from 'fs';

const queryPayload = {
  operationName: "GetCatalog",
  variables: {
    country: "SI",
    language: "sl",
    first: 100,
    platforms: ["nfx", "dnp", "hbm", "prv", "vyo", "sse", "apv"],
    sortBy: "POPULAR",
    monetizationTypes: ["flatrate"],
    genres: [],
    contentTypes: ["MOVIE"]
  },
  query: `query GetCatalog($country: Country!, $language: Language!, $first: Int!, $sortBy: CatalogSort!, $releaseYear: Int, $platforms: [PlatformCode!], $monetizationTypes: [MonetizationType!], $genres: [GenreCode!], $contentTypes: [ContentType!]) {
    catalog(country: $country, language: $language, sortBy: $sortBy, first: $first, releaseYear: $releaseYear, platforms: $platforms, monetizationTypes: $monetizationTypes, genres: $genres, contentTypes: $contentTypes) {
      items {
        content {
          id
          title
          originalReleaseYear
          posterUrl
          shortDescription
          scoring {
            providerType
            value
          }
          offers {
            providerId
            monetizationType
            urls
          }
        }
      }
    }
  }`
};

async function fetchMovies() {
  try {
    const res = await fetch('https://apis.justwatch.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryPayload)
    });

    try {
  const res = await fetch('https://apis.justwatch.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryPayload)
  });

  const text = await res.text();
  console.log('📦 Raw response:', text); // <-- ključno!
  
  const json = JSON.parse(text);

    const movies = json.data.catalog.items.map(item => {
      const c = item.content;
      return {
        id: c.id,
        title: c.title,
        year: c.originalReleaseYear,
        description: c.shortDescription,
        poster: `https://images.justwatch.com${c.posterUrl.replace('{profile}', 's592')}`,
        score: c.scoring?.find(s => s.providerType === 'tmdb:score')?.value || null,
        platforms: c.offers?.map(o => o.providerId) || [],
        link: c.offers?.[0]?.urls?.standardWeb || ''
      };
    });

    fs.writeFileSync('slovenia_movies.json', JSON.stringify(movies, null, 2));
    console.log('✅ Saved 100 movies to slovenia_movies.json');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

fetchMovies();
