import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import { authRouter, inMemoryUsers } from "../server/auth";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

describe("authentication", () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    inMemoryUsers.set("test@example.com", {
      id: "test_1",
      email: "test@example.com",
      name: "Test User",
      passwordHash,
    });
  });

  it("rejects wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "wrong-password",
      });

    expect(response.status).toBe(401);
    expect(response.body.authenticated).not.toBe(true);
  });

  it("accepts valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "correct-password",
      });

    expect(response.status).toBe(200);
    expect(response.body.authenticated).toBe(true);
  });
});
