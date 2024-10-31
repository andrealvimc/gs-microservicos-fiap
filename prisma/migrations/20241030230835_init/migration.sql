-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "peopleName" TEXT NOT NULL,
    "pdfPath" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "RM" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL
);
