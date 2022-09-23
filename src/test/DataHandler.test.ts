import { DataHandler } from "../app/Handlers/DataHandler";
import {
  HTTP_CODES,
  HTTP_METHODS,
  TokenState,
} from "../app/Models/ServerModels";
import { User, WorkingPosition } from "../app/Models/UserModels";
import { Utils } from "../app/Utils/Utils";

describe("Data handler test suite", () => {
  const someUsers: User[] = [
    {
      age: 123,
      email: "some@email.com",
      id: "1234",
      name: "Some Name",
      workingPosition: WorkingPosition.PROGRAMMER,
    },
  ];
  let dataHandler: DataHandler;
  const reqMock = {
    method: "",
    headers: {
      authorization: "",
    },
  };
  const resMock = {
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0,
  };
  const tokenValidatorMock = {
    validateToken: jest.fn(),
  };
  const usersDBAccessMock = {
    getUsersByName: jest.fn(),
  };
  const parserUrlMock = jest.fn();

  beforeEach(() => {
    dataHandler = new DataHandler(
      reqMock as any,
      resMock as any,
      tokenValidatorMock as any,
      usersDBAccessMock as any
    );
    Utils.parseUrl = parserUrlMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handle options request", async () => {
    reqMock.method = HTTP_METHODS.OPTIONS;

    await dataHandler.handleRequest();

    expect(resMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
  });

  test("handle get request with operation authorized", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "tokenId";
    tokenValidatorMock.validateToken.mockReturnValueOnce({
      accessRights: [1, 2, 3],
      state: TokenState.VALID,
    });
    parserUrlMock.mockReturnValueOnce({
      query: {
        name: "abcd",
      },
    });
    usersDBAccessMock.getUsersByName.mockReturnValueOnce(someUsers);
    await dataHandler.handleRequest();
    expect(usersDBAccessMock.getUsersByName).toBeCalledWith("abcd");
    expect(resMock.writeHead).toBeCalledWith(HTTP_CODES.OK, {
      "Content-Type": "application/json",
    });
    expect(resMock.write).toBeCalledWith(JSON.stringify(someUsers));
  });

  test("handle get request with operation unauthorized", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "tokenId";
    tokenValidatorMock.validateToken.mockReturnValueOnce({
      accessRights: [2, 3],
      state: TokenState.VALID,
    });

    await dataHandler.handleRequest();
    expect(resMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resMock.write).toBeCalledWith("Unauthorized operation!");
  });

  test("handle get request with no authorization header", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "";
    await dataHandler.handleRequest();
    expect(resMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resMock.write).toBeCalledWith("Unauthorized operation!");
  });

  test("handle get request with no name query", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "tokenId";
    tokenValidatorMock.validateToken.mockReturnValueOnce({
      accessRights: [1, 2, 3],
      state: TokenState.VALID,
    });
    parserUrlMock.mockReturnValueOnce({
      query: {
        name: "",
      },
    });
    await dataHandler.handleRequest();
    expect(resMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
    expect(resMock.write).toBeCalledWith(
      "Missing name parameter in the request!"
    );
  });

  test("handle get request - unauthorized", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "tokenId";
    tokenValidatorMock.validateToken.mockReturnValueOnce({
      accessRights: [1, 2, 3],
      state: TokenState.VALID,
    });
    parserUrlMock.mockReturnValueOnce({
      query: {
        name: "",
      },
    });
    await dataHandler.handleRequest();
    expect(resMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
    expect(resMock.write).toBeCalledWith(
      "Missing name parameter in the request!"
    );
  });

  test("handle get request - internal server error", async () => {
    reqMock.method = HTTP_METHODS.GET;
    reqMock.headers.authorization = "tokenId";
    tokenValidatorMock.validateToken.mockRejectedValueOnce(
      new Error("something went wrong")
    );
    parserUrlMock.mockReturnValueOnce({
      query: {
        name: "",
      },
    });
    await dataHandler.handleRequest();
    expect(resMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
    expect(resMock.write).toBeCalledWith(
      "Internal error: " + "something went wrong"
    );
  });

  test("handle unknown request method", async () => {
    reqMock.method = "some random method";
    await dataHandler.handleRequest();
    expect(resMock.write).not.toBeCalled();
  });
});
