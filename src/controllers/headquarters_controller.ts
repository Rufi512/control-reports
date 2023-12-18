import { Request, Response } from "express";
import headquarter from "../models/headquarter";
import moment from "moment";
import { headquarterModel } from "../types/types";

export const infoHq = async (req: Request, res: Response) => {
  try {
    const hqFound = await headquarter.findById(req.params.id);
    if (!hqFound)
      return res.status(404).json({ message: "No se ha encontrado la sede" });
    return res.json(hqFound);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "No se ha encontrado la sede" });
  }
};

export const listHq = async (req: Request, res: Response) => {
  try {
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
      limit:
        req.query && Number(req.query.limit) ? Number(req.query.limit) : 10,
      page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
      sort: { created_at: -1 },
    };
    console.log(String(`${dateQuery}`));
    const search = req.query.search || "";

    const headquarters = await headquarter.paginate(
      {
        $or: [
          { name: new RegExp(String(search), "gi") },
          { state: new RegExp(String(search), "gi") },
          { location: new RegExp(String(search), "gi") },
          { municipality: new RegExp(String(search), "gi") },
          { city: new RegExp(String(search), "gi") },
          { phone: new RegExp(String(search), "gi") },
          { circuit_number: new RegExp(String(search), "gi") },
        ],
        $and: [
          date
            ? {
                "register_date.year": { $in: [Number(date[0])] },
                "register_date.month": { $in: [Number(date[1])] },
              }
            : {},
        ],
      },
      optionsPagination
    );

    return res.json(headquarters);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const listSelectHq = async (req:Request, res:Response) => {
    try {
      let optionsPagination = {
        lean: false,
        limit: req.query && Number(req.query.limit) ? Number(req.query.limit) : 50,
        page: req.query && Number(req.query.page) ? Number(req.query.page) : 1,
      };
      const search = req.query.search || ''
  
      const headquarters = await headquarter.paginate({
        $or: [
            { name: new RegExp(String(search), "gi") },
            { state: new RegExp(String(search), "gi") },
            { location: new RegExp(String(search), "gi") },
            { municipality: new RegExp(String(search), "gi") },
            { city: new RegExp(String(search), "gi") },
            { phone: new RegExp(String(search), "gi") },
            { circuit_number: new RegExp(String(search), "gi") },
        ],
    },optionsPagination)
  
      let newList = [];
      
      for (const elm of headquarters.docs) {
        newList.push({
          label: `${elm.name} - ${elm.state} - ${elm.city} - ${elm.municipality}`,
          value: elm.id,
        });
      }
  
      return res.json(newList);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
  };

export const registerHq = async (req: Request, res: Response) => {
  try {
    const { name, state, location, municipality, city, phone, circuit_number } =
      req.body;
    const newHq = new headquarter({
      name,
      state,
      location,
      municipality,
      city,
      phone,
      circuit_number,
      created_at:Date.now()
    });

    await newHq.save();

    return res.json({ message: "Sede registrada!", headquarter:newHq });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "Error al registrar, verifique los campos" });
  }
};

export const updateHq = async (req: Request, res: Response) => {
  try {
    const hqFound = await headquarter.findById(req.params.id);
    if (!hqFound)
      return res.status(404).json({ message: "No se ha encontrado la sede" });

    const { name, state, location, municipality, city, phone, circuit_number } =
      req.body as headquarterModel;

    await headquarter.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name,
          state,
          location,
          municipality,
          city,
          phone,
          circuit_number,
          updated_at: new Date(),
        },
      }
    );

    return res.json({ message: "Sede Actualizada!" });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ message: "Error al actualizar, verifique los campos" });
  }
};


export const deleteHq = async (req:Request,res:Response) =>{
    try{
        const hqFound = await headquarter.findById(req.params.id);
        if (!hqFound) return res.status(404).json({ message: "No se ha encontrado la sede" });
        await headquarter.deleteOne({_id:req.params.id})
        return res.json({message:'Sede eliminada'})
    }catch(err){
        console.log(err)
        return res.status(404).json({message:'No se ha encontrado la sede'})
    }
}