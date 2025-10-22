"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages: number
  maxSizePerImage: number
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages,
  maxSizePerImage
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string>("")

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "只支持图像文件"
    }
    if (file.size > maxSizePerImage) {
      return `文件大小不能超过 ${formatFileSize(maxSizePerImage)}`
    }
    return null
  }

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles) return
    
    setError("")
    const fileArray = Array.from(newFiles)
    const validFiles: File[] = []
    
    for (const file of fileArray) {
      const error = validateFile(file)
      if (error) {
        setError(error)
        return
      }
      validFiles.push(file)
    }
    
    const totalFiles = images.length + validFiles.length
    if (totalFiles > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`)
      return
    }
    
    onImagesChange([...images, ...validFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setError("")
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragOver 
            ? "border-yellow-400 bg-yellow-50" 
            : "border-yellow-300 bg-yellow-50/50 hover:border-yellow-400 hover:bg-yellow-50"
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              点击上传参考图像
            </p>
            <p className="text-sm text-gray-500">
              最多 {maxImages} 张图像，每张最大 {formatFileSize(maxSizePerImage)}
            </p>
          </div>
          
          {dragOver && (
            <motion.div
              className="absolute inset-0 bg-yellow-200/30 rounded-xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-yellow-700 font-medium">松开鼠标上传图片</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`预览 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate">{image.name}</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
