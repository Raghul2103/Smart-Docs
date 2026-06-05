import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import User from "../models/User.js";
import Document from "../models/Document.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 120000); // 120 second timeout for DB downloads

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 120000);

beforeEach(async () => {
  await User.deleteMany({});
  await Document.deleteMany({});
});

describe("Document API Integration Tests", () => {
  const user1Data = {
    name: "Alice Smith",
    email: "alice@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  const user2Data = {
    name: "Bob Jones",
    email: "bob@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it(
    "should successfully register users, create documents, and share them",
    async () => {
      // 1. Register User 1 (Alice)
      const registerRes1 = await request(app)
        .post("/api/auth/register")
        .send(user1Data);
      expect(registerRes1.status).toBe(201);
      expect(registerRes1.body).toHaveProperty("token");
      const aliceToken = registerRes1.body.token;

      // 2. Register User 2 (Bob)
      const registerRes2 = await request(app)
        .post("/api/auth/register")
        .send(user2Data);
      expect(registerRes2.status).toBe(201);
      const bobEmail = registerRes2.body.email;

      // 3. Create Document (Alice)
      const createDocRes = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({});
      expect(createDocRes.status).toBe(201);
      expect(createDocRes.body.title).toBe("Untitled Document");
      const docId = createDocRes.body._id;

      // 4. Share Document with Bob (Alice)
      const shareRes = await request(app)
        .post(`/api/documents/${docId}/share`)
        .set("Authorization", `Bearer ${aliceToken}`)
        .send({ email: bobEmail });
      expect(shareRes.status).toBe(200);
      expect(shareRes.body.message).toBe("Document shared successfully");

      // Check backend state
      const doc = await Document.findById(docId);
      expect(doc.sharedWith).toHaveLength(1);
    },
    120000
  );

  it(
    "should block non-owners from sharing or deleting documents",
    async () => {
      // Register Alice
      const resAlice = await request(app).post("/api/auth/register").send(user1Data);
      const aliceToken = resAlice.body.token;

      // Register Bob
      const resBob = await request(app).post("/api/auth/register").send(user2Data);
      const bobToken = resBob.body.token;

      // Create Doc (Alice)
      const createDocRes = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${aliceToken}`);
      const docId = createDocRes.body._id;

      // Bob attempts to delete Alice's doc
      const deleteRes = await request(app)
        .delete(`/api/documents/${docId}`)
        .set("Authorization", `Bearer ${bobToken}`);
      expect(deleteRes.status).toBe(403);

      // Bob attempts to share Alice's doc
      const shareRes = await request(app)
        .post(`/api/documents/${docId}/share`)
        .set("Authorization", `Bearer ${bobToken}`)
        .send({ email: "random@example.com" });
      expect(shareRes.status).toBe(403);
    },
    120000
  );
});
