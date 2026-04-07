import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function hoursLater(base, hours) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  await prisma.reminderMessage.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.job.deleteMany();
  await prisma.client.deleteMany();
  await prisma.business.deleteMany();

  const business = await prisma.business.create({
    data: {
      name: "Apex Detail Co.",
      industryType: "Auto Detailing",
      phone: "5551234567",
      email: "hello@apexdetail.com",
      timezone: "America/New_York",
    },
  });

  const clientData = [
    { firstName: "Marcus", lastName: "Webb", phone: "5550101010", email: "marcus.webb@email.com", companyName: null, daysAgoLastJob: 5 },
    { firstName: "Priya", lastName: "Sharma", phone: "5550202020", email: "priya@sharma.biz", companyName: "Sharma Realty", daysAgoLastJob: 10 },
    { firstName: "Derek", lastName: "Nguyen", phone: "5550303030", email: null, companyName: null, daysAgoLastJob: 15 },
    { firstName: "Carla", lastName: "Reyes", phone: "5550404040", email: "carla.reyes@email.com", companyName: null, daysAgoLastJob: 20 },
    { firstName: "Tom", lastName: "Fitzgerald", phone: "5550505050", email: "tfitz@corp.com", companyName: "Fitzgerald Auto", daysAgoLastJob: 25 },
    { firstName: "Aisha", lastName: "Brooks", phone: "5550606060", email: null, companyName: null, daysAgoLastJob: 28 },
    { firstName: "James", lastName: "Kowalski", phone: "5550707070", email: "j.kowalski@email.com", companyName: null, daysAgoLastJob: 35 },
    { firstName: "Natalie", lastName: "Chen", phone: "5550808080", email: "nchen@biz.net", companyName: "Chen Enterprises", daysAgoLastJob: 40 },
    { firstName: "Reuben", lastName: "Torres", phone: "5550909090", email: null, companyName: null, daysAgoLastJob: 45 },
    { firstName: "Fiona", lastName: "Patel", phone: "5551010100", email: "fiona.patel@email.com", companyName: null, daysAgoLastJob: 50 },
    { firstName: "Bryan", lastName: "Osei", phone: "5551111110", email: null, companyName: null, daysAgoLastJob: 55 },
    { firstName: "Simone", lastName: "Laurent", phone: "5551212120", email: "simone@laurent.fr", companyName: "Laurent Imports", daysAgoLastJob: 58 },
    { firstName: "Kevin", lastName: "Murphy", phone: "5551313130", email: null, companyName: null, daysAgoLastJob: 65 },
    { firstName: "Diane", lastName: "Walsh", phone: "5551414140", email: "d.walsh@email.com", companyName: null, daysAgoLastJob: 70 },
    { firstName: "Antoine", lastName: "Dubois", phone: "5551515150", email: null, companyName: null, daysAgoLastJob: 75 },
    { firstName: "Helen", lastName: "Kim", phone: "5551616160", email: "h.kim@corp.net", companyName: "Kim Auto Group", daysAgoLastJob: 80 },
    { firstName: "Patrick", lastName: "Stone", phone: "5551717170", email: null, companyName: null, daysAgoLastJob: 85 },
    { firstName: "Yuki", lastName: "Tanaka", phone: "5551818180", email: "y.tanaka@email.com", companyName: null, daysAgoLastJob: 90 },
    { firstName: "Omar", lastName: "Hassan", phone: "5551919190", email: null, companyName: null, daysAgoLastJob: 95 },
    { firstName: "Celeste", lastName: "Moreau", phone: "5552020200", email: "c.moreau@email.com", companyName: null, daysAgoLastJob: 100 },
    { firstName: "Grant", lastName: "Holloway", phone: "5552121210", email: null, companyName: null, daysAgoLastJob: 110 },
    { firstName: "Ingrid", lastName: "Bjorn", phone: "5552222220", email: "ingrid.b@email.com", companyName: "Nordic Fleet", daysAgoLastJob: 115 },
    { firstName: "Samuel", lastName: "Carter", phone: "5552323230", email: null, companyName: null, daysAgoLastJob: 125 },
    { firstName: "Leila", lastName: "Nassar", phone: "5552424240", email: "l.nassar@email.com", companyName: null, daysAgoLastJob: 130 },
    { firstName: "Claude", lastName: "Bernard", phone: "5552525250", email: null, companyName: null, daysAgoLastJob: 140 },
    { firstName: "Mei", lastName: "Zhang", phone: "5552626260", email: "mei.zhang@biz.com", companyName: "Zhang Motors", daysAgoLastJob: 150 },
    { firstName: "Tyler", lastName: "Grant", phone: "5552727270", email: null, companyName: null, daysAgoLastJob: 160 },
    { firstName: "Rosa", lastName: "Martinez", phone: "5552828280", email: "rosa.m@email.com", companyName: null, daysAgoLastJob: 180 },
    { firstName: "Kwame", lastName: "Asante", phone: "5552929290", email: null, companyName: null, daysAgoLastJob: 200 },
    { firstName: "Vera", lastName: "Petrov", phone: "5553030300", email: "v.petrov@email.com", companyName: null, daysAgoLastJob: 365 },
  ];

  const services = ["Full Detail", "Interior Only", "Exterior Only", "Paint Correction", "Ceramic Coating", "Engine Bay Detail"];
  const addresses = ["123 Oak Street", "456 Maple Ave", "789 Pine Rd", "321 Elm Dr", "654 Cedar Blvd", "987 Birch Ln"];

  let invoiceNum = 1001;
  const createdClients = [];

  for (const cd of clientData) {
    const lastJobAt = daysAgo(cd.daysAgoLastJob);
    const totalRevenue = randomBetween(800, 8000);

    const client = await prisma.client.create({
      data: {
        businessId: business.id,
        firstName: cd.firstName,
        lastName: cd.lastName,
        phone: cd.phone,
        email: cd.email,
        companyName: cd.companyName,
        lastJobAt,
        totalRevenue,
        outstandingBalance: 0,
      },
    });
    createdClients.push({ client, cd });

    // 2-3 historical jobs (completed+paid)
    const jobCount = randomBetween(2, 3);
    for (let j = 0; j < jobCount; j++) {
      const daysBack = cd.daysAgoLastJob + (j + 1) * randomBetween(20, 40);
      const start = daysAgo(daysBack);
      const amount = randomBetween(150, 900);
      const job = await prisma.job.create({
        data: {
          businessId: business.id,
          clientId: client.id,
          title: pick(services),
          address: pick(addresses),
          scheduledStart: start,
          scheduledEnd: hoursLater(start, randomBetween(2, 5)),
          status: "COMPLETED",
          finalAmount: amount,
          completedAt: hoursLater(start, 3),
          invoicedAt: hoursLater(start, 24),
        },
      });
      await prisma.invoice.create({
        data: {
          businessId: business.id,
          clientId: client.id,
          jobId: job.id,
          invoiceNumber: `INV-${invoiceNum++}`,
          amount,
          paidAmount: amount,
          issueDate: hoursLater(start, 24),
          dueDate: hoursLater(start, 24 * 30),
          status: "PAID",
          paidDate: hoursLater(start, 24 * randomBetween(5, 20)),
        },
      });
    }

    // Most-recent job matching lastJobAt
    const recentAmount = randomBetween(200, 1200);
    const recentJob = await prisma.job.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        title: pick(services),
        address: pick(addresses),
        scheduledStart: lastJobAt,
        scheduledEnd: hoursLater(lastJobAt, randomBetween(2, 5)),
        status: "COMPLETED",
        finalAmount: recentAmount,
        completedAt: hoursLater(lastJobAt, 3),
        invoicedAt: hoursLater(lastJobAt, 24),
      },
    });

    // Invoice status based on recency
    let invStatus, invPaidAmount, invPaidDate, dueDate;
    if (cd.daysAgoLastJob <= 5) {
      invStatus = "PENDING"; invPaidAmount = 0; invPaidDate = null;
      dueDate = daysFromNow(25);
    } else if (cd.daysAgoLastJob <= 20) {
      invStatus = "PENDING"; invPaidAmount = 0; invPaidDate = null;
      dueDate = daysFromNow(randomBetween(5, 15));
    } else if (cd.daysAgoLastJob <= 45) {
      invStatus = "OVERDUE"; invPaidAmount = 0; invPaidDate = null;
      dueDate = daysAgo(randomBetween(3, 20));
    } else {
      invStatus = "PAID"; invPaidAmount = recentAmount;
      invPaidDate = hoursLater(lastJobAt, 24 * randomBetween(5, 25));
      dueDate = hoursLater(lastJobAt, 24 * 30);
    }

    await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        jobId: recentJob.id,
        invoiceNumber: `INV-${invoiceNum++}`,
        amount: recentAmount,
        paidAmount: invPaidAmount,
        issueDate: hoursLater(lastJobAt, 24),
        dueDate,
        status: invStatus,
        paidDate: invPaidDate,
      },
    });
  }

  // Scheduled jobs: 2 today, 2 tomorrow
  for (let i = 0; i < 4; i++) {
    const { client } = createdClients[i];
    const start = i < 2 ? daysFromNow(0) : daysFromNow(1);
    start.setHours(8 + i * 2, 0, 0, 0);
    await prisma.job.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        title: pick(services),
        address: pick(addresses),
        scheduledStart: start,
        scheduledEnd: hoursLater(start, 3),
        status: "SCHEDULED",
        quotedAmount: randomBetween(200, 800),
      },
    });
  }

  // IN_PROGRESS jobs
  for (let i = 4; i < 6; i++) {
    const { client } = createdClients[i];
    const start = daysFromNow(0);
    start.setHours(7, 0, 0, 0);
    await prisma.job.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        title: pick(services),
        address: pick(addresses),
        scheduledStart: start,
        scheduledEnd: hoursLater(start, 4),
        status: "IN_PROGRESS",
        quotedAmount: randomBetween(300, 900),
      },
    });
  }

  // Completed jobs with no invoice (for Action Center uninvoiced jobs count)
  for (let i = 6; i < 9; i++) {
    const { client } = createdClients[i % createdClients.length];
    const start = daysAgo(randomBetween(3, 10));
    await prisma.job.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        title: pick(services),
        address: pick(addresses),
        scheduledStart: start,
        scheduledEnd: hoursLater(start, 3),
        status: "COMPLETED",
        finalAmount: randomBetween(200, 700),
        completedAt: hoursLater(start, 3),
        invoicedAt: null,
      },
    });
  }

  // Draft invoices
  for (let i = 0; i < 3; i++) {
    const { client } = createdClients[i];
    await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        invoiceNumber: `INV-${invoiceNum++}`,
        amount: randomBetween(150, 500),
        paidAmount: 0,
        issueDate: daysAgo(randomBetween(1, 5)),
        dueDate: daysFromNow(randomBetween(20, 30)),
        status: "DRAFT",
      },
    });
  }

  // Invoices due soon (within 3 days)
  for (let i = 0; i < 3; i++) {
    const { client } = createdClients[i + 2];
    await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        invoiceNumber: `INV-${invoiceNum++}`,
        amount: randomBetween(300, 800),
        paidAmount: 0,
        issueDate: daysAgo(25),
        dueDate: daysFromNow(randomBetween(1, 3)),
        status: "PENDING",
      },
    });
  }

  // Update client outstanding balances
  const allClients = await prisma.client.findMany({ where: { businessId: business.id } });
  for (const client of allClients) {
    const unpaid = await prisma.invoice.findMany({
      where: { clientId: client.id, status: { in: ["PENDING", "OVERDUE"] } },
    });
    const outstanding = unpaid.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    await prisma.client.update({ where: { id: client.id }, data: { outstandingBalance: outstanding } });
  }

  // Reminder messages
  const firstClient = createdClients[0].client;
  await prisma.reminderMessage.createMany({
    data: [
      {
        businessId: business.id,
        clientId: firstClient.id,
        content: `Hi ${firstClient.firstName}, just a reminder that your invoice is due soon. Let us know if you have questions!`,
        status: "SENT",
        sentAt: daysAgo(3),
      },
      {
        businessId: business.id,
        clientId: firstClient.id,
        content: `Hi ${firstClient.firstName}, your appointment tomorrow is confirmed. See you then!`,
        status: "SENT",
        sentAt: daysAgo(1),
      },
    ],
  });

  const counts = {
    business: await prisma.business.count(),
    clients: await prisma.client.count(),
    jobs: await prisma.job.count(),
    invoices: await prisma.invoice.count(),
    reminders: await prisma.reminderMessage.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
