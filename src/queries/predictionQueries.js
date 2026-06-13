SELECT 
    t.id,
    t.team_name,
    -- Promedio de puntos anotados (como local o visitante)
    AVG(CASE WHEN g.home_team_id = t.id THEN g.home_score ELSE g.away_score END) AS avg_pts_scored,
    -- Promedio de puntos permitidos / defensa
    AVG(CASE WHEN g.home_team_id = t.id THEN g.away_score ELSE g.home_score END) AS avg_pts_allowed
FROM teams t
JOIN games g ON t.id IN (g.home_team_id, g.away_team_id)
WHERE t.id = ? AND g.status = 'Final' AND g.season_year = 2025;