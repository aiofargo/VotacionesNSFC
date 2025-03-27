-- Crear tabla de votos
CREATE TABLE votos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    documento_votante VARCHAR(20) NOT NULL,
    personero_id INT NOT NULL,
    contralor_id INT NOT NULL,
    fecha_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (personero_id) REFERENCES candidatos(id),
    FOREIGN KEY (contralor_id) REFERENCES candidatos(id),
    FOREIGN KEY (documento_votante) REFERENCES censo_electoral(documento),
    UNIQUE KEY unique_votante (documento_votante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear vista para resultados de personero
CREATE VIEW resultados_personero AS
SELECT 
    c.id,
    c.nombres,
    c.apellidos,
    c.grado,
    c.numero_tarjeton,
    COUNT(v.personero_id) as total_votos,
    ROUND((COUNT(v.personero_id) * 100.0) / (SELECT COUNT(*) FROM votos), 2) as porcentaje
FROM candidatos c
LEFT JOIN votos v ON c.id = v.personero_id
WHERE c.tipo = 'personero'
GROUP BY c.id
ORDER BY total_votos DESC;

-- Crear vista para resultados de contralor
CREATE VIEW resultados_contralor AS
SELECT 
    c.id,
    c.nombres,
    c.apellidos,
    c.grado,
    c.numero_tarjeton,
    COUNT(v.contralor_id) as total_votos,
    ROUND((COUNT(v.contralor_id) * 100.0) / (SELECT COUNT(*) FROM votos), 2) as porcentaje
FROM candidatos c
LEFT JOIN votos v ON c.id = v.contralor_id
WHERE c.tipo = 'contralor'
GROUP BY c.id
ORDER BY total_votos DESC; 