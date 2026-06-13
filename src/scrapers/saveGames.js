require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise');

// Función para pausar el código y no saturar las 5 peticiones por minuto de la API gratuita
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveLatestGames() {
    // Creamos la conexión usando promesas
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log("=== Iniciando descarga de partidos (Temporada 2027) ===");
        
        // Solicitamos los juegos a la API de Balldontlie
        const response = await axios.get('https://api.balldontlie.io/v1/games', {
            headers: {
                Authorization: `Bearer ${process.env.API_KEY}`
            },
            params: {
                seasons: [2027], // Apuntamos a la temporada con juegos agendados a futuro
                per_page: 100,   // Máximo permitido por página
                order: 'desc'    // Trae los partidos del final del calendario hacia atrás (asegura futuros)
            }
        });

        const games = response.data.data;
        console.log(`Juegos recibidos desde la API: ${games.length}`);

        if (games.length > 0) {
            console.log(`Verificando estatus del primer juego recibido: "${games[0].status}"`);

            // Query con ON DUPLICATE KEY UPDATE para actualizar estados y marcadores automáticamente
            const sql = `
                INSERT INTO games 
                (id, game_date, season_year, status, postseason, home_team_id, away_team_id, home_score, away_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    status = VALUES(status),
                    home_score = VALUES(home_score),
                    away_score = VALUES(away_score);
            `;

            for (const game of games) {
                // Si el partido es futuro, los marcadores pueden venir indefinidos; los transformamos a null
                const homeScore = game.home_team_score !== undefined ? game.home_team_score : null;
                const awayScore = game.visitor_team_score !== undefined ? game.visitor_team_score : null;

                await db.query(sql, [
                    game.id,
                    game.date,
                    game.season,
                    game.status,
                    game.postseason,
                    game.home_team.id,
                    game.visitor_team.id,
                    homeScore,
                    awayScore
                ]);
            }
            
            console.log("=== ¡PROCESO TERMINADO! Partidos guardados/actualizados con éxito en MySQL ===");
        } else {
            console.log("Advertencia: La API no devolvió ningún partido para la temporada 2027.");
        }

    } catch (error) {
        console.error('Error durante la ejecución del scraper:', error.response?.data || error.message);
    } finally {
        // Cerramos la conexión a la base de datos de manera segura al terminar
        await db.end();
        console.log("Conexión a MySQL cerrada.");
    }
}

// Ejecutar la función
saveLatestGames();