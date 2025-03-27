const Voto = require('../models/voto.model');
const db = require('../config/database');

const homeController = {
    // Mostrar página de inicio
    mostrarInicio: async (req, res) => {
        try {
            const currentYear = new Date().getFullYear();

            // Obtener estadísticas generales
            const estadisticasGenerales = await Voto.getEstadisticas();

            // Obtener estadísticas por grado
            const sql = `
                SELECT 
                    ce.grado,
                    COUNT(*) as total,
                    SUM(CASE WHEN ce.ya_voto = 1 THEN 1 ELSE 0 END) as votaron,
                    COUNT(*) - SUM(CASE WHEN ce.ya_voto = 1 THEN 1 ELSE 0 END) as pendientes,
                    ROUND((SUM(CASE WHEN ce.ya_voto = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) as porcentaje
                FROM censo_electoral ce
                GROUP BY ce.grado
                ORDER BY ce.grado
            `;
            const [resultadosPorGrado] = await db.execute(sql);

            // Combinar todas las estadísticas
            const estadisticas = {
                ...estadisticasGenerales,
                por_grado: resultadosPorGrado
            };

            res.render('inicio', {
                currentYear: currentYear,
                estadisticas: estadisticas,
                layout: false // No usar el layout principal
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.render('inicio', {
                currentYear: new Date().getFullYear(),
                error: 'Error al cargar las estadísticas',
                layout: false
            });
        }
    }
};

module.exports = homeController; 