-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Task_projectId_complete_order_idx" ON "Task"("projectId", "complete", "order");
