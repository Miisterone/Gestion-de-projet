-- CreateEnum
CREATE TYPE "report_reason" AS ENUM ('abus', 'inapproprie', 'erronee', 'autre');

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "reason" "report_reason" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_post_id_reporter_id_key" ON "reports"("post_id", "reporter_id");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
