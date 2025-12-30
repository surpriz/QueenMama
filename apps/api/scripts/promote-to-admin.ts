import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: ts-node promote-to-admin.ts <email>');
    console.error('Example: ts-node promote-to-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    // Find user
    const user = await prisma.customer.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`✅ User ${email} is already an ADMIN`);
      process.exit(0);
    }

    // Promote to ADMIN
    const updated = await prisma.customer.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Successfully promoted ${email} to ADMIN`);
    console.log(`   User ID: ${updated.id}`);
    console.log(`   Name: ${updated.firstName} ${updated.lastName}`);
    console.log(`   Role: ${updated.role}`);
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
