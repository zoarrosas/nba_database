require('dotenv').config();

const axios = require('axios');

async function getGames() {

    try {

        const response = await axios.get(
            'https://api.balldontlie.io/v1/games',
            {

                headers: {
                    Authorization: process.env.API_KEY
                },

                params: {
                    seasons: [2025],
                    per_page: 10
                }

            }
        );

        console.log(response.data);

    } catch(error) {

        console.log(
            error.response?.data || error.message
        );

    }
}

getGames();