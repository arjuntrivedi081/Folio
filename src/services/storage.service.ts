import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, FIREBASE_STORAGE_FOLDER } from '../config/constants';
import { sanitizeFileName } from '../lib/utils';

export interface StorageUploadResult {
  filePath: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
}

export async function uploadResourceFile(
  file: File,
  onProgress?: (percent: number) => void,
  cancelRef?: { current: (() => void) | null }
): Promise<StorageUploadResult> {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as unknown as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new Error(
      `File format "${file.type}" is not supported. Permitted formats: PDF, JPG, PNG, WEBP.`
    );
  }

  // Validate file size (25 MB max)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size ${(file.size / (1024 * 1024)).toFixed(1)} MB exceeds the maximum 25 MB limit.`
    );
  }

  // Sanitize extension and generate safe unique path: resources/{uuid}.{ext}
  const rawExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const sanitizedExtension = validExts.includes(rawExt) ? rawExt : '.pdf';
  const uuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const filePath = `${FIREBASE_STORAGE_FOLDER}/${uuid}${sanitizedExtension}`;

  const storageRef = ref(storage, filePath);
  const metadata = {
    contentType: file.type || 'application/pdf',
    customMetadata: {
      originalName: sanitizeFileName(file.name),
    },
  };

  const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, metadata);

  if (cancelRef) {
    cancelRef.current = () => {
      uploadTask.cancel();
    };
  }

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        let msg = error.message;
        if (error.code === 'storage/unauthorized') {
          msg = 'Permission denied by Firebase Storage rules. Admin authorization required for uploads.';
        } else if (error.code === 'storage/quota-exceeded') {
          msg = 'Firebase Storage daily project quota exceeded.';
        } else if (error.code === 'storage/canceled') {
          msg = 'Upload was canceled.';
        }
        reject(new Error(msg));
      },
      async () => {
        if (cancelRef) cancelRef.current = null;
        resolve({
          filePath,
          originalFilename: sanitizeFileName(file.name),
          mimeType: file.type || 'application/pdf',
          fileSizeBytes: file.size,
        });
      }
    );
  });
}

export async function getResourceSignedUrl(
  filePath: string,
  _download: boolean = false,
  filename?: string
): Promise<string> {
  if (!filePath || filePath.startsWith('demo:')) {
    return generateFallbackDocument(filename);
  }

  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'storage/object-not-found') {
      console.warn(`Storage object not found: ${filePath}, providing preview fallback.`);
      return generateFallbackDocument(filename);
    }
    console.error('Error fetching download URL:', err);
    return generateFallbackDocument(filename);
  }
}

export async function deleteResourceFile(filePath: string): Promise<void> {
  if (!filePath || filePath.startsWith('demo:')) return;
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'storage/object-not-found') {
      return; // Already deleted or doesn't exist
    }
    console.warn(`Could not delete storage file ${filePath}:`, err);
  }
}

function generateFallbackDocument(filename?: string): string {
  const safeDocName = filename || 'Academic_Resource_Document.pdf';
  const samplePdf = `%PDF-1.4
%Folio University Notes & Examination Repository
1 0 obj
<<
  /Title (${safeDocName})
  /Creator (Folio Academic Portal)
  /Producer (Folio Publishing Engine)
  /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z)
>>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 612 792]
  /Contents 5 0 R
  /Resources << /Font << /F1 6 0 R >> >>
>>
endobj
5 0 obj
<< /Length 260 >>
stream
BT
/F1 18 Tf
50 720 Td
(FOLIO ACADEMIC PORTAL) Tj
/F1 12 Tf
0 -30 Td
(Document: ${safeDocName}) Tj
0 -20 Td
(Curated University Study Material & Examination Resource) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000150 00000 n 
0000000200 00000 n 
0000000260 00000 n 
0000000380 00000 n 
0000000690 00000 n 
trailer
<< /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
760
%%EOF`;

  const blob = new Blob([samplePdf], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}
