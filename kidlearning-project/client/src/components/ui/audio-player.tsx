import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAudio from "@/hooks/use-audio";
import { CATEGORIES, CATEGORY_CONFIG } from "@/lib/constants";

interface AudioPlayerProps {
  category: typeof CATEGORIES[keyof typeof CATEGORIES];
  itemId: string;
  className?: string;
}

export function AudioPlayer({ category, itemId, className = "" }: AudioPlayerProps) {
  const { play, isPlaying } = useAudio();
  const [played, setPlayed] = useState(false);
  
  const getAudioKey = () => {
    if (category === CATEGORIES.ALPHABETS) {
      return `letter-${itemId}`;
    } else if (category === CATEGORIES.NUMBERS) {
      return `number-${itemId}`;
    } else if (category === CATEGORIES.SHAPES) {
      return `shape-${itemId}`;
    }
    return "";
  };
  
  const colorConfig = CATEGORY_CONFIG[category].color;
  
  const handlePlaySound = () => {
    const audioKey = getAudioKey();
    play(audioKey);
    setPlayed(true);
  };
  
  return (
    <Button
      onClick={handlePlaySound}
      className={`${colorConfig.bgClass === "bg-primary-red" 
        ? "bg-white border-2 border-primary-red text-primary-red hover:bg-pastel-red" 
        : colorConfig.bgClass === "bg-primary-blue"
        ? "bg-white border-2 border-primary-blue text-primary-blue hover:bg-pastel-blue"
        : "bg-white border-2 border-primary-green text-primary-green hover:bg-pastel-green"
      } font-bold py-2 px-4 rounded-full text-sm transition-all ${className}`}
      disabled={isPlaying}
    >
      <i className={`fas fa-volume-up mr-1 ${played ? "text-gray-500" : ""}`}></i> 
      Hear Sound
    </Button>
  );
}

export default AudioPlayer;
