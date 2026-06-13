require('dotenv').config();

const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2');

const db = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

async function saveBoxscoreLinks() {

    const seasons = [2022, 2023, 2024, 2025];

    const months = [
        'october',
        'november',
        'december',
        'january',
        'february',
        'march',
        'april',
        'may',
        'june'
    ];

    try {

        for(const season of seasons) {

            console.log(
                `\nTEMPORADA ${season}`
            );

            for(const month of months) {

                const url =
                `https://www.basketball-reference.com/leagues/NBA_${season}_games-${month}.html`;

                console.log(
                    `\nEntrando a: ${url}`
                );

                try {

                    const response = await axios({

                        method: 'GET',

                        url: url,

                        headers: {

                            'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

                            'Accept':
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',

                            'Accept-Language':
                            'en-US,en;q=0.9',

                            'Cache-Control':
                            'no-cache',

                            'Connection':
                            'keep-alive',

                            'Upgrade-Insecure-Requests':
                            '1',

                            'Referer':
                            'https://www.google.com/'

                        },

                        timeout: 20000

                    });

                    const $ = cheerio.load(
                        response.data
                    );

                    const rows =
                    $('table#schedule tbody tr');

                    console.log(
                        `Partidos encontrados: ${rows.length}`
                    );

                    rows.each((i, row) => {

                        const date =
                        $(row)
                        .find('th[data-stat="date_game"] a')
                        .text();

                        const relativeLink =
                        $(row)
                        .find('td[data-stat="box_score_text"] a')
                        .attr('href');

                        if(relativeLink) {

                            const fullLink =
                            `https://www.basketball-reference.com${relativeLink}`;

                            console.log(
                                `Guardando ${date}`
                            );

                            const sql = `
                                UPDATE games
                                SET boxscore_url = ?
                                WHERE DATE(game_date) = ?
                            `;

                            db.query(
                                sql,
                                [
                                    fullLink,
                                    date
                                ]
                            );

                        }

                    });

                    await delay(3000);

                } catch(error) {

                    console.log(
                        `ERROR EN ${url}`
                    );

                    console.log(
                        'STATUS:',
                        error.response?.status
                    );

                    console.log(
                        error.message
                    );

                }

            }

        }

        console.log(
            '\nTODOS LOS LINKS GUARDADOS'
        );

    } catch(error) {

        console.log(error.message);

    }

}

function delay(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}

saveBoxscoreLinks();