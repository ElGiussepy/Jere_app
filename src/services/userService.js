class UserService {
    constructor() {
        this.users = this.loadUsersFromEnv();
        this._logServiceStart();
    }

 _logServiceStart() {
        console.log('👥 UserService iniciado correctamente');
        console.log(`📊 Total de usuarios: ${this.users.length}`);
    }
    
    loadUsersFromEnv() {
        const usersEnv = process.env.APP_USERS || 'admin:123456';
        const users = [];
        
        const userPairs = usersEnv.split(',');
        
        userPairs.forEach(pair => {
            const [username, password] = pair.split(':');
            if (username && password) {
                users.push({
                    username: username.trim(),
                    password: password.trim()
                });
            }
        });
        
        console.log(`📝 Usuarios cargados: ${users.length}`);
        return users;
    }

    validateUser(username, password) {
        return this.users.find(user => 
            user.username === username && user.password === password
        );
    }

    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    getAllUsers() {
        return this.users.map(user => ({ 
            username: user.username 
            // No devolver las contraseñas por seguridad
        }));
    }
}

module.exports = new UserService();