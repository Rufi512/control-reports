import { describe, beforeAll } from "@jest/globals";
import app from "../app";
import request from "supertest";
import "../database";
import mongoose from "mongoose";
import equipment from "../models/equipment";
let token: string;
let id_equip: string;

beforeAll(async () => {
  // Perform authentication and obtain the necessary token or credentials.
  const response = await request(app).post("/api/auth/login/tests").send({
    user: "12345",
    password: "12345",
  });
  token = response.body.accessToken;

  //Delete equiment from test (if exists)

  await equipment.findOneAndDelete({ asset_number: "32345214" });
});

describe("GET/POST/UPDATE/DELETE - Equipments", () => {

  it("Should be response code 200 and array of objects", async () => {
    const response = await request(app)
      .get("/api/equipments/list")
      .set("x-access-token", token)
      .send();
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json")
    );
    expect(response.status).toBe(200);
    // verify object
    const obj = response.body.docs[0];
    expect(obj).toHaveProperty("_id");
    expect(obj).toHaveProperty("description");
    expect(obj).toHaveProperty("created_at");
    expect(obj).toHaveProperty("updated_at");
    expect(obj).toHaveProperty("model");
    expect(obj).toHaveProperty("brand");
    expect(obj).toHaveProperty("serial");
    expect(obj).toHaveProperty("register_date");
  });

  it("should be register a equipment", async () => {
    const response = await request(app)
      .post("/api/equipments/register")
      .set("x-access-token", token)
      .send({
        model: "TEST",
        serial: "T001112221",
        asset_number: "32345214",
        description: "I am description",
        brand: "TEST2BRAND",
      });
    id_equip = response.body.data._id;
    expect(response.status).toBe(200);
  });

  it("should be edit register from the equiment", async () => {
    const response = await request(app)
      .put(`/api/equipments/update/${id_equip}`)
      .set("x-access-token", token)
      .send({
        model: "TEST CHANGED",
        serial: "T002321",
        asset_number: "32345214",
        description: "I am new description",
        brand: "TEST2BRAND",
      });
    expect(response.status).toBe(200);
  });

  it("should be get the equiment", async () => {
    const response = await request(app)
      .get(`/api/equipments/info/${id_equip}`)
      .set("x-access-token", token)
      .send();
    const obj = response.body;
    expect(response.status).toBe(200);
    expect(obj).toHaveProperty("_id");
    expect(obj).toHaveProperty("description");
    expect(obj).toHaveProperty("created_at");
    expect(obj).toHaveProperty("updated_at");
    expect(obj).toHaveProperty("model");
    expect(obj).toHaveProperty("brand");
    expect(obj).toHaveProperty("serial");
    expect(obj).toHaveProperty("register_date");
  });

  it("should be get the equiment from the list for select", async () => {
    const response = await request(app)
      .get(`/api/equipments/select/list`)
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

  it("should be delete the equipment", async () => {
    const response = await request(app)
      .delete(`/api/equipments/delete/${id_equip}`)
      .set("x-access-token", token)
      .send();
    expect(response.status).toBe(200);
  });
  
});

afterAll((done) => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close();
  done();
});
