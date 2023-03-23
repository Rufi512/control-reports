export const validateEmail = (mail:string) => {
    if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail) ||
        mail === ""
    ) {
        return true;
    }
    return false;
};

export const verifyCreateUser = async (data:any) => {
    const { ci, firstname, lastname } = data;

    if (!Number(ci) || !Number.isInteger(Number(ci)) || Number(ci) < 0 || !/^\d+$/.test(ci)) {
        return { message: "Parámetros en Cédula inválidos,solo números!" };
    }

    if (ci.length < 4 || ci.length > 18) {
        return { message: "Cedula invalida" };
    }

    if (!/^[A-Za-záéíóúñ'´ ]+$/.test(firstname)) {
        return { message: "Parámetros en Nombre inválidos" };
    }

    if (firstname.length > 45) {
        return { message: "Nombres muy largos maximo 45 caracteres" };
    }

    if (!/^[A-Za-záéíóúñ'´ ]+$/.test(lastname)) {
        return { message: "Parámetros en Apellido inválidos" };
    }

    if (lastname.length > 45) {
        return { message: "Apellidos muy largos maximo 45 caracteres" };
    }

    const validateUserEmail = validateEmail(data.email)
    if(!validateUserEmail) return {message:"Email invalido!"};

    return false;
};