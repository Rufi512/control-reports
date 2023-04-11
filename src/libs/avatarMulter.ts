import multer from 'multer'
import path from 'path'
import fs from 'fs'
import mongoose from 'mongoose'

const storage = multer.diskStorage({
    destination:(_req:any,_file,cb)=>{
        const directory = `public/users/avatar/`
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

const filter = async function (_req: any, file:any, cb:any) {

    if (
        !file.originalname.match(/\.(jpg|png|jpeg|webp)$/) 
        ) {
        return cb(new Error("Only aceppt format jpg, png, jpeg, mp3,mp4, ogg, pdf, doc, docx"));
    }
    cb(null, true);
}

export default multer({storage,fileFilter:filter})