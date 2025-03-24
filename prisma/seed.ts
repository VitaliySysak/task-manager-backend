import { prisma } from './prisma-client';
import { hashSync } from "bcrypt";

async function up() {
  await prisma.user.createMany({
    data: [
      {
        fullName: 'User',
        email: 'user@test.com',
        password: hashSync("qwerty", 10),
      },
      {
        fullName: 'Admin',
        email: 'admin@test.com',
        password: hashSync("qwerty", 10),
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'food',
        description: 'drink coffee',
        status: false,
      },
      {
        title: 'home',
        description: 'map the floor',
        status: true,
      },
    ],
  });
}

async function down() {
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Task" RESTART IDENTITY CASCADE`;
}

async function main() {
  try {
    await down();
    await up();
  } catch (e) {
    console.error(e);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
