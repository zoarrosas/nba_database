const db = require('../config/db');

exports.getStats = async (req, res) => {
    const { type } = req.query;

    const queries = {
        top_scorers: `
            SELECT p.full_name AS name, ROUND(AVG(ps.points), 1) AS value
            FROM player_stats ps
            JOIN players p ON ps.player_id = p.id
            GROUP BY p.full_name
            ORDER BY value DESC
            LIMIT 10`,

        top_assists: `
            SELECT p.full_name AS name, ROUND(AVG(ps.assists), 1) AS value
            FROM player_stats ps
            JOIN players p ON ps.player_id = p.id
            GROUP BY p.full_name
            ORDER BY value DESC
            LIMIT 10`,

        triple_doubles: `
            SELECT p.full_name AS name, COUNT(*) AS value
            FROM player_stats ps
            JOIN players p ON ps.player_id = p.id
            WHERE ps.points >= 10 AND ps.rebounds >= 10 AND ps.assists >= 10
            GROUP BY p.full_name
            ORDER BY value DESC
            LIMIT 10`,

        team_records: `
            SELECT t.team_name AS name,
                SUM(
                    CASE
                        WHEN g.home_team_id = t.id AND g.home_score > g.away_score THEN 1
                        WHEN g.away_team_id = t.id AND g.away_score > g.home_score THEN 1
                        ELSE 0
                    END
                ) AS value
            FROM teams t
            JOIN games g ON t.id IN (g.home_team_id, g.away_team_id)
            GROUP BY t.team_name
            ORDER BY value DESC
            LIMIT 10`,

        best_defense: `
            SELECT t.team_name AS name,
                ROUND(AVG(
                    CASE
                        WHEN g.home_team_id = t.id THEN g.away_score
                        ELSE g.home_score
                    END
                ), 1) AS value
            FROM teams t
            JOIN games g ON t.id IN (g.home_team_id, g.away_team_id)
            WHERE g.status = 'Final'
            GROUP BY t.team_name
            ORDER BY value ASC
            LIMIT 10`
    };

    if (!queries[type]) {
        return res.status(400).json({ success: false, message: 'Tipo de consulta no válido.' });
    }

    try {
        const [rows] = await db.query(queries[type]);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error en getStats:', error.message);
        res.status(500).json({ success: false, message: 'Error en la base de datos.' });
    }
};