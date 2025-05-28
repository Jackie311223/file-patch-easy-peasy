/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Map the actual PrismaService path to the mock file
    // Adjust the key '^src/prisma/prisma.service$' if your imports use a different path/alias
    '^src/prisma/prisma.service$': '<rootDir>/test/mocks/prisma.service.mock.ts',
    // You might need similar mappings if other services cause issues
  },
  // Optional: Add setup files, coverage config, etc.
  // setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // collectCoverageFrom: ['src/**/*.ts'],
};

