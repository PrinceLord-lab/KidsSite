import { useState, useCallback, useEffect } from "react";
import { AUDIO_MAP } from "@/lib/constants";

export function useAudio() {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [audio]);

  const play = useCallback((soundKey: keyof typeof AUDIO_MAP | string) => {
    // Check if the sound exists in our map
    const soundPath = AUDIO_MAP[soundKey as keyof typeof AUDIO_MAP];
    
    if (!soundPath) {
      console.warn(`Sound not found for key: ${soundKey}`);
      return;
    }

    // Stop any existing audio
    if (audio) {
      audio.pause();
      audio.src = "";
    }

    // Create and play new audio
    const newAudio = new Audio(soundPath);
    newAudio.addEventListener("play", () => setIsPlaying(true));
    newAudio.addEventListener("ended", () => setIsPlaying(false));
    newAudio.addEventListener("pause", () => setIsPlaying(false));
    
    newAudio.play().catch(error => {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    });
    
    setAudio(newAudio);
  }, [audio]);

  const stop = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audio]);

  return { play, stop, isPlaying };
}

export default useAudio;
