const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    constructor(email, password) {
        this.email = email;
        this.password = password;
    }

    // Método para guardar un nuevo administrador
    async save() {
        try {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            const [result] = await db.execute(
                'INSERT INTO administradores (email, password) VALUES (?, ?)',
                [this.email, hashedPassword]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para encontrar un administrador por email
    static async findByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM administradores WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Método para validar las credenciales
    static async validarCredenciales(email, password) {
        try {
            const admin = await this.findByEmail(email);
            if (!admin) {
                return false;
            }
            const passwordValido = await bcrypt.compare(password, admin.password);
            return passwordValido ? admin : false;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Admin; 