require('dotenv').config();

const axios = require('axios');
const mysql = require('mysql2');

const db = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

async function savePlayers() {

    try {

        console.log('Descargando jugadores...');

        const response = await axios.get(
            'https://api.balldontlie.io/v1/players',
            {

                headers: {
                    Authorization:
                    `Bearer ${process.env.API_KEY}`
                },

                params: {
                    per_page: 100
                }

            }
        );

        const players = response.data.data;

        for(const player of players) {

            const sql = `
                INSERT IGNORE INTO players
                (
                    id,
                    first_name,
                    last_name,
                    full_name,
                    position,
                    jersey_number,
                    team_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [

                player.id,

                player.first_name,

                player.last_name,

                `${player.first_name} ${player.last_name}`,

                player.position,

                player.jersey_number,

                player.team?.id || null

            ]);

        }

        console.log('Jugadores guardados');

    } catch(error) {

        console.log(
            error.response?.data || error.message
        );

    }
}

savePlayers();