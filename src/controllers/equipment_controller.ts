import { Request, Response } from "express";
import equipment from "../models/equipment";
import moment from "moment";
import { IEquipment } from "../types/types";
import { unlink } from "fs/promises";
import fs from "fs";
import mongoose from "mongoose";
import { verifyEquipment } from "../middlewares/verifyForms";

export const getEquipment = async (req: Request, res: Response) => {
  //Get the equipemnt from the id
  try {
    const validId = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!validId) return res.status(402).json("Identificador no valido");
    const id = req.params.id;
    const equipmentFound = await equipment.findOne({ id: id });
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
      record_type,
      model,
      evidences_description,
      serial,
      brand,
      register_date,
    } = req.body as unknown as IEquipment;
    const validation = await verifyEquipment(req.body)
    console.log(validation)
    if(validation !== '') return res.status(400).json({message:validation})
    const evidences = req.files as Express.Multer.File[];

    const descriptionsArray = Array.isArray(evidences_description)
      ? evidences_description
      : "";
    const evidences_format =
      evidences.map((el: any, i: number) => {
        return {
          file: el.path,
          description:
            (descriptionsArray
              ? descriptionsArray[i]
              : i < 1
              ? evidences_description
              : "") ?? "",
        };
      }) || [];

    const dateSplit = register_date.split("-").map((el: string) => Number(el));

    const registerEquipment = new equipment({
      id: req["id"] || "",
      description,
      asset_number,
      model,
      evidences: evidences_format,
      serial,
      brand,
      record_type,
      register_date: Object({
        day: dateSplit[2],
        month: dateSplit[1],
        year: dateSplit[0],
      }),
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
      evidences_description,
      evidences_description_old,
      register_date,
      serial,
      record_type,
      brand,
    } = req.body as unknown as IEquipment;
    const validation = await verifyEquipment(req.body)

    if(validation !== '') return res.status(400).json({message:validation})

    const equipmentFound = await equipment.findOne({ id: req.params.id });

    const evidences = req.files as Express.Multer.File[];

    //Validate the body and update fields from Equipment
    if (!equipmentFound)
      return res.status(404).json({ message: "No se encontro el equipo" });

    const dateSplit = register_date.split("-").map((el: string) => Number(el));

    let evidencesUpdate = [];
    //Update the equipmentData evidences old
    if (evidences_description_old) {
      const descriptionsArray = Array.isArray(evidences_description_old)
        ? evidences_description_old
        : "";
      evidencesUpdate = equipmentFound.evidences?.map((el: any, i: number) => {
        return {
          file: el.file,
          description:
            (descriptionsArray
              ? descriptionsArray[i]
              : i < 1
              ? evidences_description_old
              : "") ?? "",
        };
      });
    }

    //update the equiment evidences new
    if (evidences) {
      console.log(evidences)
      const descriptionsArray = Array.isArray(evidences_description)
        ? evidences_description
        : "";
      evidences.forEach((el: any, i: number) => {
        return evidencesUpdate.push({
          file: el.path,
          description:
            (descriptionsArray
              ? descriptionsArray[i]
              : i < 1
              ? evidences_description
              : "") ?? "",
        });
      });
    }

    console.log(equipment);
     await equipment.updateOne(
      { id: req.params.id },
      {
        $set: {
          description,
          asset_number,
          model,
          serial,
          brand,
          record_type,
          register_date: Object({
            day: dateSplit[2],
            month: dateSplit[1],
            year: dateSplit[0],
          }),
          updated_at:new Date(),
          evidences: evidencesUpdate,
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

export const list = async (req: Request, res: Response) => {
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
    console.log(date,optionsPagination)
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
  
    if (equipments.totalDocs < 0) {
      return res.status(404).json({ message: "Registros no encontrados" });
    }
  
    return res.json(equipments);
  }catch(err){
    console.log(err)
    return res.status(500).json({message:'No hay resultados disponibles'})
  }

};

export const deleteEvidences = async (req: Request, res: Response) => {
  //Obtain the id from the equipment params and delete the evidences in array
  try {
    const id = req.params.id;
    const equipmentFound = await equipment.findOne({ id: id });
    const deleteEvidences: number[] = req.body.evidences_position;

    if (!equipmentFound) {
      return res.status(404).json({
        status: 404,
        message: "Equipment not found",
      });
    }

    if (!Array.isArray(deleteEvidences)) {
      console.log(deleteEvidences);
      return res.status(400).json({
        message: "The evidences position must be an array of numbers",
      });
    }

    //delete evidences files
    equipmentFound.evidences?.forEach(async (el: any, i: number) => {
      if (deleteEvidences.indexOf(i) > -1) {
        if (fs.existsSync(el.file)) {
          await unlink(el.file);
        }
      }
    });

    let updateEvidences = equipmentFound.evidences?.filter(
      (el: any, i: number) => {
        console.log(deleteEvidences.indexOf(i));
        if (deleteEvidences.indexOf(i) < 0) return el;
      }
    );

    await equipment.updateOne(
      { id: id },
      {
        $set: {
          evidences: updateEvidences,
        },
      }
    );

    return res.status(200).json({
      message: 'Archivo/s eliminado/s',
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "No se pudieron eliminar los archivos" });
  }
};

export const deleteEquipment = async (req: Request, res: Response) => {
  const id = req.params.id;
  const equipmentFound = await equipment.findOne({id});
  if (!equipmentFound)
    return res.status(404).json({
      message: "Equipo no encontrado",
    });
  const dir = `public/contents/evidences/${id}`;

  //delete equipment evidences files
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  await equipment.findOneAndDelete({id});

  return res.status(200).json({ message: "Registro eliminado!" });
};
