const Voto = require('../models/voto.model');
const db = require('../config/database');

const homeController = {
    // Mostrar página de inicio
    mostrarInicio: async (req, res) => {
        try {
            // Obtener fecha y hora actual en Bogotá
            const bogotaDate = new Date().toLocaleString("en-US", {
                timeZone: "America/Bogota"
            });
            const fecha = new Date(bogotaDate);
            
            // Formatear fecha YYYY-MM-DD
            const currentDate = fecha.getFullYear() + '-' + 
                String(fecha.getMonth() + 1).padStart(2, '0') + '-' + 
                String(fecha.getDate()).padStart(2, '0');

            // Formatear hora HH:MM:SS
            const currentTime = String(fecha.getHours()).padStart(2, '0') + ':' + 
                String(fecha.getMinutes()).padStart(2, '0') + ':' + 
                String(fecha.getSeconds()).padStart(2, '0');

            console.log('Fecha actual (Bogotá):', currentDate);
            console.log('Hora actual (Bogotá):', currentTime);

            // Obtener información de la votación activa
            const [votaciones] = await db.query(
                `SELECT * FROM votaciones 
                WHERE fecha_votacion = ? 
                AND TIME(?) BETWEEN hora_apertura AND hora_cierre 
                AND estado = 'Programada'`,
                [currentDate, currentTime]
            );

            // Obtener estadísticas generales
            const [estadisticas] = await db.query(`
                SELECT 
                    COUNT(*) as total_votantes,
                    SUM(CASE WHEN ya_voto = 1 THEN 1 ELSE 0 END) as votos_registrados,
                    ROUND((SUM(CASE WHEN ya_voto = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) as porcentaje_participacion
                FROM censo_electoral
            `);

            // Obtener estadísticas por grado
            const [estadisticasGrado] = await db.query(`
                SELECT 
                    grado,
                    COUNT(*) as total,
                    SUM(CASE WHEN ya_voto = 1 THEN 1 ELSE 0 END) as votaron,
                    COUNT(*) - SUM(CASE WHEN ya_voto = 1 THEN 1 ELSE 0 END) as pendientes,
                    ROUND((SUM(CASE WHEN ya_voto = 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 1) as porcentaje
                FROM censo_electoral
                GROUP BY grado
                ORDER BY grado
            `);

            res.render('inicio', {
                currentYear: fecha.getFullYear(),
                votacionActiva: votaciones && votaciones.length > 0,
                estadisticas: {
                    ...estadisticas[0],
                    por_grado: estadisticasGrado
                },
                layout: false,
                debug: {
                    fecha: currentDate,
                    hora: currentTime,
                    votaciones: votaciones
                }
            });
        } catch (error) {
            console.error('Error al cargar la página de inicio:', error);
            res.render('inicio', {
                currentYear: new Date().getFullYear(),
                error: 'Error al cargar la página: ' + error.message,
                layout: false
            });
        }
    }
};

module.exports = homeController; 