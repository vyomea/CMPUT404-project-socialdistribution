import argon2 from "argon2";
import Author from "./models/Author";
import db from "./db";

async function main() {
  if (process.argv.length < 4 || process.argv.length > 5) {
    console.log(`Usage: npm run create-admin <email> <password> [displayName]`);
    process.exit(1);
  }

  const [email, password] = process.argv.slice(2);
  const displayName = process.argv[4] || email;

  await db.sync({ alter: true });

  const passwordHash = await argon2.hash(password);
  await Author.create({
    email,
    passwordHash,
    displayName,
    isAdmin: true,
  });

  console.log(`Successfuly created admin ${displayName} (${email})`);
}

main();
