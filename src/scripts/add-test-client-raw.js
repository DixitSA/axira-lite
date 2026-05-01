const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.findFirst();

  if (!business) {
    console.error("No business found.");
    return;
  }

  const client = await prisma.client.create({
    data: {
      businessId: business.id,
      firstName: "Sahil",
      lastName: "Dixit (Test)",
      phone: "5717897078",
      email: "sahil@test.com",
      companyName: "Test Co",
      address: "123 Test St",
      status: "ACTIVE",
    },
  });

  console.log(`Test client created: ${client.firstName} ${client.lastName} (ID: ${client.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
