import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBoard } from "./useBoard";
import type { Sticker } from "../types";

function makeSticker(overrides: Partial<Sticker> = {}): Sticker {
  return {
    id: crypto.randomUUID(),
    x: 0,
    y: 0,
    width: 200,
    height: 150,
    content: "",
    color: "#fef08a",
    zIndex: 1,
    ...overrides,
  };
}

describe("useBoard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with empty state when localStorage is empty", () => {
    const { result } = renderHook(() => useBoard());
    expect(result.current.stickers).toEqual([]);
    expect(result.current.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it("loads existing state from localStorage", () => {
    const existing = {
      stickers: [makeSticker({ id: "s1", content: "hello" })],
      viewport: { x: 10, y: 20, zoom: 1.5 },
    };
    localStorage.setItem("stickyboard", JSON.stringify(existing));

    const { result } = renderHook(() => useBoard());
    expect(result.current.stickers).toHaveLength(1);
    expect(result.current.stickers[0].content).toBe("hello");
    expect(result.current.viewport).toEqual({ x: 10, y: 20, zoom: 1.5 });
  });

  it("falls back to default state when localStorage contains invalid JSON", () => {
    localStorage.setItem("stickyboard", "not valid json {{{");

    const { result } = renderHook(() => useBoard());
    expect(result.current.stickers).toEqual([]);
    expect(result.current.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it("adds a sticker", () => {
    const { result } = renderHook(() => useBoard());
    const sticker = makeSticker({ id: "add-1", content: "new" });

    act(() => {
      result.current.addSticker(sticker);
    });

    expect(result.current.stickers).toHaveLength(1);
    expect(result.current.stickers[0].id).toBe("add-1");
  });

  it("updates a sticker by id", () => {
    const { result } = renderHook(() => useBoard());
    const sticker = makeSticker({ id: "upd-1", content: "old" });

    act(() => {
      result.current.addSticker(sticker);
    });

    act(() => {
      result.current.updateSticker("upd-1", { content: "updated" });
    });

    expect(result.current.stickers[0].content).toBe("updated");
  });

  it("does not modify other stickers when updating", () => {
    const { result } = renderHook(() => useBoard());
    const s1 = makeSticker({ id: "s1", content: "one" });
    const s2 = makeSticker({ id: "s2", content: "two" });

    act(() => {
      result.current.addSticker(s1);
      result.current.addSticker(s2);
    });

    act(() => {
      result.current.updateSticker("s1", { content: "changed" });
    });

    expect(result.current.stickers[0].content).toBe("changed");
    expect(result.current.stickers[1].content).toBe("two");
  });

  it("removes a sticker by id", () => {
    const { result } = renderHook(() => useBoard());
    const sticker = makeSticker({ id: "rm-1" });

    act(() => {
      result.current.addSticker(sticker);
    });

    expect(result.current.stickers).toHaveLength(1);

    act(() => {
      result.current.removeSticker("rm-1");
    });

    expect(result.current.stickers).toHaveLength(0);
  });

  it("updates viewport with partial values", () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.setViewport({ x: 100 });
    });

    expect(result.current.viewport).toEqual({ x: 100, y: 0, zoom: 1 });

    act(() => {
      result.current.setViewport({ y: 50, zoom: 2 });
    });

    expect(result.current.viewport).toEqual({ x: 100, y: 50, zoom: 2 });
  });

  it("clears all stickers and resets viewport", () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.addSticker(makeSticker({ id: "c1" }));
      result.current.addSticker(makeSticker({ id: "c2" }));
      result.current.setViewport({ x: 50, y: 50, zoom: 3 });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.stickers).toEqual([]);
    expect(result.current.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it("debounces saves to localStorage", () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.addSticker(makeSticker({ id: "d1" }));
    });

    // Not saved yet (within debounce window)
    expect(localStorage.getItem("stickyboard")).toBeNull();

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 50);
    });

    const saved = JSON.parse(localStorage.getItem("stickyboard")!);
    expect(saved.stickers).toHaveLength(1);
    expect(saved.stickers[0].id).toBe("d1");
  });

  it("batches rapid mutations into a single save", () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.addSticker(makeSticker({ id: "b1" }));
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.addSticker(makeSticker({ id: "b2" }));
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.addSticker(makeSticker({ id: "b3" }));
    });

    // Nothing saved yet — timer keeps resetting
    expect(localStorage.getItem("stickyboard")).toBeNull();

    // Final state persisted after debounce
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 50);
    });

    const saved = JSON.parse(localStorage.getItem("stickyboard")!);
    expect(saved.stickers).toHaveLength(3);
  });

  it("persists the final state after a burst of mutations", () => {
    const { result } = renderHook(() => useBoard());

    act(() => {
      result.current.addSticker(makeSticker({ id: "burst-1", content: "a" }));
    });

    act(() => {
      result.current.updateSticker("burst-1", { content: "b" });
    });

    act(() => {
      result.current.updateSticker("burst-1", { content: "final" });
    });

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 50);
    });

    const saved = JSON.parse(localStorage.getItem("stickyboard")!);
    expect(saved.stickers[0].content).toBe("final");
  });
});

const DEBOUNCE_MS = 300;
