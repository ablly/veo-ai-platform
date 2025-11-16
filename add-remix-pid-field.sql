-- 添加 remix_pid 字段用于存储SORA2的续作PID
ALTER TABLE video_generations 
ADD COLUMN IF NOT EXISTS remix_pid TEXT;

-- 添加注释
COMMENT ON COLUMN video_generations.remix_pid IS 'SORA2续作PID，用于基于此视频继续创作';
