import { createBrowserClient } from "@supabase/ssr";

export type IssueStatus = "Submitted" | "Under Review" | "Resolved";

export type ParsedLocation = {
  address: string;
  coords: string | null;
};

/**
 * Parses a combined location string like "123 Fake Street [14.40000, 12.45000]"
 * into its address and coordinate parts. Falls back to treating the entire
 * string as the address when no coordinate bracket is found (legacy entries).
 */
export function parseLocation(location: string): ParsedLocation {
  const match = location.match(/^(.*?)\s*\[(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]\s*$/);
  if (match) {
    return {
      address: match[1].trim(),
      coords: `${match[2]}, ${match[3]}`,
    };
  }
  return { address: location.trim(), coords: null };
}

/**
 * Combines an address and coordinate string into the stored format:
 * "123 Fake Street [14.40000, 12.45000]".
 */
export function formatLocation(address: string, coords: string | null): string {
  const trimmed = address.trim();
  if (!coords) return trimmed;
  return `${trimmed} [${coords}]`;
}

export type IssueImageRecord = {
  id: string;
  issue_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
};

export type IssueCommentRecord = {
  id: string;
  issue_id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
};

export type IssueRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  lat: number | null;
  lng: number | null;
  status: IssueStatus;
  is_anonymous: boolean;
  created_at: string;
  updated_at?: string | null;
  user_id: string | null;
  contact_info: string | null;
  reporter_name: string | null;
  issue_images?: IssueImageRecord[];
  issue_comments?: IssueCommentRecord[];
};

const getSupabaseUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

const getSupabaseAnonKey = () =>
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_API_KEY ?? "";

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_ISSUE_IMAGES = 5;

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function resetPasswordWithEmail(email: string) {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
        phone: payload.phone ?? "",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getIssues(): Promise<IssueRecord[]> {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select("*, issue_images(*), issue_comments(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase getIssues failed:", error);
      return [];
    }

    return (data ?? []) as IssueRecord[];
  } catch (error) {
    console.warn("Unexpected getIssues failure:", error);
    return [];
  }
}

export async function getIssueById(issueId: string): Promise<IssueRecord | null> {
  const { data, error } = await supabase
    .from("issues")
    .select("*, issue_images(*), issue_comments(*)")
    .eq("id", issueId)
    .maybeSingle();

  if (error) throw error;
  return (data as IssueRecord | null) ?? null;
}

export async function addIssueComment(params: {
  issueId: string;
  content: string;
  authorName?: string;
}) {
  const trimmedContent = params.content.trim();
  if (!trimmedContent) throw new Error("Comment cannot be empty.");

  const { data: userData } = await supabase.auth.getUser();
  const author = (params.authorName ?? userData.user?.user_metadata?.full_name ?? "Anonymous resident").trim();

  const { error } = await supabase.from("issue_comments").insert({
    issue_id: params.issueId,
    user_id: userData.user?.id ?? null,
    author_name: author,
    content: trimmedContent,
  });

  if (error) throw error;
}

export async function uploadIssueImages(issueId: string, files: File[]) {
  if (!files.length) return [];

  const validFiles = files.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
  if (validFiles.length !== files.length) throw new Error("Each image must be 5MB or smaller.");

  const uploadedUrls: string[] = [];
  const rowsToInsert: Array<{ issue_id: string; image_url: string; storage_path: string }> = [];

  for (const file of validFiles) {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, "-")}`;
    const storagePath = `${issueId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from("cirp-images").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      console.error("Issue image upload failed:", uploadError);
      throw new Error(
        `Image upload failed: ${uploadError.message}. Please make sure the Supabase storage bucket 'cirp-images' exists, is public, and has an INSERT storage policy allowing uploads.`
      );
    }

    const { data } = supabase.storage.from("cirp-images").getPublicUrl(storagePath);
    uploadedUrls.push(data.publicUrl);
    rowsToInsert.push({
      issue_id: issueId,
      image_url: data.publicUrl,
      storage_path: storagePath,
    });
  }

  const { error: imageInsertError } = await supabase.from("issue_images").insert(rowsToInsert);

  if (imageInsertError) throw imageInsertError;
  return uploadedUrls;
}

export async function createIssueEntry(payload: {
  title: string;
  category: string;
  description: string;
  location: string;
  lat: number | null;
  lng: number | null;
  contactInfo?: string;
  anonymous: boolean;
  files: File[];
}) {
  if (!payload.title.trim() || !payload.description.trim() || !payload.location.trim()) {
    throw new Error("Please complete the required fields before submitting.");
  }

  if (payload.files.length > MAX_ISSUE_IMAGES) {
    throw new Error(`You can upload up to ${MAX_ISSUE_IMAGES} images.`);
  }

  if (payload.files.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
    throw new Error("Each image must be 5MB or smaller.");
  }

  const { data: userData } = await supabase.auth.getUser();
  const reporterName = payload.anonymous ? "Anonymous resident" : userData.user?.user_metadata?.full_name ?? "Resident";

  const { data: createdIssue, error: issueError } = await supabase
    .from("issues")
    .insert({
      title: payload.title.trim(),
      category: payload.category,
      description: payload.description.trim(),
      location: payload.location.trim(),
      lat: payload.lat,
      lng: payload.lng,
      status: "Submitted",
      is_anonymous: payload.anonymous,
      user_id: userData.user?.id ?? null,
      reporter_name: reporterName,
      contact_info: payload.contactInfo?.trim() || null,
    })
    .select()
    .single();

  if (issueError) throw issueError;

  if (payload.files.length) {
    await uploadIssueImages(createdIssue.id, payload.files);
  }

  return createdIssue;
}
