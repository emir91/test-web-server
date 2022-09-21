import * as Nedb from "nedb";
import { User, WorkingPosition } from "../app/Models/UserModels";
import { UsersDBAccess } from "../app/Data/UsersDBAccess";

jest.mock("nedb");
// jest.mock("../app/Models/UserModels");

describe("UserDBAccess test suite", () => {
  let usersDBAccessMock: UsersDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  };

  const someUser: User = {
    age: 25,
    email: "some@email.com",
    id: "someId",
    name: "someName",
    workingPosition: WorkingPosition.ENGINEER,
  };

  const someOtherUser: User = {
    age: 26,
    email: "someOther@email.com",
    id: "someId",
    name: "someName",
    workingPosition: WorkingPosition.ENGINEER,
  };

  beforeEach(() => {
    usersDBAccessMock = new UsersDBAccess(nedbMock as any);

    expect(nedbMock.loadDatabase).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("putUser - no error", async () => {
    nedbMock.insert.mockImplementationOnce((user: any, cb: any) => {
      cb();
    });

    await usersDBAccessMock.putUser(someUser);
    expect(nedbMock.insert).toBeCalledWith(someUser, expect.any(Function));
  });

  test("putUser - error", async () => {
    nedbMock.insert.mockImplementationOnce((user: any, cb: any) => {
      cb(new Error("something went wrong"));
    });

    await expect(usersDBAccessMock.putUser(someUser)).rejects.toThrow(
      "something went wrong"
    );
    expect(nedbMock.insert).toBeCalledWith(someUser, expect.any(Function));
  });

  test("getUsersByName - no error", async () => {
    nedbMock.find.mockImplementationOnce((obj: Object, cb: any) => {
      cb(null, [someUser, someOtherUser]);
    });

    const result = await usersDBAccessMock.getUsersByName("some");
    expect(result).toEqual([someUser, someOtherUser]);
    expect(nedbMock.find).toBeCalledWith(
      { name: new RegExp("some") },
      expect.any(Function)
    );
  });

  test("getUsersByName - error", async () => {
    nedbMock.find.mockImplementationOnce((obj: Object, cb: any) => {
      cb(new Error("something went wrong"), []);
    });

    await expect(usersDBAccessMock.getUsersByName("some")).rejects.toThrow(
      "something went wrong"
    );
  });

  test("constructor argument", () => {
    new UsersDBAccess();

    expect(Nedb).toBeCalledTimes(1);
    expect(Nedb).toBeCalledWith("databases/Users.db");
  });
});
