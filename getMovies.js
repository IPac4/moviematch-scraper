async function fetchMovies() {
  try {
    const res = await fetch('https://apis.justwatch.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryPayload)
    });

    const text = await res.text();
    console.log('📦 Raw response:', text); // TO JE KLJUČNO

    const json = JSON.parse(text);

    // Če se JSON struktura ne ujema, vrni napako
    if (!json.data || !json.data.catalog) {
      throw new Error('JustWatch API response structure changed or failed');
    }

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

