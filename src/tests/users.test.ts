import { describe, beforeAll } from "@jest/globals";
import app from "../app";
import request from "supertest";
import "../database";
import mongoose from "mongoose";
import user from "../models/user";
import quest from "../models/quest";
let token: string;
let id_user: string;
let token_new_user: string
let token_revocery: string

beforeAll(async () => {
  // Perform authentication and obtain the necessary token or credentials.
  const response = await request(app).post("/api/auth/login/tests").send({
    user: "12345",
    password: "12345",
  });
  token = response.body.accessToken;

  //Delete user from test (if exists)
  const userData =  await user.findOne({ci:"22727273"})
  if(userData){
    await user.findOneAndDelete({ci:"22727273"});
    await quest.deleteMany({user:userData._id})
  }
});


describe("GET/POST/UPDATE/DELETE - User", () => {

    it("Should be register new user and response with status 200", async ()=>{
        const response = await request(app).post("/api/users/register").set("x-access-token", token).send({firstname: "Federico",
		lastname: "Rodriguez",
		ci: "22727273",
		position: "Manager",
		email: "testemail@email.com",
        password:"123456",
		rol: "user"
        })

        //Check if response is status 200
        expect(response.status).toBe(200)

        //Check Property
        expect(response.body.user).toHaveProperty('ci')
        expect(response.body.user).toHaveProperty('firstname')
        expect(response.body.user).toHaveProperty('lastname')
        expect(response.body.user).toHaveProperty('email')
        expect(response.body.user).toHaveProperty('position')
        expect(response.body.user).toHaveProperty('rol')
        expect(response.body.user).toHaveProperty('first_login')

        id_user = response.body.user._id
    })

    it("Should be get user",async ()=>{
        const response = await request(app).get(`/api/users/detail/${id_user}`).set("x-access-token", token).send({})
        // Check status 200
        expect(response.status).toBe(200)
    })

    it("Should be login for new user",async ()=>{
        const response = await request(app).post('/api/auth/login/tests/').send({user:"22727273", password:"123456"})
        // Check status 200
        expect(response.status).toBe(200)
        //Assign token to use
        token_new_user = response.body.accessToken
    })

    it("Should be login for new user",async ()=>{
        const response = await request(app).post('/api/auth/login/tests/').send({user:"22727273", password:"123456"})
        // Check status 200
        expect(response.status).toBe(200)
        //Assign token to use
        token_new_user = response.body.accessToken
    })

    it("Should be validate new user", async()=>{
        const response = await request(app).post(`/api/auth/verify/user/${id_user}`).set("x-access-token", token_new_user).send({firstname: "Federico",
		lastname: "Rodriguez",
		ci: "22727273",
		position: "Manager",
		email: "testemail@email.com",
        password:"123456",
        verifyPassword:"123456",
        questions:['C','D'],
        answers:['C','D']
        })

        expect(response.status).toBe(200)
    })


    it("Should be login for new user when verified",async ()=>{
        const response = await request(app).post('/api/auth/login/tests/').send({user:"22727273", password:"123456"})
        // Check status 200
        expect(response.status).toBe(200)

        //Assign token to use
        token_new_user = response.body.accessToken

        // First login should be false

        expect(response.body.first_login).toBe(false)
    })


    it("User should be modify own information",async ()=>{
        const response = await request(app).put(`/api/users/update/${id_user}`).set("x-access-token", token_new_user).send({
            firstname: "Federico",
            lastname: "Menendez",
            ci: "22727273",
            position: "Boss",
            email: "testemail@email.com"
        })

        expect(response.status).toBe(200)
    })

    it("Get list from users to select",async ()=>{
        const response = await request(app).get(`/api/users/list/select`).set("x-access-token", token).send({})

        const obj = response.body[0]

        //Check if return array
        expect(Array.isArray(response.body)).toBe(true);
    
        //Check property from obj
        expect(obj).toHaveProperty("label");
        expect(obj).toHaveProperty("value");
    })
})



describe("Recovery - User", () => {

    it("Get quests from the user",async ()=>{
         const response = await request(app).post(`/api/recovery/questions/test`).send({user:"22727273"})
         
         //Check if status 200
         expect(response.status).toBe(200)

         //Check if array
         expect(Array.isArray(response.body.quests)).toBe(true);

         //Check if contain obj question 
         const obj = response.body.quests[0]
         expect(obj).toHaveProperty('question');

    })

    it("Get token when user send answers",async ()=>{
        const response = await request(app).post(`/api/recovery/questions/${id_user}`).send([{answer:"C"}, {answer:"D"}])
        
        //Check if status 200
        expect(response.status).toBe(200)

        const obj = response.body.token
        token_revocery = obj

   })

   it("Change password from the user",async ()=>{
    const response = await request(app).post(`/api/recovery/change/password/user/${id_user}`).set('x-access-token',token_revocery).send({password:"12345678Aa@p", confirmPassword:"12345678Aa@p"})
    
    //Check if status 200
    expect(response.status).toBe(200)

})

})

afterAll((done) => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close();
    done();
});