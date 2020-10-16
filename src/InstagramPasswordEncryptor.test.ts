import { InstagramPasswordEncryptor } from "./InstagramPasswordEncryptor";

const keyId = 174;
const publicKey = "1573624dd38b59c63e828671c6a6b4f90789a56f29f62e3553c87cbc75dd1673";

describe("InstagramPasswordEncryptor", () => {
  describe("encrypt", () => {
    test("should return a string", () => {
      const instagramPasswordEncryptor = new InstagramPasswordEncryptor({ keyId, publicKey });

      const encryptedPassword = instagramPasswordEncryptor.encrypt("12345");

      expect(typeof encryptedPassword).toBe("string");
    });

    test("the returned string must start with '#PWD_INSTAGRAM_BROWSER:'", () => {
      const instagramPasswordEncryptor = new InstagramPasswordEncryptor({ keyId, publicKey });

      const encryptedPassword = instagramPasswordEncryptor.encrypt("qwerty123");

      expect(encryptedPassword).toContain("#PWD_INSTAGRAM_BROWSER:");
    });
  });
});
