import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateAdminPassword() {
  const email = 'jerome0laval@gmail.com';
  const newPassword = 'Motdepasse13$';

  try {
    // Check if user exists
    const user = await prisma.customer.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User ${email} not found. Creating new admin account...`);

      // Create new admin user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const newUser = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          isVerified: true,
          firstName: 'Jérôme',
          lastName: 'Laval',
        },
      });

      console.log('✅ Admin account created successfully!');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', newPassword);
      console.log('👤 Role:', newUser.role);
      return;
    }

    // Update existing user password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.customer.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        isVerified: true,
      },
    });

    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', newPassword);
    console.log('👤 Role: ADMIN');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
