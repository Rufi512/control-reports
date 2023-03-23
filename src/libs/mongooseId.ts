import { NextFunction } from 'express';
import { MongooseId } from '../types/types';
import equipment from '../models/equipment';
import mongoose from 'mongoose';
//Generate mongoose id from folder and id

export const getIdFolder = (req:MongooseId,_res:any,next:NextFunction) =>{
    let id = new mongoose.Types.ObjectId()
    let pathFolder = `public/contents/evidences/${id}`;
    req["path_folder"] = pathFolder
    req["id"] = id
    next()
}

export const getExistingFolder = (req:MongooseId,res:any,next:NextFunction) =>{
    let id = req.params.id
    const equipmentFound = equipment.findById(req.params.id)
    if(!equipmentFound) return res.status(400).json({message:'Equipment not found'})
    let pathFolder = `public/contents/evidences/${id}`;
    req["path_folder"] = pathFolder
    req["id"] = id
    next()
}

