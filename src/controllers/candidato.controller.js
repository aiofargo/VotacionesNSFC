const Candidato = require('../models/candidato.model');
const path = require('path');
const fs = require('fs').promises;

const candidatoController = {
    // Mostrar formulario de creación
    mostrarCrear: (req, res) => {
        const tipo = req.params.tipo; // 'personero' o 'contralor'
        res.render(`candidatos/${tipo}/crear`, {
            titulo: `Registrar Candidato a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
            tipo: tipo,
            admin: {
                email: req.session.adminEmail
            }
        });
    },

    // Procesar la creación de un candidato
    crear: async (req, res) => {
        const tipo = req.params.tipo;
        try {
            const { nombres, apellidos, grado, numeroTarjeton, propuestas } = req.body;
            
            // Verificar si el número de tarjetón ya existe
            const tarjetonDisponible = await Candidato.verificarNumeroTarjeton(tipo, numeroTarjeton);
            if (!tarjetonDisponible) {
                throw new Error('El número de tarjetón ya está en uso');
            }

            // Procesar la foto
            if (!req.file) {
                throw new Error('Debe subir una foto del candidato');
            }

            // Crear el directorio si no existe
            const uploadDir = path.join(__dirname, '../public/uploads/candidatos');
            await fs.mkdir(uploadDir, { recursive: true });

            // Generar nombre único para la foto
            const extension = path.extname(req.file.originalname);
            const fotoNombre = `${tipo}_${Date.now()}${extension}`;
            const fotoPath = path.join(uploadDir, fotoNombre);

            // Guardar la foto
            await fs.writeFile(fotoPath, req.file.buffer);
            const fotoUrl = `/uploads/candidatos/${fotoNombre}`;

            // Crear nuevo candidato
            const candidato = new Candidato(
                tipo,
                nombres,
                apellidos,
                grado,
                numeroTarjeton,
                fotoUrl,
                propuestas
            );

            await candidato.save();

            res.redirect(`/candidatos/${tipo}?mensaje=Candidato registrado exitosamente`);
        } catch (error) {
            console.error('Error al crear candidato:', error);
            res.render(`candidatos/${tipo}/crear`, {
                titulo: `Registrar Candidato a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
                tipo: tipo,
                error: error.message,
                datos: req.body,
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    },

    // Listar candidatos
    listar: async (req, res) => {
        const tipo = req.params.tipo;
        try {
            const candidatos = await Candidato.getAll(tipo);
            res.render('candidatos/listar', {
                titulo: `Candidatos a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
                tipo: tipo,
                candidatos,
                mensaje: req.query.mensaje,
                admin: {
                    email: req.session.adminEmail
                }
            });
        } catch (error) {
            console.error('Error al listar candidatos:', error);
            res.render('candidatos/listar', {
                titulo: `Candidatos a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
                tipo: tipo,
                error: 'Error al obtener los candidatos',
                candidatos: [],
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    },

    // Mostrar formulario de edición
    mostrarEditar: async (req, res) => {
        const tipo = req.params.tipo;
        try {
            const candidato = await Candidato.getById(tipo, req.params.id);
            if (!candidato) {
                return res.redirect(`/candidatos/${tipo}?error=Candidato no encontrado`);
            }

            res.render('candidatos/editar', {
                titulo: `Editar Candidato a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
                tipo: tipo,
                candidato,
                admin: {
                    email: req.session.adminEmail
                }
            });
        } catch (error) {
            console.error('Error al obtener candidato:', error);
            res.redirect(`/candidatos/${tipo}?error=Error al obtener el candidato`);
        }
    },

    // Procesar la edición de un candidato
    editar: async (req, res) => {
        const tipo = req.params.tipo;
        const id = req.params.id;
        try {
            const { nombres, apellidos, grado, numeroTarjeton, propuestas } = req.body;
            
            // Verificar si el número de tarjetón ya existe (excluyendo el candidato actual)
            const tarjetonDisponible = await Candidato.verificarNumeroTarjeton(tipo, numeroTarjeton, id);
            if (!tarjetonDisponible) {
                throw new Error('El número de tarjetón ya está en uso');
            }

            let fotoUrl = req.body.fotoActual;

            // Procesar nueva foto si se subió una
            if (req.file) {
                // Eliminar foto anterior si existe
                if (fotoUrl) {
                    const fotoAnterior = path.join(__dirname, '../public', fotoUrl);
                    await fs.unlink(fotoAnterior).catch(() => {});
                }

                // Guardar nueva foto
                const extension = path.extname(req.file.originalname);
                const fotoNombre = `${tipo}_${Date.now()}${extension}`;
                const fotoPath = path.join(__dirname, '../public/uploads/candidatos', fotoNombre);
                await fs.writeFile(fotoPath, req.file.buffer);
                fotoUrl = `/uploads/candidatos/${fotoNombre}`;
            }

            // Actualizar candidato
            await Candidato.update(tipo, id, {
                nombres,
                apellidos,
                grado,
                numeroTarjeton,
                fotoUrl,
                propuestas
            });

            res.redirect(`/candidatos/${tipo}?mensaje=Candidato actualizado exitosamente`);
        } catch (error) {
            console.error('Error al actualizar candidato:', error);
            res.render('candidatos/editar', {
                titulo: `Editar Candidato a ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
                tipo: tipo,
                error: error.message,
                candidato: { ...req.body, id, foto_url: req.body.fotoActual },
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    },

    // Eliminar candidato
    eliminar: async (req, res) => {
        const tipo = req.params.tipo;
        try {
            await Candidato.delete(tipo, req.params.id);
            res.redirect(`/candidatos/${tipo}?mensaje=Candidato eliminado exitosamente`);
        } catch (error) {
            console.error('Error al eliminar candidato:', error);
            res.redirect(`/candidatos/${tipo}?error=Error al eliminar el candidato`);
        }
    }
};

module.exports = candidatoController; 