require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
console.log('API KEY:', process.env.API_KEY);
const axios = require('axios');
const mysql = require('mysql2/promise');

async function savePlayerStats() {
    let db;
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Obteniendo juegos...');
        
        const [games] = await db.query('SELECT id FROM games LIMIT 50');

        for (const game of games) {
            console.log(`Intentando petición de prueba (Omitiendo ID local: ${game.id})...`);

            try {
                const response = await axios.get(
                    'https://api.balldontlie.io/v1/stats',
                    {
                        headers: {
                            // Enviamos la clave limpia usando el formato estándar de su documentación
                            'Authorization': process.env.API_KEY.trim()
                        },
                        params: {
                            // LÍNEA COMENTADA PARA PRUEBA DE DESCARTE: 
                            // Al no mandarle un ID específico, la API nos debería devolver datos generales recientes si la Key es válida.
                            // game_ids: game.id,
                            per_page: 10
                        }
                    }
                );

                const stats = response.data.data;
                console.log(`  → ${stats.length} stats recibidas con éxito. ¡Tu API Key y el código funcionan!`);

                const sql = `
                    INSERT INTO player_stats (
                        game_id, player_id, minutes_played,
                        points, rebounds, assists, steals, blocks,
                        turnovers, fouls, field_goals_made, field_goals_attempted,
                        three_points_made, three_points_attempted,
                        free_throws_made, free_throws_attempted, plus_minus
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                for (const stat of stats) {
                    await db.query(sql, [
                        game.id,
                        stat.player?.id || null,
                        stat.min || '0',
                        stat.pts || 0,
                        stat.reb || 0,
                        stat.ast || 0,
                        stat.stl || 0,
                        stat.blk || 0,
                        stat.turnover || 0,
                        stat.pf || 0,
                        stat.fgm || 0,
                        stat.fga || 0,
                        stat.fg3m || 0,
                        stat.fg3a || 0,
                        stat.ftm || 0,
                        stat.fta || 0,
                        stat.plus_minus || 0
                    ]);
                }

                console.log(`  ✓ Stats guardados de forma simulada usando el juego local ${game.id}`);
                await new Promise(r => setTimeout(r, 2100));

            } catch (error) {
                console.log(`  ✗ ERROR: → ${error.response?.status || ''} ${error.response?.data?.message || error.message}`);
                if (error.response?.status === 429) {
                    console.log('🛑 Demasiadas peticiones. Deteniendo scraper.');
                    break;
                }
            }
        }

        console.log('✅ Bloque de pruebas finalizado.');

    } catch (error) {
        console.log('Error general:', error.message);
    } finally {
        if (db) {
            await db.end();
            console.log('🔌 Conexión a MySQL cerrada.');
        }
    }
}

savePlayerStats();