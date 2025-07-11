import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma
  } else {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma
    }
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error)
  // Create a fallback client that will throw meaningful errors
  prisma = new PrismaClient()
}

// Graceful shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  })
}

export { prisma }
