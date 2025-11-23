-- 添加邮件营销相关字段到用户表
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailUnsubscribed" BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastMarketingEmailAt" TIMESTAMP;

-- 创建邮件营销日志表
CREATE TABLE IF NOT EXISTS "EmailMarketingLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "emailType" TEXT NOT NULL,
  "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "messageId" TEXT,
  "opened" BOOLEAN DEFAULT FALSE,
  "clicked" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "EmailMarketingLog_userId_idx" ON "EmailMarketingLog"("userId");
CREATE INDEX IF NOT EXISTS "EmailMarketingLog_emailType_idx" ON "EmailMarketingLog"("emailType");
CREATE INDEX IF NOT EXISTS "EmailMarketingLog_sentAt_idx" ON "EmailMarketingLog"("sentAt");
CREATE INDEX IF NOT EXISTS "User_lastMarketingEmailAt_idx" ON "User"("lastMarketingEmailAt");
