interface ToolbarProps {
  /** Callback fired when the "Clear board" button is clicked. */
  onClear?: () => void;
}

/**
 * Floating toolbar pinned to the top-center of the viewport.
 * Contains the app wordmark and a "Clear board" button.
 */
function Toolbar({ onClear }: ToolbarProps) {
  return (
    <div className="pointer-events-auto fixed left-1/2 top-4 z-50 flex h-12 -translate-x-1/2 items-center gap-4 rounded-full bg-white/80 px-6 shadow-sm backdrop-blur-sm">
      <span className="text-sm font-semibold tracking-tight text-gray-800">
        Stickyboard
      </span>
      <button
        type="button"
        onClick={onClear}
        className="rounded-md px-3 py-1 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        Clear board
      </button>
    </div>
  );
}

export default Toolbar;
