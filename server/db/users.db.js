let users = [];

// For testing purposes
const getUsers = async () => {
    return users;
};

// DB Functions
const register = (user) => {
    if(getUserByUsername(user.username) !== -1) {
        return { code: 400, message: "El usuario ya existe, prueba con otro nombre de usuario" };
    } else {
        users.push(user);
        return { code: 200, message: "Usuario registrado con éxito" };
    }
};

const login = (user) => {
    const query = getUserByUsername(user.username);
    if(query === -1) {
        return { code: 400, message: "El usuario no existe, comprueba que los datos sean correctos"};
    } else {
        return (query.password === user.password) ? {code:200, message:"Se ha iniciado sesión"} :  {code:400, message: "La contraseña es incorrecta" }; 
    }
}

const getUserByUsername = (username) => {
    const res = users.find((user) => user.username === username);
    return res ? res : -1;
};

module.exports = {
    getUsers,
    register,
    login,
};

// For testing purposes
// console.log(login({ username: "adminn", password: "12345" }));