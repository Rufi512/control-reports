import { Request, Response } from "express";
import equipment from "../models/equipment";
import { IEquipment } from "../types/types";
import mongoose from "mongoose";
import { verifyEquipment } from "../middlewares/verifyForms";
import moment from "moment";

export const getEquipment = async (req: Request, res: Response) => {
  //Get the equipemnt from the id
  try {
    const validId = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!validId) return res.status(402).json("Identificador no valido");
    const id = req.params.id;
    const equipmentFound = await equipment.findById(id);
    if (!equipmentFound) {
      return res.status(404).json({
        status: 404,
        message: "Equipment not found",
      });
    }
    return res.status(200).json(equipmentFound);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "No se encontro equipo" });
  }
};

export const registerEquipment = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const {
      description,
      asset_number,
      model,
      serial,
      brand,
    } = req.body as unknown as IEquipment;
     
     const validation = await verifyEquipment(req.body)
     
     if(validation !== '') return res.status(400).json({message:validation})

    //find if assets_number and serial is registered
    const findEquipment = await equipment.findOne({$or: [{serial: serial},{asset_number: asset_number}]})

    if(findEquipment) return res.status(404).json({message:'El equipo ha sido registrado anteriormente'})

    // Register equipment 
    const registerEquipment = new equipment({
      description,
      asset_number,
      model,
      serial,
      brand,
    });

    await registerEquipment.save();
    res.json({ message: "Equipo registrado!", data: registerEquipment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al registrar el equipo" });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const {
      description,
      asset_number,
      model,
      serial,
      brand,
    } = req.body as unknown as IEquipment;
     
    const validation = await verifyEquipment(req.body)
     
    if(validation !== '') return res.status(400).json({message:validation})

    const equipmentFound = await equipment.findById(req.params.id);
     //Validate the body and update fields from Equipment
    if (!equipmentFound) return res.status(404).json({ message: "No se encontro el equipo" });

    //find if assets_number and serial is registered
    const findEquipment = await equipment.findOne({$or: [{serial: serial},{asset_number: asset_number}]})

    if(findEquipment){
      if(findEquipment.id !== req.params.id){
        if(findEquipment.serial === serial || findEquipment.asset_number === asset_number) return res.status(404).json({message:'El equipo ha sido registrado anteriormente'})
      }
  }
   
     await equipment.updateOne(
      { _id: req.params.id },
      {
        $set: {
          description,
          asset_number,
          model,
          serial,
          brand,
          updated_at:new Date(),
        },
      }
    );
 
    return res.status(200).json({
      message:'Datos actualizados',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error al actualizar el equipo" });
  }
};

export const list = async (req:Request,res:Response) =>{
  try{
    const dateQuery = String(req.query.date) || "";
    let date;
  
    if (dateQuery && req.query.date) {
      if (!moment(dateQuery, "YYYY-MM", true).isValid())
        return res
          .status(404)
          .json({ message: "La fecha introducida no es valida :(" });
      date = dateQuery.split("-");
    }

    let optionsPagination = {
      lean: false,
      limit: req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
      page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
    };
    console.log(String(`${dateQuery}`))
    const search = req.query.search || ''

    const equipments = await equipment.paginate({
      $or: [
          { brand: new RegExp(String(search), "gi") },
          { model: new RegExp(String(search), "gi") },
          { serial: new RegExp(String(search), "gi") },
          { asset_number: new RegExp(String(search), "gi") },
      ],
      $and: [date ? { 'register_date.year': {$in: [Number(date[0])]}, 'register_date.month':{$in:[Number(date[1])]} } : {}],
  },
  optionsPagination);

  return res.json(equipments)
  }catch(error){
    console.log(error)
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

export const listSelect = async (req:Request, res:Response) => {
  try {
    let optionsPagination = {
      lean: false,
      limit: req.query && Number(req.query.limit) ? Number(req.query.limit) : 50,
      page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
    };
    const search = req.query.search || ''

    const equipments = await equipment.paginate({
      $or: [
          { brand: new RegExp(String(search), "gi") },
          { model: new RegExp(String(search), "gi") },
          { serial: new RegExp(String(search), "gi") },
          { asset_number: new RegExp(String(search), "gi") },
      ],
  },optionsPagination)

    let newList = [];
    
    for (const elm of equipments.docs) {
      newList.push({
        label: `${elm.asset_number} - ${elm.model} - ${elm.brand} - ${elm.serial}`,
        value: elm.id,
      });
    }

    return res.json(newList);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  const id = req.params.id;
  const equipmentFound = await equipment.findById(id);
  if (!equipmentFound)
    return res.status(404).json({
      message: "Equipo no encontrado",
    });

  await equipment.findByIdAndDelete(id);

  return res.status(200).json({ message: "Registro eliminado!" });
};


