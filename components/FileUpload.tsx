import { useState } from "react";
import { X } from "lucide-react"; // voor het kruisje

export default function FileUpload({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter((file) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(file.type)
    );
    if (validFiles.length) {
      const updated = [...files, ...validFiles];
      setFiles(updated);
      onFiles(updated);
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFiles(updated);
  };

  return (
    <div className="space-y-2">
      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-sm cursor-pointer transition
          ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-600"}
        `}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <p className="text-gray-500 dark:text-gray-400">
          Sleep hier bestanden of{" "}
          <span className="text-blue-600 dark:text-blue-400">klik om te bladeren</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">(PDF, JPG, PNG toegestaan)</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex justify-between items-center border rounded p-2 text-sm bg-gray-50 dark:bg-gray-800"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
