const db = require('../config/database');

class Censo {
    constructor(documento, nombres, apellidos, grado, yaVoto = false) {
        this.documento = documento;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.grado = grado;
        this.yaVoto = yaVoto;
    }

    // Verificar si un votante está registrado y si ya votó
    static async verificarVotante(documento) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM censo_electoral WHERE documento = ?',
                [documento]
            );

            if (rows.length === 0) {
                return { registrado: false };
            }

            return {
                registrado: true,
                yaVoto: rows[0].ya_voto === 1,
                datos: {
                    nombres: rows[0].nombres,
                    apellidos: rows[0].apellidos,
                    grado: rows[0].grado
                }
            };
        } catch (error) {
            console.error('Error al verificar votante:', error);
            throw new Error('Error al verificar el votante en el censo electoral');
        }
    }

    // Marcar que un votante ya ejerció su derecho al voto
    static async marcarVoto(documento) {
        try {
            await db.execute(
                'UPDATE censo_electoral SET ya_voto = 1 WHERE documento = ?',
                [documento]
            );
            return true;
        } catch (error) {
            console.error('Error al marcar voto:', error);
            throw new Error('Error al registrar el voto en el sistema');
        }
    }

    // Obtener todos los votantes
    static async getAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM censo_electoral');
            return rows;
        } catch (error) {
            console.error('Error al obtener censo electoral:', error);
            throw new Error('Error al obtener el censo electoral');
        }
    }

    // Agregar un nuevo votante al censo
    async save() {
        try {
            await db.execute(
                'INSERT INTO censo_electoral (documento, nombres, apellidos, grado, ya_voto) VALUES (?, ?, ?, ?, ?)',
                [this.documento, this.nombres, this.apellidos, this.grado, this.yaVoto]
            );
            return true;
        } catch (error) {
            console.error('Error al guardar votante:', error);
            throw new Error('Error al registrar el votante en el censo electoral');
        }
    }
}

module.exports = Censo; 