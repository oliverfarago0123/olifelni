"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { resizeForUpload } from "@/lib/client-resize";

export type UploadedImage = { key: string; width: number; height: number; url: string };

/**
 * Photo management for the listing form.
 *
 * Ordering uses explicit arrow buttons rather than drag-and-drop: the owner works on a
 * phone, where dragging inside a scrolling form is unreliable. The first photo is the
 * cover and is labelled as such, because that is the only ordering decision that matters.
 *
 * Photos can be picked with the button or dropped onto the box around it from Finder or the
 * Photos app.
 */

const isPhoto = (f: File) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name);
const carriesFiles = (e: { dataTransfer: DataTransfer | null }) =>
  Boolean(e.dataTransfer?.types.includes("Files"));
export function PhotoUploader({
  value,
  onChange,
  hint,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // dragenter and dragleave also fire for every child the pointer crosses; count them so the
  // highlight only goes off when the pointer really leaves the box.
  const depth = useRef(0);

  // A photo dropped just outside the box would otherwise open in the tab, throwing away the
  // half-filled form.
  useEffect(() => {
    const keep = (e: DragEvent) => {
      if (carriesFiles(e)) e.preventDefault();
    };
    window.addEventListener("dragover", keep);
    window.addEventListener("drop", keep);
    return () => {
      window.removeEventListener("dragover", keep);
      window.removeEventListener("drop", keep);
    };
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || busy) return;
    const files = Array.from(fileList).filter(isPhoto);
    if (!files.length) {
      setError("Csak fényképet lehet feltölteni.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("hint", hint);

      for (const [i, file] of files.entries()) {
        setProgress(`Kép előkészítése ${i + 1}/${files.length}…`);
        form.append("files", await resizeForUpload(file));
      }

      setProgress("Feltöltés…");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      // A failure in front of the function (e.g. Vercel's 4.5 MB body limit) is not JSON.
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error ??
            (res.status === 413
              ? "A képek túl nagyok. Tölts fel kevesebbet egyszerre."
              : "A feltöltés nem sikerült."),
        );
      }

      onChange([...value, ...(data.images as UploadedImage[])]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setProgress("");
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragEnter={(e) => {
          if (!carriesFiles(e)) return;
          depth.current++;
          setDragging(true);
        }}
        onDragOver={(e) => {
          if (!carriesFiles(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = busy ? "none" : "copy";
        }}
        onDragLeave={(e) => {
          if (!carriesFiles(e)) return;
          depth.current = Math.max(0, depth.current - 1);
          if (depth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          if (!carriesFiles(e)) return;
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-wrap items-center gap-3 rounded-xl border-2 border-dashed p-4 transition-colors ${
          dragging ? "border-brand bg-brand/5" : "border-rule"
        }`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg bg-ink px-5 py-3 font-bold text-surface disabled:opacity-60"
        >
          {busy ? progress || "Feltöltés…" : "+ Fényképek hozzáadása"}
        </button>
        <span className="text-sm text-ink-soft">
          {dragging ? (
            <strong className="text-brand-ink">Engedd el a feltöltéshez</strong>
          ) : (
            <>
              <span className="hidden sm:inline">vagy húzd ide a fényképeket · </span>
              {value.length > 0 ? `${value.length} kép` : "Még nincs kép"}
            </>
          )}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-brand/10 px-3 py-2 text-sm font-semibold text-brand-ink">
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((img, i) => (
            <li key={img.key} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-rule bg-sheet">
                <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
                    Borítókép
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <IconButton label="Balra" disabled={i === 0} onClick={() => move(i, i - 1)}>←</IconButton>
                  <IconButton label="Jobbra" disabled={i === value.length - 1} onClick={() => move(i, i + 1)}>→</IconButton>
                </div>
                <IconButton
                  label="Kép törlése"
                  danger
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                >
                  ✕
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[13px] text-ink-soft">
        Az első kép lesz a borítókép. A nyilakkal átrendezheted őket. A nagy fényképeket a
        böngésző automatikusan kicsinyíti, így mobilnetről is gyors a feltöltés.
      </p>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-bold disabled:opacity-30 ${
        danger ? "border-brand text-brand-ink hover:bg-brand/10" : "border-rule hover:bg-sheet"
      }`}
    >
      {children}
    </button>
  );
}
