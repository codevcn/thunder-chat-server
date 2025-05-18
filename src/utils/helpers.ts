import crypto from 'crypto'
import path from 'path'

/**
 * Mã hóa tên file, đầu ra có độ dài tối đa 64 ký tự
 * @param {string} originalFilename - Tên file gốc
 * @param {number} length - Độ dài của mã băm
 * @returns {string} Tên file đã mã hóa, bao gồm UUID và mã băm
 */
export function encodeFilename(originalFilename: string, length: number): string {
   // Lấy phần mở rộng của file
   const ext = path.extname(encodeURIComponent(originalFilename))

   // Tạo hash SHA-256 từ tên file gốc
   const hash = crypto.createHash('sha256').update(originalFilename).digest('hex').slice(0, length)

   // Kết hợp UUID và hash để tạo tên file duy nhất
   const uniqueId = crypto.randomBytes(16).toString('hex')

   return `${uniqueId}-${hash}${ext}`
}

/**
 * Hàm này dùng để ép kiểu một đối tượng về một kiểu cụ thể trong TypeScript.
 * @param object - Đối tượng cần ép kiểu
 * @template T - Kiểu của đối tượng
 * @returns Đối tượng đã được ép kiểu
 */
export function typedObject<T>(object: T): T {
   return object
}
