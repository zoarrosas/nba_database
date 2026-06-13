require('dotenv').config();

const axios = require('axios');
const mysql = require('mysql2');

const db = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

async function saveTeams() {

    try {

        console.log('Descargando equipos...');

        const response = await axios.get(
            'https://api.balldontlie.io/v1/teams',
            {

                headers: {
                    Authorization:
                    `Bearer ${process.env.API_KEY}`
                }

            }
        );

        const teams = response.data.data;

        teams.forEach(team => {

            const sql = `
                INSERT IGNORE INTO teams
                (
                    id,
                    team_name,
                    abbreviation,
                    conference,
                    city,
                    division
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [

                team.id,
                team.full_name,
                team.abbreviation,
                team.conference,
                team.city,
                team.division

            ]);

        });

        console.log('Equipos guardados correctamente');

    } catch(error) {

        console.log(
            error.response?.data || error.message
        );

    }
}

saveTeams();