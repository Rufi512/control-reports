import multer from 'multer'
import path from 'path'
import fs from 'fs'
import moment from 'moment'
import { IEquipment } from '../types/types'
import mongoose from 'mongoose'

const storage = multer.diskStorage({
    destination:(req:any,_file,cb)=>{
        //Create own folder and set id for files
        const directory = req["path_folder"]
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true })
          }
        cb(null, directory);
    },
    filename: (_, file, cb,) => {
        cb(null, new mongoose.Types.ObjectId() + path.extname(file.originalname));
    }
});

const filter = function (req: any, file:any, cb:any) {
    const {description,model,asset_number, register_date, brand, serial} = req.body as IEquipment
    // Check req.body
    if(!description || !model || !asset_number || !register_date || !brand || !serial){
        return cb(new Error('Los campos no fueron completados!'))
    }

    // Check register_date
    const date = register_date.split('-').join('/')

    const isValidTime = moment(date, 'YYYY/MM/DD',true).isValid()

    if(!isValidTime) return cb(new Error('Fecha de registro invalido'))

    if (
        !file.originalname.match(/\.(jpg|png|jpeg|mp3|mp4|ogg|pdf|doc|docx)$/) 
        //|| !file.mimmetype.match(/image:\/(jpg|png|jpeg|mp3|mp4|ogg|pdf|doc|docx)$/)
        ) {
        return cb(new Error("Only aceppt format jpg, png, jpeg, mp3,mp4, ogg, pdf, doc, docx"));
    }
    cb(null, true);
}

export default multer({storage,fileFilter:filter})