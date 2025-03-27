const Votacion = require('../models/votacion.model');
const Censo = require('../models/censo.model');
const Candidato = require('../models/candidato.model');
const Voto = require('../models/voto.model');

const votacionController = {
    // Mostrar formulario de creación de votación
    mostrarCrearVotacion: (req, res) => {
        res.render('votaciones/crear', {
            titulo: 'Crear Nueva Votación',
            admin: {
                email: req.session.adminEmail
            }
        });
    },

    // Procesar la creación de una nueva votación
    crearVotacion: async (req, res) => {
        try {
            const { año, fechaVotacion, horaApertura, horaCierre, liderProceso, observaciones } = req.body;

            // Crear nueva votación
            const nuevaVotacion = new Votacion(
                año,
                fechaVotacion,
                horaApertura,
                horaCierre,
                liderProceso,
                observaciones
            );

            await nuevaVotacion.save();

            // Redireccionar al listado de votaciones con mensaje de éxito
            res.redirect('/votaciones?mensaje=Votación creada exitosamente');
        } catch (error) {
            console.error('Error al crear votación:', error);
            res.render('votaciones/crear', {
                titulo: 'Crear Nueva Votación',
                error: 'Error al crear la votación',
                admin: {
                    email: req.session.adminEmail
                },
                datos: req.body // Mantener los datos ingresados
            });
        }
    },

    // Listar todas las votaciones
    listarVotaciones: async (req, res) => {
        try {
            const votaciones = await Votacion.getAll();
            res.render('votaciones/listar', {
                titulo: 'Listado de Votaciones',
                votaciones,
                mensaje: req.query.mensaje,
                admin: {
                    email: req.session.adminEmail
                }
            });
        } catch (error) {
            console.error('Error al listar votaciones:', error);
            res.render('votaciones/listar', {
                titulo: 'Listado de Votaciones',
                error: 'Error al obtener las votaciones',
                votaciones: [],
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    },

    // Mostrar formulario de edición de votación
    mostrarEditarVotacion: async (req, res) => {
        try {
            const votacion = await Votacion.getById(req.params.id);
            if (!votacion) {
                return res.redirect('/votaciones?error=Votación no encontrada');
            }

            res.render('votaciones/editar', {
                titulo: 'Editar Votación',
                votacion,
                admin: {
                    email: req.session.adminEmail
                }
            });
        } catch (error) {
            console.error('Error al obtener votación:', error);
            res.redirect('/votaciones?error=Error al obtener la votación');
        }
    },

    // Procesar la edición de una votación
    editarVotacion: async (req, res) => {
        try {
            const { año, fechaVotacion, horaApertura, horaCierre, liderProceso, observaciones, estado } = req.body;
            const id = req.params.id;

            await Votacion.actualizar(id, {
                año,
                fechaVotacion,
                horaApertura,
                horaCierre,
                liderProceso,
                observaciones,
                estado
            });

            res.redirect('/votaciones?mensaje=Votación actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar votación:', error);
            res.render('votaciones/editar', {
                titulo: 'Editar Votación',
                error: 'Error al actualizar la votación',
                votacion: req.body,
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    },

    // Eliminar una votación
    eliminarVotacion: async (req, res) => {
        try {
            await Votacion.eliminar(req.params.id);
            res.redirect('/votaciones?mensaje=Votación eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar votación:', error);
            res.redirect('/votaciones?error=Error al eliminar la votación');
        }
    },

    // Mostrar formulario de validación
    mostrarValidacion: (req, res) => {
        res.render('votacion/validar', {
            titulo: 'Validación de Votante'
        });
    },

    // Validar votante
    validarVotante: async (req, res) => {
        try {
            const { documento } = req.body;

            if (!documento) {
                return res.render('votacion/validar', {
                    titulo: 'Validación de Votante',
                    error: 'Por favor, ingresa tu número de documento'
                });
            }

            // Verificar en el censo electoral
            const resultado = await Censo.verificarVotante(documento);

            if (!resultado.registrado) {
                return res.render('votacion/validar', {
                    titulo: 'Validación de Votante',
                    noRegistrado: true
                });
            }

            if (resultado.yaVoto) {
                return res.render('votacion/validar', {
                    titulo: 'Validación de Votante',
                    yaVoto: true
                });
            }

            // Si el votante está registrado y no ha votado, guardar en sesión y redirigir a los tarjetones
            req.session.votante = {
                documento: documento,
                nombres: resultado.datos.nombres,
                apellidos: resultado.datos.apellidos,
                grado: resultado.datos.grado
            };

            res.redirect('/votar/tarjetones');

        } catch (error) {
            console.error('Error en validación de votante:', error);
            res.render('votacion/validar', {
                titulo: 'Validación de Votante',
                error: 'Error al validar el votante. Por favor, intenta nuevamente.'
            });
        }
    },

    // Mostrar tarjetones de votación
    mostrarTarjetones: async (req, res) => {
        try {
            // Verificar si hay un votante en sesión
            if (!req.session.votante) {
                return res.redirect('/votar');
            }

            // Obtener candidatos a personero y contralor
            const personeros = await Candidato.getAll('personero');
            const contralores = await Candidato.getAll('contralor');

            res.render('votacion/tarjetones', {
                titulo: 'Tarjetones de Votación',
                votante: req.session.votante,
                personeros: personeros,
                contralores: contralores
            });
        } catch (error) {
            console.error('Error al cargar tarjetones:', error);
            res.render('votacion/validar', {
                titulo: 'Validación de Votante',
                error: 'Error al cargar los tarjetones. Por favor, intenta nuevamente.'
            });
        }
    },

    // Procesar el voto
    procesarVoto: async (req, res) => {
        try {
            // Verificar si hay un votante en sesión
            if (!req.session.votante) {
                return res.redirect('/votar');
            }

            const { personeroId, contralorId } = req.body;
            const documento = req.session.votante.documento;

            // Validar que se haya seleccionado un candidato para cada cargo
            if (!personeroId || !contralorId) {
                return res.render('votacion/tarjetones', {
                    titulo: 'Tarjetones de Votación',
                    error: 'Debes seleccionar un candidato para cada cargo',
                    votante: req.session.votante
                });
            }

            // Verificar que el votante no haya votado antes
            const yaVoto = await Voto.verificarVoto(documento);
            if (yaVoto) {
                return res.render('votacion/validar', {
                    titulo: 'Validación de Votante',
                    yaVoto: true
                });
            }

            // Crear y guardar el voto
            const voto = new Voto(documento, personeroId, contralorId);
            await voto.save();

            // Marcar en el censo que el estudiante ya votó
            await Censo.marcarVoto(documento);

            // Limpiar la sesión del votante
            delete req.session.votante;

            // Mostrar mensaje de éxito
            res.render('votacion/exito', {
                titulo: 'Voto Registrado',
                mensaje: '¡Tu voto ha sido registrado exitosamente!'
            });

        } catch (error) {
            console.error('Error al procesar voto:', error);
            res.render('votacion/tarjetones', {
                titulo: 'Tarjetones de Votación',
                error: 'Error al procesar el voto. Por favor, intenta nuevamente.',
                votante: req.session.votante
            });
        }
    }
};

module.exports = votacionController; 