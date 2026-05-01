const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const BUSINESS_ID = 2;

async function run() {
  console.log(`Seeding dummy data for business ${BUSINESS_ID}...`);

  try {
    // 1. Create Clients
    const clientsData = [
      { firstName: 'John', lastName: 'Doe', companyName: 'Doe Construction', phone: '555-0101', email: 'john@doe.com', address: '123 Main St, Springfield' },
      { firstName: 'Jane', lastName: 'Smith', companyName: 'Smith & Co', phone: '555-0102', email: 'jane@smith.com', address: '456 Oak Ave, Shelbyville' },
      { firstName: 'Robert', lastName: 'Johnson', phone: '555-0103', email: 'rob@gmail.com', address: '789 Pine Ln, Capital City' },
      { firstName: 'Maria', lastName: 'Garcia', companyName: 'Garcia Landscaping', phone: '555-0104', email: 'm.garcia@outlook.com', address: '321 Elm St, Ogdenville' },
      { firstName: 'William', lastName: 'Davis', phone: '555-0105', email: 'will@davis.net', address: '654 Maple Dr, North Haverbrook' }
    ];

    const clients = [];
    for (const c of clientsData) {
      const client = await db.client.create({
        data: { ...c, businessId: BUSINESS_ID }
      });
      clients.push(client);
    }
    console.log(`Created ${clients.length} clients.`);

    // 2. Create Jobs
    const jobsData = [
      { title: 'Roof Repair', description: 'Patch leak in northeast corner', address: '123 Main St, Springfield', scheduledStart: new Date(), status: 'SCHEDULED', quotedAmount: 450, clientId: clients[0].id },
      { title: 'Kitchen Remodel', description: 'Install new cabinets and countertops', address: '456 Oak Ave, Shelbyville', scheduledStart: new Date(Date.now() - 86400000 * 2), status: 'IN_PROGRESS', quotedAmount: 8500, clientId: clients[1].id },
      { title: 'Garden Cleanup', description: 'Mow lawn, trim hedges', address: '789 Pine Ln, Capital City', scheduledStart: new Date(Date.now() - 86400000 * 5), status: 'COMPLETED', quotedAmount: 150, finalAmount: 175, completedAt: new Date(Date.now() - 86400000 * 4), clientId: clients[2].id },
      { title: 'Bathroom Tile', description: 'Re-tile master bathroom floor', address: '321 Elm St, Ogdenville', scheduledStart: new Date(Date.now() + 86400000 * 3), status: 'SCHEDULED', quotedAmount: 1200, clientId: clients[3].id },
      { title: 'Electric Wiring', description: 'Add new outlets in garage', address: '654 Maple Dr, North Haverbrook', scheduledStart: new Date(Date.now() - 86400000 * 10), status: 'COMPLETED', quotedAmount: 300, finalAmount: 300, completedAt: new Date(Date.now() - 86400000 * 9), clientId: clients[4].id },
      { title: 'Gutter Cleaning', address: '123 Main St, Springfield', scheduledStart: new Date(Date.now() + 86400000 * 7), status: 'SCHEDULED', quotedAmount: 100, clientId: clients[0].id },
      { title: 'Exterior Painting', description: 'Paint west side of house', address: '456 Oak Ave, Shelbyville', scheduledStart: new Date(Date.now() - 86400000 * 15), status: 'COMPLETED', invoicedAt: new Date(), quotedAmount: 1500, finalAmount: 1500, completedAt: new Date(Date.now() - 86400000 * 14), clientId: clients[1].id },
      { title: 'Tree Removal', description: 'Remove dead oak in backyard', address: '789 Pine Ln, Capital City', scheduledStart: new Date(Date.now() - 86400000 * 1), status: 'IN_PROGRESS', quotedAmount: 2000, clientId: clients[2].id }
    ];

    const jobs = [];
    for (const j of jobsData) {
      const job = await db.job.create({
        data: { ...j, businessId: BUSINESS_ID }
      });
      jobs.push(job);
    }
    console.log(`Created ${jobs.length} jobs.`);

    // 3. Create Invoices
    const invoicesData = [
      { invoiceNumber: 'INV-20240401-001', amount: 1500, paidAmount: 1500, status: 'PAID', issueDate: new Date(Date.now() - 86400000 * 14), dueDate: new Date(Date.now() + 86400000 * 14), paidDate: new Date(Date.now() - 86400000 * 2), clientId: clients[1].id, jobId: jobs[6].id },
      { invoiceNumber: 'INV-20240415-002', amount: 175, paidAmount: 0, status: 'OVERDUE', issueDate: new Date(Date.now() - 86400000 * 30), dueDate: new Date(Date.now() - 86400000 * 5), clientId: clients[2].id, jobId: jobs[2].id },
      { invoiceNumber: 'INV-20240420-003', amount: 300, paidAmount: 0, status: 'PENDING', issueDate: new Date(Date.now() - 86400000 * 5), dueDate: new Date(Date.now() + 86400000 * 25), clientId: clients[4].id, jobId: jobs[4].id },
      { invoiceNumber: 'INV-20240428-004', amount: 450, paidAmount: 0, status: 'PENDING', issueDate: new Date(Date.now() - 86400000 * 1), dueDate: new Date(Date.now() + 86400000 * 29), clientId: clients[0].id },
      { invoiceNumber: 'INV-20240429-005', amount: 800, paidAmount: 200, status: 'PENDING', issueDate: new Date(Date.now()), dueDate: new Date(Date.now() + 86400000 * 30), clientId: clients[3].id }
    ];

    for (const inv of invoicesData) {
      await db.invoice.create({
        data: { ...inv, businessId: BUSINESS_ID }
      });
    }
    console.log(`Created ${invoicesData.length} invoices.`);

    // 4. Update Client balances
    console.log('Updating client outstanding balances...');
    const allClients = await db.client.findMany({ where: { businessId: BUSINESS_ID } });
    for (const client of allClients) {
      const unpaid = await db.invoice.findMany({
        where: { clientId: client.id, status: { in: ['PENDING', 'OVERDUE'] } }
      });
      const balance = unpaid.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
      await db.client.update({
        where: { id: client.id },
        data: { outstandingBalance: balance }
      });
    }

    console.log('Seed completed successfully!');
  } catch (e) {
    console.error('Seed failed:', e);
  } finally {
    await db.$disconnect();
  }
}

run();
