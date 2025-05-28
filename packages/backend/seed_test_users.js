const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting test user seeding...");

  // 1. Ensure a default tenant exists
  let tenant = await prisma.tenant.findUnique({
    where: { slug: "default-tenant" },
  });

  if (!tenant) {
    console.log("Default tenant not found, creating one...");
    tenant = await prisma.tenant.create({
      data: {
        name: "Default Tenant",
        slug: "default-tenant",
      },
    });
    console.log(`Created default tenant with ID: ${tenant.id}`);
  } else {
    console.log(`Found default tenant with ID: ${tenant.id}`);
  }

  const defaultTenantId = tenant.id;
  const saltRounds = 10; // Same as in AuthService potentially, adjust if needed
  const defaultPassword = "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // 2. Define test users
  const testUsers = [
    {
      email: "superadmin@example.com",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      tenantId: null, // SUPER_ADMIN might not belong to a tenant
      name: "Super Admin User",
    },
    {
      email: "partner@example.com",
      password: hashedPassword,
      role: UserRole.PARTNER,
      tenantId: defaultTenantId,
      name: "Partner User",
    },
    {
      email: "staff@example.com",
      password: hashedPassword,
      role: UserRole.STAFF,
      tenantId: defaultTenantId,
      name: "Staff User",
    },
  ];

  // 3. Create users if they don't exist
  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      console.log(`User ${userData.email} not found, creating...`);
      try {
        await prisma.user.create({
          data: userData,
        });
        console.log(`Created user: ${userData.email}`);
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    } else {
      console.log(`User ${userData.email} already exists.`);
      // Optional: Update existing user's role/password if needed for testing
      // await prisma.user.update({
      //   where: { email: userData.email },
      //   data: { role: userData.role, password: userData.password, tenantId: userData.tenantId },
      // });
      // console.log(`Updated user: ${userData.email}`);
    }
  }

  console.log("Test user seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

