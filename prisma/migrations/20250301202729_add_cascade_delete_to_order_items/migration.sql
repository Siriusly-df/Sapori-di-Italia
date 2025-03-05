-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
