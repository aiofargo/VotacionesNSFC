const Admin = require('../models/admin.model');

// Controlador para la autenticación de administradores
const authController = {
    // Mostrar formulario de login
    mostrarLogin: (req, res) => {
        res.render('auth/login', {
            titulo: 'Iniciar Sesión'
        });
    },

    // Procesar el login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validar credenciales
            const admin = await Admin.validarCredenciales(email, password);
            
            if (!admin) {
                return res.render('auth/login', {
                    titulo: 'Iniciar Sesión',
                    error: 'Credenciales inválidas'
                });
            }

            // Crear sesión
            req.session.adminId = admin.id;
            req.session.adminEmail = admin.email;
            
            // Redireccionar al dashboard
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Error en el login:', error);
            res.render('auth/login', {
                titulo: 'Iniciar Sesión',
                error: 'Error al procesar el login'
            });
        }
    },

    // Mostrar formulario de registro público
    mostrarRegistro: (req, res) => {
        res.render('auth/registro', {
            titulo: 'Registro de Administrador'
        });
    },

    // Procesar el registro público
    registrarAdmin: async (req, res) => {
        try {
            const { email, password, confirmPassword } = req.body;

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                return res.render('auth/registro', {
                    titulo: 'Registro de Administrador',
                    error: 'Las contraseñas no coinciden'
                });
            }

            // Crear nuevo administrador
            const nuevoAdmin = new Admin(email, password);
            await nuevoAdmin.save();

            // Redireccionar al login con mensaje de éxito
            res.render('auth/login', {
                titulo: 'Iniciar Sesión',
                mensaje: 'Registro exitoso. Por favor, inicia sesión.'
            });
        } catch (error) {
            console.error('Error en el registro:', error);
            res.render('auth/registro', {
                titulo: 'Registro de Administrador',
                error: 'Error al crear el administrador'
            });
        }
    },

    // Mostrar dashboard
    dashboard: (req, res) => {
        if (!req.session.adminId) {
            return res.redirect('/login');
        }
        
        res.render('dashboard/index', {
            titulo: 'Panel de Control',
            admin: {
                email: req.session.adminEmail
            }
        });
    },

    // Cerrar sesión
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/login');
    },

    // Mostrar formulario de creación de administrador (protegido)
    mostrarCrearAdmin: (req, res) => {
        res.render('auth/create-admin', {
            titulo: 'Crear Administrador',
            admin: {
                email: req.session.adminEmail
            }
        });
    },

    // Procesar la creación de un nuevo administrador (protegido)
    crearAdmin: async (req, res) => {
        try {
            const { email, password, confirmPassword } = req.body;

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                return res.render('auth/create-admin', {
                    titulo: 'Crear Administrador',
                    error: 'Las contraseñas no coinciden',
                    admin: {
                        email: req.session.adminEmail
                    }
                });
            }

            // Crear nuevo administrador
            const nuevoAdmin = new Admin(email, password);
            await nuevoAdmin.save();

            // Redireccionar al dashboard con mensaje de éxito
            res.render('dashboard/index', {
                titulo: 'Panel de Control',
                mensaje: 'Administrador creado exitosamente',
                admin: {
                    email: req.session.adminEmail
                }
            });
        } catch (error) {
            console.error('Error al crear administrador:', error);
            res.render('auth/create-admin', {
                titulo: 'Crear Administrador',
                error: 'Error al crear el administrador',
                admin: {
                    email: req.session.adminEmail
                }
            });
        }
    }
};

module.exports = authController; 