import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3] || 'admin123';

  if (!email) {
    console.error('Usage: ts-node reset-password.ts <email> [password]');
    console.error('Example: ts-node reset-password.ts user@example.com mynewpass');
    console.error('Default password: admin123');
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.customer.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
