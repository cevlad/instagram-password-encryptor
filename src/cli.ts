import yargs from "yargs";
import { InstagramPasswordEncryptor } from "./InstagramPasswordEncryptor";

yargs(process.argv.slice(2))
  .usage("Usage: $0 <command> [options]")
  .example(
    "$0 encrypt --password 12345 --key-id 174 --public-key 1573624dd38b59c63e828671c6a6b4f90789a56f29f62e3553c87cbc75dd1673 --algorithm 10",
    "encrypts the transmitted password"
  )
  .command(
    "encrypt",
    "encrypts the transmitted password",
    (yargs) => {
      yargs.option("password", {
        alias: "p",
        type: "string",
      });
      yargs.option("keyId", {
        alias: "i",
        type: "number",
      });
      yargs.option("publicKey", {
        alias: "k",
        type: "string",
      });
      yargs.option("algorithm", {
        alias: "a",
        type: "number",
        default: 10,
      });
      yargs.demandOption(["password", "keyId", "publicKey", "algorithm"]);
    },
    (args: { password: string; keyId: number; publicKey: string; algorithm: number }) => {
      const { password, keyId, publicKey, algorithm: version } = args;

      if (!password || !keyId || !publicKey || !version) {
        console.error("Something went wrong");
        process.exit(1);
      }

      const instagramPasswordEncryptor = new InstagramPasswordEncryptor({
        keyId,
        publicKey,
        version,
      });

      try {
        console.log(instagramPasswordEncryptor.encrypt(password));
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    }
  )
  .demandCommand(1)
  .help()
  .wrap(120)
  .parse();
