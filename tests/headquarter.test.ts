import { describe, beforeAll } from "@jest/globals";
import app from "../src/app";
import request from "supertest";
import "../src/database";
import mongoose from "mongoose";
import headquarter from "../src/models/headquarter";
let token: string;
let id_hq: string;

beforeAll(async () => {
  // Perform authentication and obtain the necessary token or credentials.
  const response = await request(app).post("/api/auth/login/tests").send({
    user: "12345",
    password: "12345",
  });
  token = response.body.accessToken;

  //Delete headquarter from test (if exists)

  await headquarter.findOneAndDelete({name:"TEST"});
});

describe("GET/POST/UPDATE/DELETE - Headquarter", () => {

    it("Should be response code 200 and array of objects", async () => {
        const response = await request(app)
          .get("/api/headquarter/list")
          .set("x-access-token", token)
          .send();
        expect(response.headers["content-type"]).toEqual(
          expect.stringContaining("json")
        );
        expect(response.status).toBe(200);
        // verify object
        const obj = response.body.docs[0];
        expect(obj).toHaveProperty("_id");
        expect(obj).toHaveProperty("name");
        expect(obj).toHaveProperty("state");
        expect(obj).toHaveProperty("location");
        expect(obj).toHaveProperty("municipality");
        expect(obj).toHaveProperty("city");
        expect(obj).toHaveProperty("phone");
        expect(obj).toHaveProperty("circuit_number");
        expect(obj).toHaveProperty("created_at");
        expect(obj).toHaveProperty("updated_at");
      });

    it("should be register a headquarter", async () => {
        const response = await request(app)
          .post("/api/headquarter/register")
          .set("x-access-token", token)
          .send({name:"TEST",state:"Lara", location:"TEST",municipality:"TEST",city:"Coro",phone:"+5879644523698",circuit_number:"038374"});
        
        // Verify object
        id_hq = response.body.headquarter._id;
        expect(response.status).toBe(200);
      })

      it("should be edit register from the headquarter", async () => {
        const response = await request(app)
          .put(`/api/headquarter/update/${id_hq}`)
          .set("x-access-token", token)
          .send({name:"TEST",state:"Lara", location:"TEST CHANGED",municipality:"TEST CHANGED",city:"Cumarebo",phone:"+46424323432",circuit_number:"038374"});

        expect(response.status).toBe(200);
      });

      it("should be get the headquarter", async () => {
        const response = await request(app)
          .get(`/api/headquarter/info/${id_hq}`)
          .set("x-access-token", token)
          .send();
        const obj = response.body;
        expect(response.status).toBe(200);
        expect(obj).toHaveProperty("_id");
        expect(obj).toHaveProperty("name");
        expect(obj).toHaveProperty("state");
        expect(obj).toHaveProperty("location");
        expect(obj).toHaveProperty("municipality");
        expect(obj).toHaveProperty("city");
        expect(obj).toHaveProperty("phone");
        expect(obj).toHaveProperty("circuit_number");
      });

      it("should be get the headquarter from the list for select", async () => {
        const response = await request(app)
          .get(`/api/headquarter/list/select`)
          .set("x-access-token", token)
          .send();
        const obj = response.body[0];
    
        //Check if response is status 200
        expect(response.status).toBe(200);
    
        //Check if return array
        expect(Array.isArray(response.body)).toBe(true);
    
        //Check property from obj
        expect(obj).toHaveProperty("label");
        expect(obj).toHaveProperty("value");
      });
    
      it("should be delete the headquarter", async () => {
        const response = await request(app)
          .delete(`/api/headquarter/delete/${id_hq}`)
          .set("x-access-token", token)
          .send();
        expect(response.status).toBe(200);
      });

})

afterAll((done) => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close();
    done();
  });