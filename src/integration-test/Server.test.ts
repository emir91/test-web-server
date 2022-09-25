import * as axios from "axios";
import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";
import {
  HTTP_CODES,
  SessionToken,
  UserCredentials,
} from "../app/Models/ServerModels";

axios.default.defaults.validateStatus = function () {
  return true;
};

const serverUrl = "http://localhost:8080";
const itestUserCredentials: UserCredentials = {
  accessRights: [1, 2, 3],
  password: "iTestPassword",
  username: "iTestUser",
};

describe("Server integration test suite", () => {
  let userCredentialsDbAccess: UserCredentialsDbAccess;
  let sessionToken: SessionToken;

  beforeAll(() => {
    userCredentialsDbAccess = new UserCredentialsDbAccess();
  });

  test("server reachable", async () => {
    const response = await axios.default.options(serverUrl);

    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test.skip("put credentials into database", async () => {
    await userCredentialsDbAccess.putUserCredential(itestUserCredentials);
  });

  test("reject invalid credentials", async () => {
    const response = await axios.default.post(`${serverUrl}/login`, {
      username: "wrongName",
      password: "wrongPass",
    });

    expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
  });

  test("login with valid credentials", async () => {
    const response = await axios.default.post(serverUrl + "/login", {
      "username": itestUserCredentials.username,
      "password": itestUserCredentials.password,
    });

    expect(response.status).toBe(HTTP_CODES.CREATED);
    sessionToken = response.data;
  });

  test("query data", async () => {
    const response = await axios.default.get(`${serverUrl}/users?name=some`, {
      headers: {
        Authorization: sessionToken.tokenId,
      },
    });
    expect(response.status).toBe(HTTP_CODES.OK);
  });
});
