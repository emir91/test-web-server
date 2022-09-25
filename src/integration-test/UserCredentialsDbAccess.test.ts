import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";
import { UserCredentials } from "../app/Models/ServerModels";

describe("UserCredentialsDbAccess integration test suite", () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;
  let someUserCredentials: UserCredentials;
  const randomString = Math.random().toString(36).substring(7);

  beforeAll(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess();
    someUserCredentials = {
      accessRights: [1, 2, 3],
      username: "someUser",
      password: randomString,
    };
  });

  test("should store and retrieve UserCredentials", async () => {
    await userCredentialsDBAccess.putUserCredential(someUserCredentials);
    const result = await userCredentialsDBAccess.getUserCredential(
      someUserCredentials.username,
      someUserCredentials.password
    );

    expect(result).toMatchObject(someUserCredentials);
  });
});
