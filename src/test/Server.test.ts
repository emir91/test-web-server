import { Server } from "../app/Server/Server";
import { LoginHandler } from "../app/Handlers/LoginHandler";
import { Authorizer } from "../app/Authorization/Authorizer";
import { DataHandler } from "../app/Handlers/DataHandler";
import { UsersDBAccess } from "../app/Data/UsersDBAccess";

jest.mock("../app/Handlers/LoginHandler");
jest.mock("../app/Handlers/DataHandler");
jest.mock("../app/Authorization/Authorizer");
jest.mock("../app/Data/UsersDBAccess");

const reqMock = {
  url: "",
};
const resMock = {
  end: jest.fn(),
};
const listenMock = {
  listen: jest.fn(),
};

jest.mock("http", () => ({
  createServer: (cb: any) => {
    cb(reqMock, resMock);
    return listenMock;
  },
}));

describe("Server test suite", () => {
  test("should create server on port 8080", () => {
    new Server().startServer();

    expect(listenMock.listen).toBeCalledWith(8080);
    expect(resMock.end).toBeCalled();
  });

  test("should handle login request", () => {
    reqMock.url = "http://localhost:8080/login";
    new Server().startServer();
    const handleRequestSpy = jest.spyOn(
      LoginHandler.prototype,
      "handleRequest"
    );

    expect(handleRequestSpy).toBeCalled();
    expect(LoginHandler).toBeCalledWith(
      reqMock,
      resMock,
      expect.any(Authorizer)
    );
  });

  test("should handle data request", () => {
    reqMock.url = "http://localhost:8080/users";
    new Server().startServer();
    expect(DataHandler).toBeCalledWith(
      reqMock,
      resMock,
      expect.any(Authorizer),
      expect.any(UsersDBAccess)
    );

    const handleRequestSpy = jest.spyOn(DataHandler.prototype, "handleRequest");

    expect(handleRequestSpy).toBeCalled();
  });
});
