import quest from "../models/quest";
import roles from "../models/role";
import user from "../models/user";
export const initialSetup = async () => {
  try {
    //Create rols
    const count = await roles.estimatedDocumentCount();

    if (count <= 0){
         await Promise.all([
      new roles({ name: "admin" }).save(),
      new roles({ name: "moderator" }).save(),
      new roles({ name: "user" }).save(),
    ]);
    console.log("Roles creados");
         
    }

   


    //Create user admin
    const findUser = await user.findOne({ ci: 12345 });
    const foundRoles = await roles.find({ name: { $in: "admin" } });
    if (!findUser) {
      let rolFind = null;
      if (foundRoles) {
        for (const rol of foundRoles) {
          rolFind = rol._id;
        }
      } else {
        console.log("Rol no encontrado");
      }

      const newUser = new user({
        ci: "12345",
        firstname: "Raul",
        lastname: "Herrera",
        email: "raulherrera@mail.com",
        first_login: false,
        position:"Administrador",
        password: await user.encryptPassword("12345"),
        rol: rolFind,
      });
      const userCreated = await newUser.save();
      console.log("Administrador creado!", userCreated);

      //Create security questions admin
      const security_questions = [
        {
          question: "De que color es el caballo blanco?",
          answer: "Blanco",
        },
        {
          question: "Como se hace una silla?",
          answer: "nosexd",
        },
      ];

      const saveQuestions = security_questions.map(async (el) => {
        return {
          question: el.question,
          answer: await quest.encryptAnswer(el.answer),
        };
      });
      for (const elm of saveQuestions) {
        const newQuestion = new quest({
          user: userCreated.id,
          question: (await elm).question,
          answer: (await elm).answer,
        });

        await newQuestion.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};