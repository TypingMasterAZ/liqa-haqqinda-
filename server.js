const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const SOFA_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Origin': 'https://www.sofascore.com',
    'Referer': 'https://www.sofascore.com/'
};

const SUPPORTED_LEAGUES = {
    'aze': 953, 'eng': 17, 'esp': 8, 'ita': 23, 'ger': 35, 'fra': 34, 'tur': 52, 'ucl': 7
};

app.get('/api/league/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const leagueId = SUPPORTED_LEAGUES[slug] || slug;
        const infoRes = await axios.get(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}`, { headers: SOFA_HEADERS });
        const tournament = infoRes.data.uniqueTournament;
        let seasonId = tournament.currentSeason?.id || tournament.lastSeasonIndices?.seasonId;

        if (!seasonId) {
            const seasonsRes = await axios.get(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/seasons`, { headers: SOFA_HEADERS });
            seasonId = seasonsRes.data.seasons[0].id;
        }

        const standingsRes = await axios.get(`https://api.sofascore.com/api/v1/unique-tournament/${leagueId}/season/${seasonId}/standings/total`, { headers: SOFA_HEADERS });
        res.json({ leagueName: tournament.name, standings: standingsRes.data.standings });
    } catch (error) {
        res.status(500).json({ error: "Xəta baş verdi" });
    }
});

app.get('/api/team/:id/players', async (req, res) => {
    try {
        const response = await axios.get(`https://api.sofascore.com/api/v1/team/${req.params.id}/players`, { headers: SOFA_HEADERS });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Heyət tapılmadı" });
    }
});

// DOĞRU PORT AYARI: Yalnız bu bir dənə listen olmalıdır
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda aktivdir`);
});