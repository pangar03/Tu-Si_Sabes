const { supabase } = require("../config/supabase");

// For testing purposes
const getUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
};

// DB Functions
const register = async (user) => {
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("username")
      .eq("username", user.username)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error checking user:", checkError);
      return {
        code: 500,
        message: "Error interno del servidor al verificar usuario",
      };
    }

    if (existingUser) {
      return {
        code: 400,
        message: "El usuario ya existe, prueba con otro nombre de usuario",
      };
    }

    // Insertar nuevo usuario
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: user.username,
          password: user.password,
          is_org: user.isOrg || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error registering user:", error);
      return {
        code: 500,
        message: "Error interno del servidor al registrar usuario",
      };
    }

    return {
      code: 200,
      message: "Usuario registrado con éxito",
      user: {
        id: data.id,
        username: data.username,
        isOrg: data.is_org,
      },
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

const login = async (user) => {
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", user.username)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return {
          code: 400,
          message:
            "El usuario no existe, comprueba que los datos sean correctos",
        };
      }
      console.error("Error during login:", error);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Verificar tipo de cuenta
    if (userData.is_org !== user.organization) {
      return {
        code: 400,
        message:
          "El usuario no coincide con el tipo de cuenta que intentas usar",
      };
    }

    // Verificar contraseña
    if (userData.password !== user.password) {
      return {
        code: 400,
        message: "La contraseña es incorrecta",
      };
    }

    return {
      code: 200,
      message: "Se ha iniciado sesión",
      user: {
        id: userData.id,
        username: userData.username,
        isOrg: userData.is_org,
      },
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

const getUserByUsername = async (username) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
};

module.exports = {
  getUsers,
  register,
  login,
  getUserByUsername,
};
