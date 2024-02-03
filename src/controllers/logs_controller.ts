import log from "../models/log";
import { Request, Response } from "express";
import moment from "moment";
import user from "../models/user";
import equipment from "../models/equipment";
import report from "../models/report";
import { RequestUser } from "../types/types";
import role from "../models/role";

export const listLogs = async (req: Request, res: Response) => {
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
			sort:{created_at:-1},
			limit:
				req.query && Number(req.query.limit)
					? Number(req.query.limit)
					: 10,
			page:
				req.query && Number(req.query.page)
					? Number(req.query.page)
					: 1,
			populate: "user",
		};

		const logs = await log.paginate(
			{
				$and: [
					date
						? {
								"register_date.year": {
									$in: [Number(date[0])],
								},
								"register_date.month": {
									$in: [Number(date[1])],
								},
						  }
						: {},
				],
			},
			optionsPagination
		);

		if (logs.totalDocs < 0) {
			return res
				.status(404)
				.json({ message: "Registros no encontrados" });
		}

		return res.json(logs);
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "No hay resultados disponibles" });
	}
};

export const resumeAdmin = async (req: Request, res: Response) => {
	try {
		let optionsPaginationLogs = {
			lean: false,
			limit:
				req.query && Number(req.query.limit)
					? Number(req.query.limit)
					: 5,
			page:
				req.query && Number(req.query.page)
					? Number(req.query.page)
					: 1,
			populate: "user",
			sort: { created_at: -1 } 
		};

		let optionsPaginationUser = {
			lean: false,
			limit:
				req.query && Number(req.query.limit)
					? Number(req.query.limit)
					: 5,
			page:
				req.query && Number(req.query.page)
					? Number(req.query.page)
					: 1,
			sort: { created_at: -1 },
			populate:"rol" 
		};

		let optionsPagination = {
			lean: false,
			limit:
				req.query && Number(req.query.limit)
					? Number(req.query.limit)
					: 5,
			page:
				req.query && Number(req.query.page)
					? Number(req.query.page)
					: 1,
			sort: { created_at: -1 } 
		};

		const listLogs = await log.paginate({}, optionsPaginationLogs);

		const listUsers = await user.paginate({}, optionsPaginationUser);

		const listEquipments = await equipment.paginate({}, optionsPagination);

		const listReports = await report.paginate({}, optionsPagination);

		return res.json({
			logs: listLogs.docs,
			users: listUsers.docs,
			equipments: listEquipments.docs,
			reports: listReports.docs,
			length_data: {equipments:(await equipment.find()).length, reports:(await report.find()).length, users:(await user.find()).length}
		});
	} catch (err) {
		console.log(err);
		return res
			.status(404)
			.json({ message: "No se ha podido encontrar resumen" });
	}
};

export const resumeUser = async (req: RequestUser, res: Response) => {
	try {
		let optionsPagination = {
			lean: false,
			limit:
				req.query && Number(req.query.limit)
					? Number(req.query.limit)
					: 5,
			page:
				req.query && Number(req.query.page)
					? Number(req.query.page)
					: 1,
			sort: { created_at: -1 } ,
			
		};

		//Check if user is admin
		let isAdmin = false
		const userFound = await user.findById(req.userId);
		if (!userFound)
		  return res.status(401).json({ message: "No se encontro al usuario" });
		const rol = await role.find({ _id: { $in: userFound.rol } });
		if (rol[0].name === "admin") {
			isAdmin = true
		}
		
		const listEquipments = await equipment.paginate(!isAdmin ? {$and:[{user:req.userId}]} : {}, optionsPagination);

		const listReports = await report.paginate(!isAdmin ? {$and:[{user:req.userId}]} : {}, optionsPagination);

		return res.json({
			equipments: listEquipments.docs,
			reports: listReports.docs,
			length_data: {equipments:(await equipment.find()).length, reports:(await report.find()).length}
		});
	} catch (err) {
		console.log(err);
		return res
			.status(404)
			.json({ message: "No se ha podido encontrar resumen" });
	}
};