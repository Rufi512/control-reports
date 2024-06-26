import { Request, Response } from "express";
import quest from "../models/quest";
import user from "../models/user";
import { QuestModel } from "../types/types";

type bodyForm ={
	quests:[{question:string,answer:string}]
}

export const listQuests = async (req: Request, res: Response) => {
	try {
		const questsFound = await quest.find({ user: req.params.id },{user:0});
		return res.json(questsFound);
	} catch (err) {
		console.log(err);
		return res
			.status(404)
			.json({
				message: "Preguntas de seguridad no encontradas",
			});
	}
};

export const setQuestions = async (req: Request, res: Response) => {
	try {
		const {quests}:bodyForm = req.body
		console.log(req.body)
		const userFound = await user.findById(req.params.id);

		if (!userFound)
			return res.status(404).json({ message: "Usuario no encontrado" });

		const questsFound:QuestModel[] = await quest.find({ user: userFound.id }, { answer: 0 });

		if (questsFound.length >= 4 || questsFound.length + quests.length >= 5)
			return res.status(400).json({
				message: "Ya tienes el máximo de 4 preguntas de seguridad",
			});

		const questsRegistered = await quest.find(
			{ user: userFound.id },
			{ answer: 0 }
		);

		const newQuestions:string[] = quests.map((quest)=>quest.question.toLowerCase())

		const duplicatedNewQuestions = newQuestions.filter((item:string, index:number) => newQuestions.indexOf(item) !== index)

		if(duplicatedNewQuestions.length > 0) return res.status(400).json({message:'Las preguntas no se pueden repetir'})

		for (const elm of quests) {
			console.log(newQuestions)
			const sameQuestion = questsRegistered.filter((oldQuests) => {
				return newQuestions.includes(oldQuests.question.toLowerCase());
			});

			console.log(sameQuestion)

			if (sameQuestion.length > 0) return res.status(400).json({message: "Las preguntas no se pueden repetir"});

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
		const questionsRegistered = await quest.find({ user: req.userId});
		if (!questionFound)
			return res
				.status(404)
				.json({ message: "No se ha podido encontrar la pregunta" });
		if (!questionsRegistered || questionsRegistered.length <= 1)
			return res
				.status(404)
				.json({ message: "No se pueden eliminar mas preguntas" });


		await quest.findByIdAndDelete(req.params.id);
		return res.json({ message: "Pregunta eliminada" });
	} catch (e) {
		return res.status(404).json({
			message: "La pregunta no ha podido ser eliminada o no existe",
		});
	}
};