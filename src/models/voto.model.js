const db = require('../config/database');

class Voto {
    constructor(documento_votante, personero_id, contralor_id) {
        this.documento_votante = documento_votante;
        this.personero_id = personero_id;
        this.contralor_id = contralor_id;
    }

    // Registrar un nuevo voto
    async save() {
        const sql = 'INSERT INTO votos (documento_votante, personero_id, contralor_id) VALUES (?, ?, ?)';
        try {
            const [result] = await db.execute(sql, [this.documento_votante, this.personero_id, this.contralor_id]);
            return result.insertId;
        } catch (error) {
            console.error('Error al registrar voto:', error);
            throw new Error('Error al registrar el voto');
        }
    }

    // Obtener resultados de personero
    static async getResultadosPersonero() {
        const sql = `
            SELECT 
                c.id,
                c.nombres,
                c.apellidos,
                c.grado,
                c.numero_tarjeton,
                c.foto_url,
                COUNT(v.personero_id) as total_votos,
                ROUND((COUNT(v.personero_id) * 100.0) / NULLIF((SELECT COUNT(*) FROM votos), 0), 2) as porcentaje
            FROM candidatos_personero c
            LEFT JOIN votos v ON c.id = v.personero_id
            GROUP BY c.id, c.nombres, c.apellidos, c.grado, c.numero_tarjeton, c.foto_url
            ORDER BY total_votos DESC, c.numero_tarjeton ASC
        `;
        try {
            const [rows] = await db.execute(sql);
            return rows;
        } catch (error) {
            console.error('Error al obtener resultados de personero:', error);
            throw new Error('Error al obtener resultados de personero');
        }
    }

    // Obtener resultados de contralor
    static async getResultadosContralor() {
        const sql = `
            SELECT 
                c.id,
                c.nombres,
                c.apellidos,
                c.grado,
                c.numero_tarjeton,
                c.foto_url,
                COUNT(v.contralor_id) as total_votos,
                ROUND((COUNT(v.contralor_id) * 100.0) / NULLIF((SELECT COUNT(*) FROM votos), 0), 2) as porcentaje
            FROM candidatos_contralor c
            LEFT JOIN votos v ON c.id = v.contralor_id
            GROUP BY c.id, c.nombres, c.apellidos, c.grado, c.numero_tarjeton, c.foto_url
            ORDER BY total_votos DESC, c.numero_tarjeton ASC
        `;
        try {
            const [rows] = await db.execute(sql);
            return rows;
        } catch (error) {
            console.error('Error al obtener resultados de contralor:', error);
            throw new Error('Error al obtener resultados de contralor');
        }
    }

    // Obtener estadísticas generales
    static async getEstadisticas() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM censo_electoral) as total_votantes,
                (SELECT COUNT(*) FROM votos) as votos_registrados,
                ROUND((SELECT COUNT(*) FROM votos) * 100.0 / NULLIF((SELECT COUNT(*) FROM censo_electoral), 0), 2) as porcentaje_participacion
        `;
        try {
            const [rows] = await db.execute(sql);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw new Error('Error al obtener estadísticas de votación');
        }
    }

    // Verificar si un votante ya votó
    static async verificarVoto(documento) {
        const sql = 'SELECT COUNT(*) as voto FROM votos WHERE documento_votante = ?';
        try {
            const [rows] = await db.execute(sql, [documento]);
            return rows[0].voto > 0;
        } catch (error) {
            console.error('Error al verificar voto:', error);
            throw new Error('Error al verificar el estado del voto');
        }
    }
}

module.exports = Voto; 