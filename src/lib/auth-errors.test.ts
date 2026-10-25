import { describe, expect, it } from "vitest";
import { describeAuthError, isAlreadyRegisteredError, isWeakPasswordError } from "./auth-errors";

describe("isWeakPasswordError", () => {
  it("reconhece o código weak_password", () => {
    expect(isWeakPasswordError({ code: "weak_password", status: 422 })).toBe(true);
  });

  it("reconhece a mensagem de senha vazada recebida em produção", () => {
    expect(
      isWeakPasswordError({
        status: 422,
        message: "Password is known to be weak and easy to guess, please choose a different one.",
      }),
    ).toBe(true);
  });

  it("não trata e-mail duplicado como senha fraca", () => {
    expect(isWeakPasswordError({ code: "email_exists", message: "A user with this email address has already been registered" })).toBe(false);
  });
});

describe("isAlreadyRegisteredError", () => {
  it("reconhece o código email_exists", () => {
    expect(isAlreadyRegisteredError({ code: "email_exists" })).toBe(true);
  });
});

describe("describeAuthError", () => {
  it("inclui código, status e motivo", () => {
    expect(describeAuthError({ code: "unexpected_failure", status: 500, message: "boom" })).toEqual({
      code: "unexpected_failure",
      status: 500,
      name: null,
      message: "boom",
    });
  });
});
