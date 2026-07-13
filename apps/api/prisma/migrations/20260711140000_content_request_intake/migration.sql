-- CreateEnum
CREATE TYPE "ContentRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "content_requests" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contentType" TEXT NOT NULL,
    "channel" TEXT,
    "status" "ContentRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_requests_brandId_idx" ON "content_requests"("brandId");

-- CreateIndex
CREATE INDEX "content_requests_requestedById_idx" ON "content_requests"("requestedById");

-- AddForeignKey
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_requests" ADD CONSTRAINT "content_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

