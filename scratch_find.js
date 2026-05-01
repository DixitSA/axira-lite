const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function run() {
  const email = 'sahild1230@gmail.com';
  console.log(`Searching for business with email: ${email}`);
  
  try {
    const business = await db.business.findFirst({
      where: { email: email }
    });

    if (business) {
      console.log(`FOUND_BUSINESS_ID: ${business.id}`);
      console.log(`Business Name: ${business.name}`);
    } else {
      console.log('Business not found by email.');
      const all = await db.business.findMany({ take: 3 });
      console.log('Recent businesses:', JSON.stringify(all));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await db.$disconnect();
  }
}

run();
