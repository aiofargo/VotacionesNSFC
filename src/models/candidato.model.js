const db = require('../config/database');

class Candidato {
    constructor(tipo, nombres, apellidos, grado, numeroTarjeton, fotoUrl, propuestas) {
        this.tipo = tipo; // 'personero' o 'contralor'
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.grado = grado;
        this.numeroTarjeton = numeroTarjeton;
        this.fotoUrl = fotoUrl;
        this.propuestas = propuestas;
    }

    async save() {
        try {
            const tabla = `candidatos_${this.tipo}`;
            const [result] = await db.execute(
                `INSERT INTO ${tabla} (nombres, apellidos, grado, numero_tarjeton, foto_url, propuestas) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [this.nombres, this.apellidos, this.grado, this.numeroTarjeton, this.fotoUrl, this.propuestas]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async getAll(tipo) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM candidatos_${tipo} WHERE estado = 'Activo' ORDER BY numero_tarjeton`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(tipo, id) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM candidatos_${tipo} WHERE id = ? AND estado = 'Activo'`,
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(tipo, id, datos) {
        try {
            const [result] = await db.execute(
                `UPDATE candidatos_${tipo} 
                 SET nombres = ?, apellidos = ?, grado = ?, numero_tarjeton = ?, 
                     foto_url = ?, propuestas = ?
                 WHERE id = ?`,
                [datos.nombres, datos.apellidos, datos.grado, datos.numeroTarjeton, 
                 datos.fotoUrl, datos.propuestas, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async delete(tipo, id) {
        try {
            const [result] = await db.execute(
                `UPDATE candidatos_${tipo} SET estado = 'Inactivo' WHERE id = ?`,
                [id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async verificarNumeroTarjeton(tipo, numero, idExcluir = null) {
        try {
            let query = `SELECT COUNT(*) as count FROM candidatos_${tipo} 
                        WHERE numero_tarjeton = ? AND estado = 'Activo'`;
            const params = [numero];
            
            if (idExcluir) {
                query += ' AND id != ?';
                params.push(idExcluir);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].count === 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Candidato; 