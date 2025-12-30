import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    // Count users
    const userCount = await prisma.customer.count();
    console.log(`📊 Total users in database: ${userCount}`);

    // List all users
    const users = await prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log('\n👥 All users:');
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.role}) - ${user.firstName} ${user.lastName}`);
    });

    // Count campaigns
    const campaignCount = await prisma.campaign.count();
    console.log(`\n📋 Total campaigns in database: ${campaignCount}`);

    // List all campaigns
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        customer: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log('\n📨 All campaigns:');
    campaigns.forEach((campaign) => {
      console.log(`   - ${campaign.name} (${campaign.status}) - Owner: ${campaign.customer.email}`);
    });

  } catch (error) {
    console.error('❌ Error checking data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
