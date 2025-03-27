const mysql = require('mysql2');

// Configuración de la conexión a la base de datos

    const connection = mysql.createConnection({
        host: process.env. HOSTDB || 'localhost',
        user: process.env. USERDB || 'root',
        password: process.env. PASSWORDDB || '',
        database: process.env. DB || 'u468593065_elecciones',
        port: process.env. PORTDB || 3306,
    });
    


// Conectar a la base de datos
connection.connect((error) => {
    if (error) {
        console.error('Error al conectar a la base de datos:', error);
        return;
    }
    console.log('Conexión exitosa a la base de datos MySQL');
});

module.exports = connection.promise(); 