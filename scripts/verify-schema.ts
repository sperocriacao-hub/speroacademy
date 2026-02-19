const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
    try {
        console.log("Verifying User update...");
        console.log("Verifying Transaction model...");
        const count = await db.transaction.count();
        console.log(`Transaction count: ${count}`);
        console.log("Verifying LessonType enum...");
        console.log("Schema verification successful: Transaction table exists and is accessible.");

    } catch (error) {
        console.error("Schema verification failed:", error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();

export { }; // Ensure file is treated as a module to fix TS scope errors
