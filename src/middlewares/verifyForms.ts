import moment from "moment";
import { IEquipment, ReportModel } from "../types/types";
import mongoose from "mongoose";
import equipment from "../models/equipment";
import user from "../models/user";
import headquarter from "../models/headquarter";
import role from "../models/role";

export const validateEmail = (mail: string) => {
    if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail) ||
        mail === ""
    ) {
        return true;
    }
    return false;
};

export const validateDate = async (date: string) => {
    // Check register_date
    const data = date.split("-").join("/");

    const isValidTime = moment(data, "YYYY/MM/DD", true).isValid();

    if (!isValidTime) return "La fecha introducida es invalida";

    return "";
};

export const validateFieldEquipment = async (field: string, value: string) => {
    if (!/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/.test(value) || value.length > 30) {
        return `El campo ${field} es invalido: (debe tener 30 caracteres maximo)`;
    }
    return "";
};

export const validateFieldReport = async (field: string, value: string) => {
    console.log(value)
    if (!/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/.test(value) || value.length > 30) {
        return `El campo ${field} es invalido: (debe tener 30 caracteres maximo)`;
    }
    return "";
};

export const validateEquipments = async (equipments: string[]) => {
    let arrayEquipments: string[] = [];

    if (!Array.isArray(equipments)) {
        arrayEquipments.push(equipments);
    } else {
        arrayEquipments = equipments;
    }
    console.log(arrayEquipments);
    for (const elm in arrayEquipments) {
        const validId = mongoose.Types.ObjectId.isValid(arrayEquipments[elm]);
        console.log(arrayEquipments[elm], validId);
        if (!validId) return "Un equipo no es valido";
        const equipmentFound = await equipment.findById(arrayEquipments[elm]);
        if (!equipmentFound) return "Un equipo no esta registrado";
    }

    return "";
};

export const validateDescriptions = async (value: any) => {
    let error = "";
    if (!Array.isArray(value)) {
        if (!/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/.test(value) || value.length > 200)
            return (error =
                "la descripcion debe tener un maximo de 200 caracteres");
        return "";
    }
    value.forEach((el: string) => {
        if (!/^[A-Za-z0-9 áéíóúñ'`.(),[{}-]+$/.test(el) || el.length > 200)
            return (error =
                "la descripcion debe tener un maximo de 200 caracteres");
        return;
    });
    return error;
};

export const validateOnlyNumber = async (value: string) => {
    console.log(value);
    if (
        !Number.isInteger(Number(value)) ||
        Number(value) < 0 ||
        value.length > 30 ||
        !/^[0-9]+$/.test(value)
    ) {
        return `El campo numero del bien debe contener solo numeros y tener maximo 30 caracteres sin espacios!`;
    }
    return "";
};

export const validatePassword = async (password:string) =>{
     let error = ''
     const regexMinus = new RegExp(/[a-z]/);
     const regexSpecials = new RegExp(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
     const regexMayuscula = new RegExp(/[A-Z]/)
     const regexNumerico = new RegExp(/[0-9]/)
     if(password.length < 5) error = 'la contraseña debe tener minimo 5 caracteres' 
     if(!regexSpecials.test(password)) error = 'La contraseña no contiene caracteres especiales'
     if(!regexMayuscula.test(password)) error = 'La contraseña no contiene caracteres en mayuscula'
     if(!regexNumerico.test(password)) error = 'La contraseña no contiene caracteres numericos'
     if(!regexMinus.test(password)) error = 'La contraseña no contiene caracteres en minusculas'
     return error
}

export const verifyCreateUser = async (data: any, validatePassword:boolean , userId:string, userChange:string) => {
    const { ci, firstname, lastname, position ,password, verifyPassword, email } = data;
    console.log('datos:',data)
    if (
        !Number(ci) ||
        !Number.isInteger(Number(ci)) ||
        Number(ci) < 0 ||
        !/^\d+$/.test(ci)
    ) {
        return { message: "Parámetros en Cédula inválidos,solo números!" };
    }

    if (ci.length < 4 || ci.length > 12) {
        return { message: "Cedula invalida" };
    }

    if (!/^[A-Za-záéíóúñ'´ ]+$/.test(firstname)) {
        return { message: "Parámetros en Nombre inválidos" };
    }

    if (firstname.length > 40) {
        return { message: "Nombres muy largos maximo 40 caracteres" };
    }

    if (!/^[A-Za-záéíóúñ'´ ]+$/.test(lastname)) {
        return { message: "Parámetros en Apellido inválidos" };
    }

    if (lastname.length > 40) {
        return { message: "Apellidos muy largos maximo 40 caracteres" };
    }

    if (position.length > 40) {
        return { message: "La posicion especificada debe tener maximo 40 caracteres" };
    }

    const validateUserEmail = validateEmail(data.email);
    if (!validateUserEmail) return { message: "Email invalido!" };

    //verify ci
    const foundCi = await user.findOne({ ci: ci });

    //Verify if change for user admin and edit

    if(userId){
        const userAdmin = await user.findById(userId);
        if (userAdmin && foundCi && foundCi.id !== userId){
            const rol = await role.find({ _id: { $in: userAdmin.rol } });
            console.log(userAdmin)
            console.log(rol[0].name)
            if (rol[0].name !== "admin") {
                if(foundCi && userId && foundCi.id !== userId){
                    return { message: "La cedula ya pertenece a otra persona" };
                }
            }else{
                if(foundCi && userChange !== foundCi.id){
                    return { message: "La cedula ya pertenece a otra persona" };
                }
            }
        }
    
    }

    //Check data new user

    if(!userId && foundCi){
        return { message: "La cedula ya pertenece a otra persona" }
    }

    

    //Verify password
    if (password !== verifyPassword && validatePassword)
        return { message: "Las contraseñas no coinciden" };

    //Verify Email exits
    const foundEmail = await user.findOne({ email: email });

    if(userId){
    const userAdmin = await user.findById(userId);
    if (userAdmin && foundEmail && foundEmail.id !== userId){
        const rol = await role.find({ _id: { $in: userAdmin.rol } });
        console.log(userAdmin)
        console.log(rol[0].name)
        if (rol[0].name !== "admin") {
          if (foundEmail && userId && foundEmail.id !== userId)
            return { message: "El email ya pertenece a un usuario" };
          }else{
            if(foundEmail && userChange !== foundEmail.id){
                return { message: "El email ya pertenece a otra persona" };
            }
         }
        }
    }

    if(!userId && foundEmail){
        return { message: "El email ya pertenece a otra persona" };
    }
    

    return false;
};

export const verifyQuestions = async (questions:string[],answers:string[]) =>{
    let error = ''
    if(!Array.isArray(questions) || questions.length < 2 || !Array.isArray(answers) || answers.length < 2 ){
        error = 'Tienes que registrar dos preguntas de seguridad'
        return error
    }

    if(!Array.isArray(questions) || questions.length > 4 || !Array.isArray(answers) || answers.length > 4 ){
        error = 'Tiene que ser maximo cuatro preguntas de seguridad'
        return error
    }

    for(const position in questions){
        if(questions[position] === '' || answers[position] === ''){
            error = 'Completa correctamente los campos'
            return error
        }
    }

    return error
}

export const verifyEquipment = async (data: IEquipment) => {
    let error = "";

    for (const key in data) {
        let validation;
        console.log(data)
        const value = data[key];
        if (key === "description") continue;
        if (key === "asset_number") {
            validation = await validateOnlyNumber(value);
        } else if(key === "model" || key === "brand") {
            console.log(key,value)
            validation = await validateFieldReport(key,value)
        }else{
            validation = await validateFieldEquipment(key, value);
        }
        if (validation) {
            error = validation;
            break;
        }
    }

    return error;
};

export const verifyReport = async (data: ReportModel) => {
    let error = "";
    const { description, register_date, equipments } = data;
    if (!description || !register_date || !equipments) {
        error = "Complete los campos requeridos";
        return error;
    }

    const foundUser = user.findOne({_id:data.user})
    if(!foundUser){
        error = 'No se encontro al usuario a asignar'
        return error
    }

    const foundHq = headquarter.findOne({_id:data.hq})
    if(!foundHq){
        error = 'No se encontro la sede a asignar'
        return error
    }

    for (const key in data) {
        let validation;
        const value = data[key];
        validation = await validateFieldReport(key, value);
        if (key === "description" || key === "note") continue;
        if (
            key === "evidences_description" ||
            key === "evidences_description_old"
        )
            validation = await validateDescriptions(data[key]);
        if (key === "register_date") validation = await validateDate(data[key]);
        if (key === "equipments")
            validation = await validateEquipments(data[key]);

        if (validation) {
            error = validation;
            break;
        }
    }

    return error;
};