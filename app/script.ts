import { prisma } from './lib/prisma'

async function main() {
  await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      password: 'password123',
      role: 'ADMIN',
    },
  })
  console.log('User created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
