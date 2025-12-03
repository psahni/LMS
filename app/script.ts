import { prisma } from './lib/prisma'

async function main() {
  await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      role: 'admin',
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
