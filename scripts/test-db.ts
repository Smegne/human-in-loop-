import 'dotenv/config';
import { db } from '../src/lib/db';
async function main() {
  console.log('Testing CRUD operations...');
  
  // 1. Create a user
  const user = await db.user.create({
    data: {
      email: 'test@devvoltz.com',
      password: 'hashedpassword123',
      role: 'ADMIN',
      name: 'Test Admin'
    }
  });
  console.log('Created User:', user.email);

  // 2. Read the user
  const foundUser = await db.user.findUnique({
    where: { email: 'test@devvoltz.com' }
  });
  console.log('Found User:', foundUser?.email);

  // 3. Update the user
  const updatedUser = await db.user.update({
    where: { email: 'test@devvoltz.com' },
    data: { name: 'Test Admin Updated' }
  });
  console.log('Updated User name:', updatedUser.name);

  // 4. Delete the user
  await db.user.delete({
    where: { email: 'test@devvoltz.com' }
  });
  console.log('Deleted User');

  console.log('CRUD tests passed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
