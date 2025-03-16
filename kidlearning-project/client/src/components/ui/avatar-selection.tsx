import { useState } from "react";
import { AVATARS } from "@/lib/constants";
import { motion } from "framer-motion";

interface AvatarSelectionProps {
  onSelect: (avatar: string) => void;
  selectedAvatar?: string;
}

export function AvatarSelection({ onSelect, selectedAvatar }: AvatarSelectionProps) {
  const [selected, setSelected] = useState<string | undefined>(selectedAvatar);

  const handleSelect = (avatarId: string) => {
    setSelected(avatarId);
    onSelect(avatarId);
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          className={`avatar-btn p-2 rounded-xl transition-all ${
            selected === avatar.id ? "bg-pastel-yellow" : "hover:bg-pastel-yellow/50"
          }`}
          onClick={() => handleSelect(avatar.id)}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center border-4 border-white shadow-md`}
            style={{ backgroundColor: avatar.color }}
          >
            <i className={`fas fa-${avatar.icon} text-white text-2xl`}></i>
          </motion.div>
          <p className="mt-2 font-medium">{avatar.id.charAt(0).toUpperCase() + avatar.id.slice(1)}</p>
        </button>
      ))}
    </div>
  );
}

export default AvatarSelection;
