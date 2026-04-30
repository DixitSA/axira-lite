import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function hoursLater(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // Clean up
  await prisma.reminderMessage.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.job.deleteMany();
  await prisma.client.deleteMany();
  await prisma.business.deleteMany();

  // Business
  const business = await prisma.business.create({
    data: {
      name: "Apex Detail Co.",
      industryType: "Auto Detailing",
      phone: "5551234567",
      email: "hello@apexdetail.com",
      timezone: "America/New_York",
    },
  });

  // Client data
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
  const addresses = [
    "123 Oak Street",
    "456 Maple Ave",
    "789 Pine Rd",
    "321 Elm Dr",
    "654 Cedar Blvd",
    "987 Birch Ln",
  ];

  // Create clients and jobs
  const invoiceData: Array<{
    clientId: number;
    jobId: number;
    amount: number;
    issueDate: Date;
    dueDate: Date;
    status: string;
    paidAmount: number;
    paidDate: Date | null;
  }> = [];

  let invoiceNum = 1001;

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
        outstandingBalance: 0, // will update after invoices
      },
    });

    // Create 2-4 historical jobs per client
    const jobCount = randomBetween(2, 4);
    for (let j = 0; j < jobCount; j++) {
      const daysBack = cd.daysAgoLastJob + j * randomBetween(20, 40);
      const start = daysAgo(daysBack);
      const service = pick(services);
      const amount = randomBetween(150, 900);

      const job = await prisma.job.create({
        data: {
          businessId: business.id,
          clientId: client.id,
          title: service,
          address: pick(addresses),
          scheduledStart: start,
          scheduledEnd: hoursLater(start, randomBetween(2, 5)),
          status: "COMPLETED",
          finalAmount: amount,
          completedAt: hoursLater(start, randomBetween(2, 5)),
          invoicedAt: hoursLater(start, 24),
        },
      });

      // Most historical jobs are invoiced + paid
      const issueDt = hoursLater(start, 24);
      const dueDt = hoursLater(start, 24 * 30);
      invoiceData.push({
        clientId: client.id,
        jobId: job.id,
        amount,
        issueDate: issueDt,
        dueDate: dueDt,
        status: "PAID",
        paidAmount: amount,
        paidDate: hoursLater(start, 24 * randomBetween(5, 20)),
      });
    }

    // Create the "most recent" job matching lastJobAt
    const recentService = pick(services);
    const recentAmount = randomBetween(200, 1200);
    const recentJob = await prisma.job.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        title: recentService,
        address: pick(addresses),
        scheduledStart: lastJobAt,
        scheduledEnd: hoursLater(lastJobAt, randomBetween(2, 5)),
        status: "COMPLETED",
        finalAmount: recentAmount,
        completedAt: hoursLater(lastJobAt, randomBetween(2, 5)),
        invoicedAt: hoursLater(lastJobAt, 24),
      },
    });

    // Determine invoice status based on how long ago last job was
    let invStatus: string;
    let invPaidAmount: number;
    let invPaidDate: Date | null;

    if (cd.daysAgoLastJob <= 20) {
      // Recent clients: pending or overdue
      invStatus = "PENDING";
      invPaidAmount = 0;
      invPaidDate = null;
    } else if (cd.daysAgoLastJob <= 40) {
      // Some overdue
      invStatus = "OVERDUE";
      invPaidAmount = 0;
      invPaidDate = null;
    } else {
      // Older: paid
      invStatus = "PAID";
      invPaidAmount = recentAmount;
      invPaidDate = hoursLater(lastJobAt, 24 * randomBetween(5, 25));
    }

    const issueDate = hoursLater(lastJobAt, 24);
    const dueDate =
      cd.daysAgoLastJob <= 40
        ? daysAgo(randomBetween(0, 15)) // due recently (some past due)
        : hoursLater(lastJobAt, 24 * 30);

    invoiceData.push({
      clientId: client.id,
      jobId: recentJob.id,
      amount: recentAmount,
      issueDate,
      dueDate,
      status: invStatus,
      paidAmount: invPaidAmount,
      paidDate: invPaidDate,
    });
  }

  // Add a few DRAFT invoices
  const draftClients = [1, 5, 8]; // indices
  for (const idx of draftClients) {
    if (idx < clientData.length) {
      invoiceData.push({
        clientId: idx + 1,
        jobId: 0, // no job
        amount: randomBetween(150, 500),
        issueDate: daysAgo(randomBetween(1, 5)),
        dueDate: daysFromNow(randomBetween(20, 30)),
        status: "DRAFT",
        paidAmount: 0,
        paidDate: null,
      });
    }
  }

  // Add scheduled jobs (today and tomorrow)
  const scheduledClients = clientData.slice(0, 8);
  for (let i = 0; i < 4; i++) {
    const cd = scheduledClients[i];
    const client = await prisma.client.findFirst({
      where: { firstName: cd.firstName, lastName: cd.lastName },
    });
    if (!client) continue;
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

  // Add a few IN_PROGRESS jobs
  for (let i = 4; i < 6; i++) {
    const cd = scheduledClients[i];
    const client = await prisma.client.findFirst({
      where: { firstName: cd.firstName, lastName: cd.lastName },
    });
    if (!client) continue;
    const start = daysAgo(0);
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

  // Add some completed jobs missing invoices (for Action Center)
  for (let i = 6; i < 9; i++) {
    const cd = scheduledClients[i % scheduledClients.length];
    const client = await prisma.client.findFirst({
      where: { firstName: cd.firstName, lastName: cd.lastName },
    });
    if (!client) continue;
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
        invoicedAt: null, // NOT invoiced
      },
    });
  }

  // Create invoices
  for (const inv of invoiceData) {
    if (inv.clientId <= 0) continue;
    await prisma.invoice.create({
      data: {
        businessId: business.id,
        clientId: inv.clientId,
        jobId: inv.jobId > 0 ? inv.jobId : undefined,
        invoiceNumber: `INV-${invoiceNum++}`,
        amount: inv.amount,
        paidAmount: inv.paidAmount,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        paidDate: inv.paidDate,
      },
    });
  }

  // Add a few invoices due soon (within 3 days)
  const dueSoonClients = clientData.slice(0, 3);
  for (const cd of dueSoonClients) {
    const client = await prisma.client.findFirst({
      where: { firstName: cd.firstName, lastName: cd.lastName },
    });
    if (!client) continue;
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
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        clientId: client.id,
        status: { in: ["PENDING", "OVERDUE"] },
      },
    });
    const outstanding = unpaidInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    await prisma.client.update({
      where: { id: client.id },
      data: { outstandingBalance: outstanding },
    });
  }

  // Add a few reminder messages
  const firstClient = await prisma.client.findFirst({ where: { businessId: business.id } });
  if (firstClient) {
    await prisma.reminderMessage.createMany({
      data: [
        {
          businessId: business.id,
          clientId: firstClient.id,
          content: `Hi ${firstClient.firstName}, just a reminder that invoice INV-1001 is due soon. Please let us know if you have any questions!`,
          status: "SENT",
          sentAt: daysAgo(3),
        },
        {
          businessId: business.id,
          clientId: firstClient.id,
          content: `Hi ${firstClient.firstName}, your appointment tomorrow at 9:00 AM is confirmed. See you then!`,
          status: "SENT",
          sentAt: daysAgo(1),
        },
      ],
    });
  }

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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
