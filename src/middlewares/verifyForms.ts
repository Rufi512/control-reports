import moment from "moment";
import { IEquipment } from "../types/types";

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
    const data = date.split('-').join('/')

    const isValidTime = moment(data, 'YYYY/MM/DD',true).isValid()
    
    if(!isValidTime) return 'La fecha introducida es invalida'

    return "";
};

export const validateFieldEquipment = async (field: string, value: string) => {
    if (!/^[a-zA-Z0-9áéíóúñ]+$/.test(value) || value.length > 30) {
        if(field === 'record_type' && value.length <= 30) return ''
        return `El campo ${field} es invalido: (debe tener 30 caracteres maximo y sin espacios)`;
    }
    return "";
};

export const validateDescriptions = async (value:any) =>{
    let error = ''
    if(!Array.isArray(value)){
        if (!/^[a-zA-Z0-9áéíóúñ ]+$/.test(value) || value.length > 200) return error = 'la descripcion debe tener un maximo de 200 caracteres' 
        return ''
    }
    value.forEach((el:string)=>{
        if (!/^[a-zA-Z0-9áéíóúñ ]+$/.test(el) || el.length > 200) return error = 'la descripcion debe tener un maximo de 200 caracteres'
        return
    })
    return error
}

export const validateOnlyNumber = async (value: string) => {
    console.log(value);
    if (!Number.isInteger(Number(value)) || Number(value) < 0 || value.length > 30 || !/^[0-9]+$/.test(value) ) {
        return `El campo numero del bien debe contener solo numeros y tener maximo 30 caracteres sin espacios!`;
    }
    return "";
};

export const verifyCreateUser = async (data: any) => {
    const { ci, firstname, lastname } = data;

    if (
        !Number(ci) ||
        !Number.isInteger(Number(ci)) ||
        Number(ci) < 0 ||
        !/^\d+$/.test(ci)
    ) {
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

    const validateUserEmail = validateEmail(data.email);
    if (!validateUserEmail) return { message: "Email invalido!" };

    return false;
};

export const verifyEquipment = async (data: IEquipment) => {
    let error = "";
    const {description,model,asset_number, register_date, brand, serial , record_type} = data 
    console.log(data)
    if(!description || !model || !asset_number || !register_date || !brand || !serial || !record_type){
        error = 'Los campos necesarios no fueron completados!'
        return error
    }

    for (const key in data) {
        let validation;
        const value = data[key];
        if (
            key === "description" ||
            key === "evidences" ||
            key === "register_date_format"
        )
            continue;
        if (key === "asset_number") {
            validation = await validateOnlyNumber(value);
        } else if (key === "register_date") {
            validation = await validateDate(value);
        } else if(key === "evidences_description" ||
            key === "evidences_description_old" ||
            key === "evidences_description_new"){
            validation = await validateDescriptions(value);
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