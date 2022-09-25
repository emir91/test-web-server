import { SessionTokenDBAccess } from "../app/Authorization/SessionTokenDBAccess";
import * as Nedb from "nedb";
import { SessionToken } from "../app/Models/ServerModels";
jest.mock("nedb");

describe("SessionTokenDBAccess test suite", () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const someToken: SessionToken = {
    accessRights: [],
    expirationTime: new Date(),
    tokenId: "123",
    username: "John",
    valid: true,
  };

  const someTokenId = "123";

  beforeEach(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("store session token - no error", async () => {
    nedbMock.insert.mockImplementation((someToken: any, cb: any) => {
      cb();
    });
    await sessionTokenDBAccess.storeSessionToken(someToken);
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  });

  test("store session token - error", async () => {
    nedbMock.insert.mockImplementation((someToken: any, cb: any) => {
      cb(new Error("something went wrong"));
    });
    await expect(
      sessionTokenDBAccess.storeSessionToken(someToken)
    ).rejects.toThrow("something went wrong");
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  });

  test("get token - no error", async () => {
    nedbMock.find.mockImplementation((someTokenId: string, cb: any) => {
      cb(null, [someToken]);
    });
    const tokenResult = await sessionTokenDBAccess.getToken(someTokenId);

    expect(tokenResult).toBe(someToken);
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("get token - no error and no result", async () => {
    nedbMock.find.mockImplementation((someTokenId: string, cb: any) => {
      cb(null, []);
    });
    const tokenResult = await sessionTokenDBAccess.getToken(someTokenId);

    expect(tokenResult).toBe(undefined);
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("get token - error", async () => {
    nedbMock.find.mockImplementation((someTokenId: string, cb: any) => {
      cb(new Error("something went wrong"));
    });

    await expect(sessionTokenDBAccess.getToken(someTokenId)).rejects.toThrow(
      "something went wrong"
    );
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("delete token - no error", async () => {
    nedbMock.remove.mockImplementation((someTokenId: string, {}, cb: any) => {
      cb(null, 1);
    });
    const tokenResult = await sessionTokenDBAccess.deleteToken(someTokenId);

    expect(tokenResult).toBeUndefined();
    expect(nedbMock.remove).toBeCalledWith(
      { tokenId: someTokenId },
      {},
      expect.any(Function)
    );
  });

  test("delete token - error", async () => {
    nedbMock.remove.mockImplementation((someTokenId: string, {}, cb: any) => {
      cb(new Error("something went wrong"));
    });

    await expect(sessionTokenDBAccess.deleteToken(someTokenId)).rejects.toThrow(
      "something went wrong"
    );
    expect(nedbMock.remove).toBeCalledWith(
      { tokenId: someTokenId },
      {},
      expect.any(Function)
    );
  });

  test("delete missing session token - throws an error", async () => {
    nedbMock.remove.mockImplementation((someTokenId: string, {}, cb: any) => {
      cb(null, []);
    });

    await expect(sessionTokenDBAccess.deleteToken(someTokenId)).rejects.toThrow(
      "SessionToken not deleted"
    );
    expect(nedbMock.remove).toBeCalledWith(
      { tokenId: someTokenId },
      {},
      expect.any(Function)
    );
  });

  test("constructor argument", async () => {
    new SessionTokenDBAccess();
    expect(Nedb).toBeCalledWith("databases/sessionToken.db");
  });
});
