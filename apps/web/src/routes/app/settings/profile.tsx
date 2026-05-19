import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "@workspace/backend/_generated/api";
import type { Id } from "@workspace/backend/_generated/dataModel";
import { Separator } from "@workspace/ui/components/separator";
import { Spinner } from "@workspace/ui/components/spinner";
import { toastManager } from "@workspace/ui/components/toast";
import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";

import { authClient } from "@/lib/auth";
import { useAppForm } from "@/lib/form";

export const Route = createFileRoute("/app/settings/profile")({
  component: RouteComponent,
});

function AvatarUpload({
  name,
  imageUrl,
  onUpload,
}: {
  name: string;
  imageUrl?: string | null;
  onUpload: (storageId: string) => Promise<void>;
}) {
  const generateUploadUrl = useConvexMutation(
    api.user.profile.generateUploadUrl
  );
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      await onUpload(storageId);
      toastManager.add({ title: "Profile picture updated", type: "success" });
    } catch {
      toastManager.add({ title: "Upload failed", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium">Profile picture</p>
      </div>
      <button
        type="button"
        className="relative group size-10 rounded-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="size-full object-cover" />
        ) : (
          <div className="size-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Spinner className="size-4 text-white" />
          ) : (
            <CameraIcon className="size-4 text-white" />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {handleFile(file);}
            e.target.value = "";
          }}
        />
      </button>
    </div>
  );
}

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const updateProfile = useConvexMutation(api.user.profile.updateProfile);

  const { data: profile } = useQuery(
    convexQuery(api.user.profile.getProfile, {})
  );

  const form = useAppForm({
    defaultValues: {
      name: session?.user?.name ?? "",
    },
    onSubmit: async ({ value }) => {
      await updateProfile({ name: value.name.trim() });
      await authClient.updateUser({ name: value.name.trim() });
      toastManager.add({ title: "Profile updated", type: "success" });
    },
  });

  async function handleAvatarUpload(storageId: string) {
    await updateProfile({ imageStorageId: storageId as Id<"_storage"> });
  }

  const userName = session?.user?.name ?? "";
  const imageUrl = profile?.image ?? session?.user?.image;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <Separator />
      <div className="rounded-lg border divide-y">
        <AvatarUpload
          name={userName}
          imageUrl={imageUrl}
          onUpload={handleAvatarUpload}
        />

        <div className="flex items-center justify-between p-4">
          <p className="text-sm font-medium">Email</p>
          <span className="text-sm text-muted-foreground">
            {session?.user?.email}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="flex items-center justify-between p-4">
            <p className="text-sm font-medium">Full name</p>
            <form.AppField name="name">
              {(field) => (
                <input
                  className="text-sm bg-transparent text-right outline-none border border-transparent focus:border-border rounded-md px-2 py-1 w-48 transition-colors"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={() => {
                    field.handleBlur();
                    form.handleSubmit();
                  }}
                  placeholder="Your name"
                />
              )}
            </form.AppField>
          </div>
        </form>
      </div>
    </div>
  );
}
