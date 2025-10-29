/**
 * 用户头像上传API
 * POST: 上传并更新头像
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { uploadFile, deleteFile, ensureBucketExists } from "@/lib/supabase-admin"
import { fileToBuffer, validateFileSignature, generateSafeFilePath } from "@/lib/upload-helpers"
import { STORAGE_BUCKETS, ALLOWED_FILE_TYPES, FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_LABEL } from "@/config/storage"

/**
 * POST /api/user/avatar
 * 上传用户头像
 */
export async function POST(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    // 1. 验证用户认证
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.security("Unauthorized avatar upload attempt")
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    logger.info("POST", "/api/user/avatar", { userId })

    // 2. 获取上传的文件
    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      throw Errors.badRequest("未找到文件")
    }

    logger.debug("Processing avatar upload", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })

    // 3. 验证文件类型和大小
    if (!ALLOWED_FILE_TYPES.AVATAR.includes(file.type)) {
      throw Errors.invalidFileType(ALLOWED_FILE_TYPES.AVATAR)
    }

    if (file.size > FILE_SIZE_LIMITS.AVATAR) {
      throw Errors.fileTooLarge(FILE_SIZE_LIMITS_LABEL.AVATAR)
    }

    if (file.size === 0) {
      throw Errors.badRequest("文件为空")
    }

    // 4. 转换文件为Buffer
    const buffer = await fileToBuffer(file)

    // 5. 验证文件签名
    if (!validateFileSignature(buffer, file.type)) {
      logger.security("Avatar file signature mismatch", { userId, fileType: file.type })
      throw Errors.validationError("文件类型与内容不匹配")
    }

    // 6. 获取用户当前头像（用于后续删除）
    const userResult = await client.query(
      "SELECT avatar FROM users WHERE id = $1",
      [userId]
    )

    const oldAvatar = userResult.rows[0]?.avatar

    // 7. 确保bucket存在
    await ensureBucketExists(STORAGE_BUCKETS.USER_AVATARS, true)

    // 8. 生成文件路径
    const filePath = generateSafeFilePath(userId, file.name, file.type)

    // 9. 上传到Supabase Storage
    const uploadResult = await uploadFile(
      STORAGE_BUCKETS.USER_AVATARS,
      filePath,
      buffer,
      file.type
    )

    // 10. 更新数据库中的头像URL
    await client.query(
      "UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2",
      [uploadResult.url, userId]
    )

    // 11. 删除旧头像（如果存在且是Supabase的）
    if (oldAvatar && oldAvatar.includes(STORAGE_BUCKETS.USER_AVATARS)) {
      try {
        const oldPath = oldAvatar.split(`/${STORAGE_BUCKETS.USER_AVATARS}/`)[1]
        if (oldPath) {
          await deleteFile(STORAGE_BUCKETS.USER_AVATARS, oldPath)
          logger.debug("Old avatar deleted", { oldPath })
        }
      } catch (error) {
        // 删除旧头像失败不影响主流程
        logger.warn("Failed to delete old avatar", { error })
      }
    }

    logger.userAction(userId, "Avatar uploaded", {
      fileName: file.name,
      fileSize: file.size,
      url: uploadResult.url,
    })
    logger.info("POST", "/api/user/avatar", 200)

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        path: uploadResult.path,
      },
      message: "头像上传成功",
    })

  } catch (error) {
    logger.info("POST", "/api/user/avatar", 500)
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}



