-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "minInputPrice" DOUBLE PRECISION,
ADD COLUMN     "minOutputPrice" DOUBLE PRECISION,
ADD COLUMN     "providerCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Model_minInputPrice_idx" ON "Model"("minInputPrice");
