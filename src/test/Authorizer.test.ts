import { Authorizer } from "../app/Authorization/Authorizer";
import { SessionTokenDBAccess } from "../app/Authorization/SessionTokenDBAccess";
import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";
import { Account, SessionToken, TokenState } from "../app/Models/ServerModels";
jest.mock("../app/Authorization/SessionTokenDBAccess");
jest.mock("../app/Authorization/UserCredentialsDbAccess");

describe("Authorizer test suite", () => {
  let authorizer: Authorizer;
  const someAccount = {
    username: "test",
    password: "test",
  };

  const userCredentialsDBAccessMock = {
    getUserCredential: jest.fn(),
  };
  const sessionTokenDBAccessMock = {
    storeSessionToken: jest.fn(),
    getToken: jest.fn(),
  };

  beforeEach(() => {
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDBAccessMock as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("test Authorizer constructor", () => {
    authorizer = new Authorizer();

    expect(SessionTokenDBAccess).toBeCalled();
    expect(UserCredentialsDbAccess).toBeCalled();
  });

  test("should return sessionToken for valid credentials", async () => {
    jest.spyOn(global.Math, "random").mockReturnValueOnce(0);
    jest.spyOn(global.Date, "now").mockReturnValueOnce(0);
    userCredentialsDBAccessMock.getUserCredential.mockReturnValue({
      username: "test",
      accessRights: [1, 2, 3],
    });

    const expectedSessionToken: SessionToken = {
      accessRights: [1, 2, 3],
      userName: "test",
      valid: true,
      expirationTime: new Date(1000 * 60 * 60),
      tokenId: "",
    };

    const sessionToken = await authorizer.generateToken(someAccount);
    expect(expectedSessionToken).toStrictEqual(sessionToken);
    expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(
      sessionToken
    );
  });

  test("should return null for invalid credentials", async () => {
    userCredentialsDBAccessMock.getUserCredential.mockReturnValueOnce(null);

    const sessionToken = await authorizer.generateToken(someAccount);
    expect(sessionToken).toBe(null);
    expect(sessionTokenDBAccessMock.storeSessionToken).not.toBeCalled();
  });

  test("validate token returns invalid for null token", async () => {
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null);
    const validateToken = await authorizer.validateToken("123");
    expect(validateToken).toStrictEqual({
      accessRights: [],
      state: TokenState.INVALID,
    });
  });

  test("validate token returns expired for expired token", async () => {
    const dateInPast = new Date(Date.now() - 1);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
      valid: true,
      expirationTime: dateInPast,
    });
    const validateToken = await authorizer.validateToken("123");
    expect(validateToken).toStrictEqual({
      accessRights: [],
      state: TokenState.EXPIRED,
    });
  });

  test("validate token returns valid for valid token", async () => {
    const dateInFuture = new Date(Date.now() + 1);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
      valid: true,
      expirationTime: dateInFuture,
      accessRights: [1],
    });
    const validateToken = await authorizer.validateToken("123");
    expect(validateToken).toStrictEqual({
      accessRights: [1],
      state: TokenState.VALID,
    });
  });
});
