import * as Nedb from "nedb";
import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";
import { UserCredentials } from "../app/Models/ServerModels";
jest.mock("nedb");

describe("User Credentials BD Access", () => {
  let userCredentialsDbAccess: UserCredentialsDbAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  };

  const someUserCredentials: UserCredentials = {
    username: "someUserName",
    password: "somePassword",
    accessRights: [0, 1, 2],
  };

  beforeEach(() => {
    userCredentialsDbAccess = new UserCredentialsDbAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("putUserCredential - no error", async () => {
    nedbMock.insert.mockImplementationOnce((userCredentials: any, cb: any) => {
      cb();
    });

    await userCredentialsDbAccess.putUserCredential(someUserCredentials);
    expect(nedbMock.insert).toHaveBeenCalledWith(
      someUserCredentials,
      expect.any(Function)
    );
  });

  test("putUserCredential - error", async () => {
    nedbMock.insert.mockImplementationOnce((userCredentials: any, cb: any) => {
      cb(new Error("something went wrong"));
    });

    await expect(
      userCredentialsDbAccess.putUserCredential(someUserCredentials)
    ).rejects.toThrow(new Error("something went wrong"));
    expect(nedbMock.insert).toHaveBeenCalledWith(
      someUserCredentials,
      expect.any(Function)
    );
  });

  test("getUserCredential - no error", async () => {
    nedbMock.find.mockImplementationOnce((userCredentials: any, cb: any) => {
      cb(null, [someUserCredentials]);
    });

    await userCredentialsDbAccess.getUserCredential("test", "test");
    expect(nedbMock.find).toHaveBeenCalledWith(
      { userName: "test", password: "test" },
      expect.any(Function)
    );
  });

  test("getUserCredential - no error no results", async () => {
    nedbMock.find.mockImplementationOnce((userCredentials: any, cb: any) => {
      cb(null, []);
    });

    const result = await userCredentialsDbAccess.getUserCredential(
      "test",
      "test"
    );
    expect(result).toBeNull();
    expect(nedbMock.find).toHaveBeenCalledWith(
      { userName: "test", password: "test" },
      expect.any(Function)
    );
  });

  test("getUserCredential - error", async () => {
    nedbMock.find.mockImplementationOnce((userCredentials: any, cb: any) => {
      cb(new Error("something went wrong"), []);
    });

    await expect(
      userCredentialsDbAccess.getUserCredential("test", "test")
    ).rejects.toThrow("something went wrong");
    expect(nedbMock.find).toHaveBeenCalledWith(
      { userName: "test", password: "test" },
      expect.any(Function)
    );
  });

  test("argument constructor", () => {
    new UserCredentialsDbAccess();
    expect(Nedb).toBeCalledTimes(1);
    expect(Nedb).toBeCalledWith("databases/UsersCredentials.db");
  });
});
