const db = require('../config/database');

class Votacion {
    constructor(año, fechaVotacion, horaApertura, horaCierre, liderProceso, observaciones) {
        this.año = año;
        this.fechaVotacion = fechaVotacion;
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
        this.liderProceso = liderProceso;
        this.observaciones = observaciones;
    }

    // Método para guardar una nueva votación
    async save() {
        try {
            const [result] = await db.execute(
                'INSERT INTO votaciones (año, fecha_votacion, hora_apertura, hora_cierre, lider_proceso, observaciones, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [this.año, this.fechaVotacion, this.horaApertura, this.horaCierre, this.liderProceso, this.observaciones, 'Programada']
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para obtener todas las votaciones
    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM votaciones ORDER BY fecha_votacion DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Método para obtener una votación por ID
    static async getById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM votaciones WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar una votación
    static async actualizar(id, datos) {
        try {
            const [result] = await db.execute(
                'UPDATE votaciones SET año = ?, fecha_votacion = ?, hora_apertura = ?, hora_cierre = ?, lider_proceso = ?, observaciones = ?, estado = ? WHERE id = ?',
                [datos.año, datos.fechaVotacion, datos.horaApertura, datos.horaCierre, datos.liderProceso, datos.observaciones, datos.estado, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para eliminar una votación
    static async eliminar(id) {
        try {
            const [result] = await db.execute('DELETE FROM votaciones WHERE id = ?', [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar el estado de una votación
    static async actualizarEstado(id, estado) {
        try {
            const [result] = await db.execute(
                'UPDATE votaciones SET estado = ? WHERE id = ?',
                [estado, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Votacion; 