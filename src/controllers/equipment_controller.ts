import { Request, Response } from "express";
import equipment from "../models/equipment";
import moment from "moment";
import { IEquipment } from "../types/types";
import { unlink } from "fs/promises";
import fs from "fs";
import mongoose from "mongoose";

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
    return res.status(200).json({
      data: equipmentFound,
    });
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "No se encontro equipamiento" });
  }
};

export const registerEquipment = async (
  req: any,
  res: Response
): Promise<any> => {
  try {
    const {
      title,
      description,
      asset_number,
      model,
      evidences_description,
      serial,
      brand,
      register_date,
    } = req.body as unknown as IEquipment;

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
      title,
      description,
      asset_number,
      model,
      evidences: evidences_format,
      serial,
      brand,
      register_date: Object({
        day: dateSplit[2],
        month: dateSplit[1],
        year: dateSplit[0],
      }),
    });

    await registerEquipment.save();
    res.json({ message: "Registered!", data: registerEquipment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error to register equipment" });
  }
};

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      asset_number,
      model,
      evidences_description_new,
      evidences_description_old,
      register_date,
      serial,
      brand,
    } = req.body as unknown as IEquipment;

    const equipmentFound = await equipment.findOne({ id: req.params.id });

    const evidences = req.files as Express.Multer.File[];

    //Validate the body and update fields from Equipment
    if (!equipmentFound)
      return res.status(404).json({ message: "Not found equipment" });

    const dateSplit = register_date.split("-").map((el: string) => Number(el));

    let evidencesUpdate;
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
      const descriptionsArray = Array.isArray(evidences_description_new)
        ? evidences_description_new
        : "";
      evidences.forEach((el: any, i: number) => {
        return evidencesUpdate.push({
          file: el.path,
          description:
            (descriptionsArray
              ? descriptionsArray[i]
              : i < 1
              ? evidences_description_new
              : "") ?? "",
        });
      });
    }

    console.log(equipment);
     await equipment.updateOne(
      { id: req.params.id },
      {
        $set: {
          title,
          description,
          asset_number,
          model,
          serial,
          brand,
          register_date: Object({
            day: dateSplit[2],
            month: dateSplit[1],
            year: dateSplit[0],
          }),
          evidences: evidencesUpdate,
        },
      }
    );

 
    return res.status(200).json({
      message:'Datos actualizados',
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error to update equipment" });
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
  
    const equipments = await equipment.paginate(
      date ? {
        $and: [{ 'register_date.year': {$in: [Number(date[0])]}, 'register_date.month':{$in:[Number(date[1])]} }],
      } : {},
      optionsPagination
    );
  
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
  const equipmentFound = await equipment.findById(id);
  if (!equipmentFound)
    return res.status(404).json({
      message: "Equipo no encontrado",
    });
  const dir = `public/contents/evidences/${id}`;

  //delete equipment evidences files
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  await equipment.findByIdAndDelete(id);

  return res.status(200).json({ message: "Registro eliminado!" });
};
