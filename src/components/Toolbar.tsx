import { useCallback, useRef } from "react";

interface ToolbarProps {
  /** Callback fired when the "Clear board" button is clicked. */
  onClear?: () => void;
  /** Callback fired when the "Export" button is clicked. */
  onExport?: () => void;
  /** Callback fired when a JSON file is imported. */
  onImport?: (json: string) => void;
}

const BUTTON_CLASS =
  "rounded-md px-3 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700";

/**
 * Floating toolbar pinned to the top-center of the viewport.
 * Contains the app wordmark, export/import, and a "Clear board" button.
 */
function Toolbar({ onClear, onExport, onImport }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onImport?.(reader.result);
        }
      };
      reader.readAsText(file);

      e.target.value = "";
    },
    [onImport],
  );

  return (
    <div className="pointer-events-auto fixed left-1/2 top-4 z-50 flex h-12 -translate-x-1/2 items-center gap-4 rounded-full bg-white/80 px-6 shadow-sm backdrop-blur-sm">
      <span className="text-sm font-semibold tracking-tight text-gray-800">
        Stickyboard
      </span>
      <button type="button" onClick={onExport} className={BUTTON_CLASS}>
        Export
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        className={BUTTON_CLASS}
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button type="button" onClick={onClear} className={BUTTON_CLASS}>
        Clear board
      </button>
    </div>
  );
}

export default Toolbar;
