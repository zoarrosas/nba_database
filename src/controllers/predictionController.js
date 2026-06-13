const db = require('../config/db');

// Obtiene las estadísticas históricas de un equipo
async function getTeamStats(teamId) {
    const [rows] = await db.query(`
        SELECT
            t.id,
            t.team_name,
            AVG(CASE WHEN g.home_team_id = t.id THEN g.home_score ELSE g.away_score END) AS avg_pts_scored,
            AVG(CASE WHEN g.home_team_id = t.id THEN g.away_score ELSE g.home_score END) AS avg_pts_allowed
        FROM teams t
        JOIN games g ON t.id IN (g.home_team_id, g.away_team_id)
        WHERE t.id = ? AND g.status = 'Final'
        GROUP BY t.id, t.team_name
    `, [teamId]);
    return rows[0] || null;
}

exports.getFuturePredictions = async (req, res) => {
    try {
        // 1. Buscar partidos próximos (scheduled)
        const [upcomingGames] = await db.query(`
            SELECT
                g.id,
                g.game_date,
                g.status,
                g.home_team_id,
                g.away_team_id,
                ht.team_name AS home_team_name,
                at.team_name AS away_team_name
            FROM games g
            JOIN teams ht ON g.home_team_id = ht.id
            JOIN teams at ON g.away_team_id = at.id
            WHERE g.status = 'Scheduled'
            ORDER BY g.game_date ASC
            LIMIT 10
        `);

        if (upcomingGames.length === 0) {
            return res.json({ predictions: [], message: 'No hay partidos programados en este momento.' });
        }

        // 2. Generar predicción para cada partido
        const predictions = await Promise.all(upcomingGames.map(async (game) => {
            const homeStats = await getTeamStats(game.home_team_id);
            const awayStats = await getTeamStats(game.away_team_id);

            if (!homeStats || !awayStats) {
                return null;
            }

            // Fórmula simple de predicción basada en promedios históricos
            const predictedHomeScore = Math.round(
                (homeStats.avg_pts_scored * 0.6) + (awayStats.avg_pts_allowed * 0.4)
            );
            const predictedAwayScore = Math.round(
                (awayStats.avg_pts_scored * 0.6) + (homeStats.avg_pts_allowed * 0.4)
            );

            const diff = predictedHomeScore - predictedAwayScore;
            const expectedWinner = diff >= 0 ? game.home_team_name : game.away_team_name;

            return {
                id: game.id,
                date: game.game_date,
                status: game.status,
                teams: {
                    home: game.home_team_name,
                    away: game.away_team_name
                },
                prediction: {
                    predicted_home_score: predictedHomeScore,
                    predicted_away_score: predictedAwayScore,
                    expected_winner: expectedWinner,
                    points_difference: Math.abs(diff)
                }
            };
        }));

        res.json({ predictions: predictions.filter(Boolean) });

    } catch (error) {
        console.error('Error en getFuturePredictions:', error.message);
        res.status(500).json({ error: 'Error al generar predicciones.' });
    }
};