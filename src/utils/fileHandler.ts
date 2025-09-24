// File attachment handler utility

export interface FileAttachment {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string; // For preview
  uploadProgress?: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export class FileHandler {
  private static instance: FileHandler;
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/rtf',
    
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    
    // Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  private constructor() {}

  public static getInstance(): FileHandler {
    if (!FileHandler.instance) {
      FileHandler.instance = new FileHandler();
    }
    return FileHandler.instance;
  }

  // Validate file before processing
  public validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(this.maxFileSize)} limit`
      };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not supported`
      };
    }

    // Check file name
    if (file.name.length > 255) {
      return {
        valid: false,
        error: 'File name is too long'
      };
    }

    return { valid: true };
  }

  // Process multiple files
  public async processFiles(files: FileList): Promise<FileAttachment[]> {
    const attachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = this.validateFile(file);
      
      if (!validation.valid) {
        attachments.push({
          id: this.generateId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadStatus: 'error',
          error: validation.error
        });
        continue;
      }

      // Create preview URL for images
      let url: string | undefined;
      if (file.type.startsWith('image/')) {
        url = URL.createObjectURL(file);
      }

      attachments.push({
        id: this.generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        uploadStatus: 'pending'
      });
    }

    return attachments;
  }

  // Simulate file upload (replace with actual upload logic)
  public async uploadFile(attachment: FileAttachment, onProgress?: (progress: number) => void): Promise<FileAttachment> {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            ...attachment,
            uploadProgress: 100,
            uploadStatus: 'completed',
            url: attachment.url || `https://example.com/files/${attachment.id}`
          });
        }
      }, 100);

      // Simulate potential upload failure
      if (Math.random() < 0.1) { // 10% chance of failure
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed'));
        }, 2000);
      }
    });
  }

  // Format file size for display
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on type
  public getFileIcon(type: string): string {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
    if (type.includes('text')) return '📃';
    return '📎';
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clean up object URLs to prevent memory leaks
  public cleanupUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Get allowed file types for input accept attribute
  public getAcceptString(): string {
    return this.allowedTypes.join(',');
  }

  // Check if file type is image
  public isImage(type: string): boolean {
    return type.startsWith('image/');
  }

  // Check if file type is video
  public isVideo(type: string): boolean {
    return type.startsWith('video/');
  }

  // Check if file type is audio
  public isAudio(type: string): boolean {
    return type.startsWith('audio/');
  }

  // Check if file type is document
  public isDocument(type: string): boolean {
    return type.includes('pdf') || 
           type.includes('word') || 
           type.includes('document') || 
           type.includes('text') ||
           type.includes('rtf');
  }
}

// Export singleton instance
export const fileHandler = FileHandler.getInstance();
