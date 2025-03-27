const Voto = require('../models/voto.model');
const Censo = require('../models/censo.model');
const db = require('../config/database');

const resultadosController = {
    // Mostrar estadísticas de participación
    mostrarEstadisticas: async (req, res) => {
        try {
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

            res.render('resultados/estadisticas', {
                titulo: 'Estadísticas de Participación',
                estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.render('resultados/estadisticas', {
                titulo: 'Estadísticas de Participación',
                error: 'Error al cargar las estadísticas'
            });
        }
    },

    // Mostrar resultados de la votación
    mostrarResultados: async (req, res) => {
        try {
            const resultadosPersonero = await Voto.getResultadosPersonero();
            const resultadosContralor = await Voto.getResultadosContralor();

            res.render('resultados/ver', {
                titulo: 'Resultados de la Votación',
                resultadosPersonero,
                resultadosContralor
            });

        } catch (error) {
            console.error('Error al obtener resultados:', error);
            res.render('resultados/ver', {
                titulo: 'Resultados de la Votación',
                error: 'Error al cargar los resultados'
            });
        }
    }
};

module.exports = resultadosController; 