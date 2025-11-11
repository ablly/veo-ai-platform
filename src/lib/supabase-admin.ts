/**
 * Supabase管理客户端
 * 仅用于服务端，拥有service_role权限
 * 用于文件上传、管理等操作
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { logger } from "./logger"
import { Errors } from "./error-handler"

// 验证环境变量
function validateEnv(): { url: string; serviceKey: string } {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!url) {
    throw new Error("Missing SUPABASE_URL environment variable")
  }

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_KEY environment variable")
  }

  return { url, serviceKey }
}

// 创建Supabase管理客户端（单例）
let supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  try {
    const { url, serviceKey } = validateEnv()

    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    logger.info("Supabase Admin client initialized")
    return supabaseAdmin
  } catch (error) {
    logger.error("Failed to initialize Supabase Admin client", error)
    throw Errors.internalError("Storage service initialization failed")
  }
}

/**
 * 上传文件到Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin()

  try {
    logger.debug(`Uploading file to ${bucket}/${path}`, { contentType })

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false, // 不覆盖已存在的文件
      })

    if (error) {
      logger.error(`File upload failed: ${error.message}`, error, { bucket, path })
      throw Errors.uploadFailed(error.message)
    }

    // 获取公开URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    logger.info(`File uploaded successfully to ${bucket}/${path}`)

    return {
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      throw Errors.resourceExists("文件")
    }
    throw error
  }
}

/**
 * 删除文件
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = getSupabaseAdmin()

  try {
    logger.debug(`Deleting file from ${bucket}/${path}`)

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      logger.error(`File deletion failed: ${error.message}`, error, { bucket, path })
      throw Errors.internalError(`文件删除失败: ${error.message}`)
    }

    logger.info(`File deleted successfully from ${bucket}/${path}`)
  } catch (error) {
    logger.error("Failed to delete file", error, { bucket, path })
    throw error
  }
}

/**
 * 删除多个文件
 */
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<void> {
  const supabase = getSupabaseAdmin()

  try {
    logger.debug(`Deleting ${paths.length} files from ${bucket}`)

    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      logger.error(`Batch file deletion failed: ${error.message}`, error, { bucket, count: paths.length })
      throw Errors.internalError(`批量删除文件失败: ${error.message}`)
    }

    logger.info(`${paths.length} files deleted successfully from ${bucket}`)
  } catch (error) {
    logger.error("Failed to delete files", error, { bucket, count: paths.length })
    throw error
  }
}

/**
 * 获取文件公开URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabaseAdmin()

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

/**
 * 检查文件是否存在
 */
export async function fileExists(
  bucket: string,
  path: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.substring(0, path.lastIndexOf("/")), {
        limit: 1,
        search: path.substring(path.lastIndexOf("/") + 1),
      })

    if (error) {
      return false
    }

    return data.length > 0
  } catch (error) {
    logger.error("Failed to check file existence", error, { bucket, path })
    return false
  }
}

/**
 * 创建bucket（如果不存在）
 */
export async function ensureBucketExists(
  bucketName: string,
  isPublic: boolean = true
): Promise<void> {
  const supabase = getSupabaseAdmin()

  try {
    // 检查bucket是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      logger.error("Failed to list buckets", listError)
      return
    }

    const bucketExists = buckets?.some(b => b.name === bucketName)

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB default
      })

      if (createError) {
        logger.error(`Failed to create bucket ${bucketName}`, createError)
      } else {
        logger.info(`Bucket ${bucketName} created successfully`)
      }
    } else {
      logger.debug(`Bucket ${bucketName} already exists`)
    }
  } catch (error) {
    logger.error(`Failed to ensure bucket ${bucketName} exists`, error)
  }
}

// 导出默认实例供API使用
export default getSupabaseAdmin


