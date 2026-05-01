import { db } from "../lib/db";

async function main() {
  const business = await db.business.findFirst();

  if (!business) {
    console.error("No business found.");
    return;
  }

  const client = await db.client.create({
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
    await db.$disconnect();
  });
