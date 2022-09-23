import { Utils } from "../app/Utils/Utils";

describe("Get Request test suite", () => {
  const reqMock = {
    on: jest.fn(),
  };

  jest.mock("http", () => {
    request: jest.fn().mockImplementation((url, options, cb) => {
      cb(reqMock);
    });
  });

  const someObject = {
    name: "Jamo",
    age: 45,
    city: "Vares",
  };

  const someObjAsString = JSON.stringify(someObject);

  test("getRequestBody - valid JSON", async () => {
    reqMock.on.mockImplementation((event, cb) => {
      if (event == "data") {
        cb(someObjAsString);
      } else {
        cb();
      }
    });

    const result = await Utils.getRequestBody(reqMock as any);

    expect(result).toEqual(someObject);
  });

  test("getRequestBody - invalid JSON", async () => {
    reqMock.on.mockImplementation((event, cb) => {
      if (event == "data") {
        cb("4" + someObjAsString);
      } else {
        cb();
      }
    });

    await expect(Utils.getRequestBody(reqMock as any)).rejects.toThrow(
      "Unexpected token { in JSON at position 1"
    );
  });

  test("getRequestBody - unexpected error", async () => {
    const someError = new Error("something went wrong");

    reqMock.on.mockImplementation((event, cb) => {
      if (event == "error") {
        cb(someError);
      } else if (event == "data") {
        cb(someObjAsString);
      }
    });

    await expect(Utils.getRequestBody(reqMock as any)).rejects.toThrow(
      someError.message
    );
  });
});
