import 'dotenv/config';
import { db as prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';


async function main() {
  const email = 'admin@devvoltz.com';
  const password = await bcrypt.hash('admin123', 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      password,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
