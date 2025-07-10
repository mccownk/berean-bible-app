
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReadingPlan() {
  console.log('🔍 Testing corrected reading plan data...\n');
  
  // Test key days to verify the fix
  const testDays = [1, 2, 30, 31, 60, 121, 150, 151, 180];
  
  for (const day of testDays) {
    const reading = await prisma.dailyReading.findFirst({
      where: { day },
      include: { plan: true }
    });
    
    if (reading) {
      console.log(`📖 Day ${day}:`);
      console.log(`   NT: ${reading.ntPassages.join(', ')} (${reading.ntRepetitionType})`);
      console.log(`   OT: ${reading.otPassages.join(', ')}`);
      console.log(`   Phase: ${reading.phase}, Estimated: ${reading.totalEstimatedMinutes}min\n`);
    }
  }
  
  // Verify smaller books are complete
  console.log('🔍 Verifying smaller books (should be entire books):');
  const smallerBookDays = [1, 121, 211]; // 1 John, Philippians, Ephesians
  
  for (const day of smallerBookDays) {
    const reading = await prisma.dailyReading.findFirst({
      where: { day }
    });
    
    if (reading) {
      const isEntireBook = reading.ntRepetitionType === 'entire_book';
      console.log(`   Day ${day}: ${reading.ntPassages[0]} - ${isEntireBook ? '✅ CORRECT (entire_book)' : '❌ WRONG'}`);
    }
  }
  
  // Verify larger book sections
  console.log('\n🔍 Verifying larger book sections (should be chapters):');
  const largerBookDays = [31, 61, 91]; // John sections
  
  for (const day of largerBookDays) {
    const reading = await prisma.dailyReading.findFirst({
      where: { day }
    });
    
    if (reading) {
      const isChapters = reading.ntRepetitionType === 'chapters';
      console.log(`   Day ${day}: ${reading.ntPassages[0]} - ${isChapters ? '✅ CORRECT (chapters)' : '❌ WRONG'}`);
    }
  }
  
  // Count total readings
  const totalReadings = await prisma.dailyReading.count();
  console.log(`\n📊 Total readings created: ${totalReadings}`);
  
  await prisma.$disconnect();
}

testReadingPlan().catch(console.error);
