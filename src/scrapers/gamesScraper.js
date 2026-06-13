const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function scrapeGames() {

    try {

        const response = await axios({

            method: 'GET',

            url: 'https://www.basketball-reference.com/leagues/NBA_2025_games.html',

            httpsAgent: agent,

            headers: {

                'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',

                'Accept':
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',

                'Accept-Language':
                'en-US,en;q=0.5',

                'Referer':
                'https://www.google.com/',

                'Connection':
                'keep-alive'

            }

        });

        const $ = cheerio.load(response.data);

        $('table tbody tr').each((i, el) => {

            const fecha =
            $(el).find('th[data-stat="date_game"]').text();

            const visitante =
            $(el).find('td[data-stat="visitor_team_name"]').text();

            const local =
            $(el).find('td[data-stat="home_team_name"]').text();

            const puntosVisitante =
            $(el).find('td[data-stat="visitor_pts"]').text();

            const puntosLocal =
            $(el).find('td[data-stat="home_pts"]').text();

            console.log(`
Fecha: ${fecha}
Visitante: ${visitante} (${puntosVisitante})
Local: ${local} (${puntosLocal})
--------------------------------
`);

        });

    } catch(error) {

        console.log('STATUS:', error.response?.status);

        console.log('ERROR:', error.message);

    }
}

scrapeGames();