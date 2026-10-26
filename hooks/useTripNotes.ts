"use client";

import { useEffect, useState } from "react";

export type TripNotes = Record<string, string>;

const STORAGE_KEY = "our-travel-trip-notes";

export function useTripNotes() {
  const [notes, setNotes] = useState<TripNotes>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setNotes(parsed as TripNotes);
        }
      }
    } catch (error) {
      console.error("Failed to load trip notes:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save trip notes:", error);
    }
  }, [notes, isLoaded]);

  function getNote(itemId: string) {
    return notes[itemId] ?? "";
  }

  function saveNote(itemId: string, note: string) {
    const normalized = note.trim();
    setNotes((current) => {
      if (!normalized) {
        const next = { ...current };
        delete next[itemId];
        return next;
      }
      return { ...current, [itemId]: normalized };
    });
  }

  function deleteNote(itemId: string) {
    setNotes((current) => {
      const next = { ...current };
      delete next[itemId];
      return next;
    });
  }

  return { notes, getNote, saveNote, deleteNote, isLoaded };
}
