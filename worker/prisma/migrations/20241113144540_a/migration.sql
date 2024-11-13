-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "peopleName" TEXT NOT NULL,
    "pdfPath" TEXT,
    "studentName" TEXT NOT NULL,
    "RM" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);
