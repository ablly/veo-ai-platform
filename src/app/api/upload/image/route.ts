import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { validateFileType, validateFileSize, convertToBuffer, generateSafeFileName } from "@/lib/upload-helpers"
import { STORAGE_CONFIG } from "@/config/storage"

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "未找到上传文件")
    }

    // 验证文件类型
    if (!validateFileType(file, STORAGE_CONFIG.REFERENCE_IMAGES.ALLOWED_TYPES)) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "不支持的文件类型，仅支持 JPG、PNG、WebP 格式")
    }

    // 验证文件大小
    if (!validateFileSize(file, STORAGE_CONFIG.REFERENCE_IMAGES.MAX_SIZE)) {
      const maxSizeMB = STORAGE_CONFIG.REFERENCE_IMAGES.MAX_SIZE / (1024 * 1024)
      return createErrorResponse(Errors.VALIDATION_ERROR, `文件大小不能超过 ${maxSizeMB}MB`)
    }

    // 转换为Buffer
    const buffer = await convertToBuffer(file)

    // 生成安全的文件名
    const fileName = generateSafeFileName(file.name, session.user.email)
    const filePath = `reference-images/${fileName}`

    logger.info("开始上传图片", {
      user_email: session.user.email,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      safe_path: filePath
    })

    // 确保存储桶存在
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_CONFIG.REFERENCE_IMAGES.BUCKET)
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(
        STORAGE_CONFIG.REFERENCE_IMAGES.BUCKET,
        { public: true }
      )
      
      if (createBucketError) {
        logger.error("创建存储桶失败", { error: createBucketError })
        return createErrorResponse(Errors.STORAGE_ERROR, "存储服务初始化失败")
      }
    }

    // 上传文件到Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.REFERENCE_IMAGES.BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      logger.error("文件上传失败", { error, filePath })
      return createErrorResponse(Errors.STORAGE_ERROR, "文件上传失败")
    }

    // 获取公共URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_CONFIG.REFERENCE_IMAGES.BUCKET)
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      logger.error("获取文件URL失败", { filePath })
      return createErrorResponse(Errors.STORAGE_ERROR, "获取文件URL失败")
    }

    logger.info("图片上传成功", {
      user_email: session.user.email,
      file_path: filePath,
      public_url: urlData.publicUrl
    })

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    logger.error("图片上传处理失败", { 
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}










