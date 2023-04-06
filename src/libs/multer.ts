import multer from 'multer'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'
import { verifyReport } from '../middlewares/verifyForms';

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
        console.log(file)
        cb(null, new mongoose.Types.ObjectId() + path.extname(file.originalname));
    }
});

const filter = async function (req: any, file:any, cb:any) {
   const validation = await verifyReport(req.body)

   if(validation !== '') return cb(new Error(validation))

    if (
        !file.originalname.match(/\.(jpg|png|jpeg|mp3|mp4|ogg|pdf|doc|docx|webp)$/) 
        ) {
        return cb(new Error("Only aceppt format jpg, png, jpeg, mp3,mp4, ogg, pdf, doc, docx"));
    }
    cb(null, true);
}

export default multer({storage,fileFilter:filter})