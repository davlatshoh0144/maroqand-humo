import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RepositoryResult } from '@/lib/repositories/result';
import { fail, ok } from '@/lib/repositories/result';

export type StorageBucket =
  | 'course-resources'
  | 'assignment-submissions'
  | 'certificates'
  | 'avatars';

const bucketRules: Record<StorageBucket, { maxBytes: number; mimeTypes: string[] }> = {
  'course-resources': {
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: ['application/pdf', 'video/mp4', 'image/png', 'image/jpeg', 'text/plain'],
  },
  'assignment-submissions': {
    maxBytes: 25 * 1024 * 1024,
    mimeTypes: [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  certificates: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ['application/pdf'],
  },
  avatars: {
    maxBytes: 5 * 1024 * 1024,
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
};

export function safeStorageFileName(fileName: string) {
  const normalized = fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
    .slice(0, 120);

  return normalized || 'upload';
}

export function validateStorageFile(bucket: StorageBucket, file: File): RepositoryResult<true> {
  const rules = bucketRules[bucket];

  if (file.size > rules.maxBytes) {
    return fail('VALIDATION_ERROR', `File is too large for ${bucket}.`);
  }

  if (!rules.mimeTypes.includes(file.type)) {
    return fail('VALIDATION_ERROR', `File type ${file.type || 'unknown'} is not allowed.`);
  }

  return ok(true);
}

export async function uploadStorageFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<RepositoryResult<string>> {
  const validation = validateStorageFile(bucket, file);
  if (validation.error) return validation;

  const { data, error } = await getSupabaseBrowserClient()
    .storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return fail('STORAGE_ERROR', error.message, error);
  return ok(data.path);
}

export async function createSignedStorageUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 60 * 10
): Promise<RepositoryResult<string>> {
  const { data, error } = await getSupabaseBrowserClient()
    .storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error) return fail('STORAGE_ERROR', error.message, error);
  return ok(data.signedUrl);
}

export function getPublicStorageUrl(bucket: StorageBucket, path: string) {
  return getSupabaseBrowserClient().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
