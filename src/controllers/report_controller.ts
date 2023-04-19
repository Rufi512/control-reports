
import { Request, Response } from "express";
import report from "../models/report";
import fs from "fs";
import { unlink } from "fs/promises";
import { ReportModel } from "../types/types";
import mongoose from "mongoose";
import equipment from "../models/equipment";
import moment from "moment";
import user from "../models/user";


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
      populate: 'equipments'
    };

    const search = req.query.search || ''
    const reports = await report.paginate({
      $or: [
          { record_type: new RegExp(String(search), "gi")},
      ],
      $and: [date ? { 'register_date.year': {$in: [Number(date[0])]}, 'register_date.month':{$in:[Number(date[1])]} } : {}],
  },
  optionsPagination);
  
    if (reports.totalDocs < 0) {
      return res.status(404).json({ message: "Registros no encontrados" });
    }
  
    return res.json(reports);
  }catch(err){
    console.log(err)
    return res.status(500).json({message:'No hay resultados disponibles'})
  }

};

export const getReport = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    console.log(id);
    const validId = mongoose.Types.ObjectId.isValid(id);
    if (!validId) return res.status(402).json("Identificador no valido");
    const reportFound = await report.findOne({ id: id }).populate("equipments").populate("user",{firstname:1,ci:1,lastname:1,position:1});
    if (!reportFound)
      return res.status(404).json({ message: "Reporte no encontrado" });
    return res.json(reportFound);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Reporte no encontrado" });
  }
};

export const registerReport = async (req: any, res: Response) => {
  try {
    const {
      description,
      record_type,
      register_date,
      equipments,
      evidences_description,
      note,
      userId
    } = req.body as ReportModel;
    
    const foundUser = await user.findOne({_id:userId})

    if(!foundUser) return res.status(404).json({message:'No se ha podido asignar al usuario'})

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

    let arrayEquipments: string[] = [];

    if (!Array.isArray(equipments)) {
      arrayEquipments.push(equipments);
    } else {
      arrayEquipments = equipments;
    }

    for (const elm in arrayEquipments) {
      const validId = mongoose.Types.ObjectId.isValid(arrayEquipments[elm]);
      if (!validId)
        return res.status(401).json({ message: "Un equipo no es valido" });
      const equipmentFound = await equipment.findById(arrayEquipments[elm]);
      if (!equipmentFound)
        return res
          .status(401)
          .json({ message: "Un equipo no esta registrado" });
    }

    const createReport = new report({
      id: req["id"] || "",
      description,
      record_type,
      equipments,
      evidences: evidences_format,
      register_date: Object({
        day: dateSplit[2],
        month: dateSplit[1],
        year: dateSplit[0],
      }),
      note,
      user:userId
    });
    await createReport.save();
    return res.json({ message: "Reporte registrado!", data: createReport });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al registrar el reporte" });
  }
};

export const updateReport = async (req: any, res: Response) => {
  try {
    const {
      description,
      record_type,
      register_date,
      equipments,
      evidences_description,
      evidences_description_old,
      note,
      userId
    } = req.body as ReportModel;

    const reportFound = await report.findOne({ id: req.params.id });

    if (!reportFound)
      return res.status(404).json({ message: "No se encontro el reporte" });

    const foundUser = await user.findOne({_id:userId})

    if(!foundUser) return res.status(404).json({message:'No se ha podido asignar al usuario'})

    const dateSplit = register_date.split("-").map((el: string) => Number(el));

    const evidences = req.files as Express.Multer.File[];

    let arrayEquipments: string[] = [];

    if (!Array.isArray(equipments)) {
      arrayEquipments.push(equipments);
    } else {
      arrayEquipments = equipments;
    }

    for (const elm in arrayEquipments) {
      const validId = mongoose.Types.ObjectId.isValid(arrayEquipments[elm]);
      if (!validId)
        return res.status(401).json({ message: "Un equipo no es valido" });
      const equipmentFound = await equipment.findById(arrayEquipments[elm]);
      if (!equipmentFound)
        return res
          .status(401)
          .json({ message: "Un equipo no esta registrado" });
    }

    let evidencesUpdate = [];
    //Update the equipmentData evidences old
    if (evidences_description_old) {
      const descriptionsArray = Array.isArray(evidences_description_old)
        ? evidences_description_old
        : "";
      evidencesUpdate = reportFound.evidences?.map((el: any, i: number) => {
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
      console.log(evidences);
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

    await report.updateOne(
      { id: req.params.id },
      {
        $set: {
          description,
          record_type,
          note,
          equipments,
          register_date: Object({
            day: dateSplit[2],
            month: dateSplit[1],
            year: dateSplit[0],
          }),
          updated_at: new Date(),
          evidences: evidencesUpdate,
          user:userId
        },
      }
    );

    return res.json({ message: "Reporte actualizado!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al registrar el reporte" });
  }
};

export const deleteEvidences = async (req: Request, res: Response) => {
  //Obtain the id from the equipment params and delete the evidences in array
  try {
    const id = req.params.id;
    const reportFound = await report.findOne({ id: id });
    const deleteEvidences: number[] = req.body.evidences_position;

    if (!reportFound) {
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
    reportFound.evidences?.forEach(async (el: any, i: number) => {
      if (deleteEvidences.indexOf(i) > -1) {
        if (fs.existsSync(el.file)) {
          await unlink(el.file);
        }
      }
    });

    let updateEvidences = reportFound.evidences?.filter(
      (el: any, i: number) => {
        console.log(deleteEvidences.indexOf(i));
        if (deleteEvidences.indexOf(i) < 0) return el;
      }
    );

    await report.updateOne(
      { id: id },
      {
        $set: {
          evidences: updateEvidences,
        },
      }
    );

    return res.status(200).json({
      message: "Archivo/s eliminado/s",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "No se pudieron eliminar los archivos" });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  const id = req.params.id;
  const reportFound = await report.findOne({ id });
  if (!reportFound)
    return res.status(404).json({
      message: "Equipo no encontrado",
    });
  const dir = `public/contents/evidences/${id}`;

  //delete equipment evidences files
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  await equipment.findOneAndDelete({ id });

  return res.status(200).json({ message: "Registro eliminado!" });
};