import { Request, Response } from "express";
import quest from "../models/quest";
import user from "../models/user";

export const listQuests = async (req: Request, res: Response) => {
	try {
		const questsFound = await quest.find({ user: req.params.id });
		if (!questsFound)
			return res
				.status(404)
				.json({
					message:
						"No se han encontrado preguntas de seguridad del usuario",
				});
		return res.json(questsFound);
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({
				message: "No se ha podido obtener las preguntas de seguridad",
			});
	}
};

export const setQuestions = async (req: any, res: Response) => {
	try {
		const userFound = await user.findById(req.params.id || req.userId);
		if (!userFound)
			return res.status(404).json({ message: "Usuario no encontrado" });
		if (req.params.id && req.rolUser !== "Admin") {
			return res
				.status(404)
				.json({ message: "No se ha encontrado al usuario" });
		}

		const quests = await quest.find({ user: userFound.id }, { answer: 0 });

		if (quests.length >= 4)
			return res.status(400).json({
				message: "Ya tienes el máximo de 4 preguntas de seguridad",
			});
		const questsRegistered = await quest.find(
			{ user: userFound.id },
			{ answer: 0 }
		);

		for (const elm of req.body.quests) {
			const sameQuestion = questsRegistered.filter((el) => {
				el.question.toLowerCase() === elm.question.toLowerCase();
			});
			if (elm.id && !sameQuestion) {
				const foundQuestionId = await quest.findOne(userFound.id, {
					answer: 0,
				});
				if (foundQuestionId && foundQuestionId.id === elm.id)
					return res.status(400).json({
						message: "Las preguntas no se pueden repetir",
					});
			}

			if (elm.question == "" || elm.answer == "")
				return res
					.status(400)
					.json({ message: "Los campos no pueden quedar vacíos!" });
			const createQuestion = new quest({
				user: userFound.id,
				question: elm.question,
				answer: await quest.encryptAnswer(elm.answer),
			});
			await createQuestion.save();
		}

		return res.json({ message: "Preguntas de seguridad creadas!" });
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.json({ message: "Error al guardar preguntas de seguridad" });
	}
};

export const deleteQuestionUser = async (req: any, res: Response) => {
	try {
		const questionFound = await quest.findById(req.params.id);
		const questionsRegistered = await quest.find({ id: req.userId});
		if (!questionFound)
			return res
				.status(404)
				.json({ message: "No se ha podido encontrar la pregunta" });
		if (questionsRegistered.length <= 1)
			return res
				.status(404)
				.json({ message: "No se pueden eliminar mas preguntas" });
		if (!req.rolUser || req.rolUser !== "Admin") {
			if (questionFound.user.toString() !== req.userId) {
				return res
					.status(404)
					.json({ message: "No se ha podido encontrar la pregunta" });
			}
		}

		await quest.findByIdAndDelete(req.params.id);
		return res.json({ message: "Pregunta eliminada" });
	} catch (e) {
		return res.status(404).json({
			message: "La pregunta no ha podido ser eliminada o no existe",
		});
	}
};