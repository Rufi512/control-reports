import quest from "../models/quest";
import roles from "../models/role";
import user from "../models/user";
import headquarter from "../models/headquarter";
export const initialSetup = async () => {
  try {
    //Create rols
    const count = await roles.estimatedDocumentCount();

    if (count <= 0) {
      await Promise.all([
        new roles({ name: "admin" }).save(),
        new roles({ name: "moderator" }).save(),
        new roles({ name: "user" }).save(),
      ]);
      console.log("Roles creados");
    }


    //Create headquarter

    const findHq =  await headquarter.find()

    if(findHq.length <= 0){
      await Promise.all([
        new headquarter({
          name:'SEDE PRINCIPAL SUPERIOR',
          location:'EDF. SEDE DEL MINISTERIO PUBLICO, AV. MANAURE CON AV. RUIZ PINEDA, FRENTE DIARIO EL AMANECER',
          municipality:'Miranda',
          city:'Coro',
          state:'Falcón',
          circuit_number:2002
        }).save(),

        new headquarter({
          name:'SEDE EDIF. EMPRESARIAL',
          location:'EDIF. EMPRESARIAL AV. MANAURE ENTRE CALLE CHURUGUARA Y GARCES',
          municipality:'Miranda',
          city:'Coro',
          state:'Falcón',
          circuit_number:1926
        }).save(),

        new headquarter({
          name:'SEDE MUNICIPAL TERCERA',
          location:'SEDE DEL MINISTERIO PUBLICO AV. LIBERTADOR CON AV. INDEPENDENCIA',
          municipality:'Miranda',
          city:'Coro',
          state:'Falcón'
        }).save(),

        new headquarter({
          name:'SEDE NUEVO PUEBLO',
          location:'EDF. MINISTERIO PÚBLICO, NUEVO PUEBLO, CALLE EL CAMBUR',
          municipality:'CARIRUBANA',
          city:'Punto Fijo',
          state:'Falcón'
        }).save(),
        
        new headquarter({
          name:'SEDE ARISMENDI',
          location:'CALLE ECUADOR CON CALLE ARISMENDI',
          municipality:'Carirubana',
          city:'Punto Fijo',
          state:'Falcón',
          circuit_number:3495
        }).save(),

        new headquarter({
          name:'MUNICIPAL PRIMERA',
          location:'SEDE EL MINISTERIO PÚBLICO DE JAYANA, LOS TÁQUES.',
          municipality:'Los Taques',
          city:'Punto Fijo',
          state:'Falcón',
          circuit_number:2002
        }).save(),

        new headquarter({
          name:'Capatarida',
          location:'SEDE MINISTERIO PUBLICO, CALLE LIBERTAD, ENTRE FEDERACION Y BUCHIVACOA',
          municipality:'Buchivacoa',
          state:'Falcón',
          city:'Buchivacoa'
        }).save(),

        new headquarter({
          name:'Tucacas',
          location:'EDF. MINISTERIO PÚBLICO, CARRETERA NACIONAL MORÓN-CORO, CALLE MARINTUSA',
          municipality:'Jose Laurencio Silva',
          state:'Falcón',
          city:'Tucacas'
        }).save()
      ])

      console.log('Sedes creadas!')
    }

    //Create user admin
    const findUser = await user.findOne({ ci: 7689546 });
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
        ci: "7689546",
        firstname: "Admin",
        lastname: "MP",
        email: "mp_email@gob.com.ve",
        first_login: false,
        position: "Administrador",
        password: await user.encryptPassword("Ministerio68@"),
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
