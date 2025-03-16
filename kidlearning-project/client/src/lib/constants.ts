export const CATEGORIES = {
  ALPHABETS: "alphabets",
  NUMBERS: "numbers",
  SHAPES: "shapes",
};

export const CATEGORY_CONFIG = {
  [CATEGORIES.ALPHABETS]: {
    title: "Alphabets",
    icon: "font",
    color: {
      primary: "primary-red",
      pastel: "pastel-red",
      textClass: "text-primary-red",
      bgClass: "bg-primary-red",
      bgPastelClass: "bg-pastel-red",
      hoverClass: "hover:bg-red-600",
      borderClass: "border-primary-red",
    },
    items: [
      "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
      "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ],
    examples: {
      "A": ["Apple", "Ant", "Airplane"],
      "B": ["Ball", "Bear", "Balloon"],
      "C": ["Cat", "Car", "Cookie"],
      "D": ["Dog", "Duck", "Dinosaur"],
      "E": ["Elephant", "Egg", "Eagle"],
      "F": ["Fish", "Flower", "Frog"],
      "G": ["Goat", "Grape", "Giraffe"],
      "H": ["Hat", "Horse", "House"],
      "I": ["Ice Cream", "Igloo", "Insect"],
      "J": ["Jellyfish", "Jam", "Jacket"],
      "K": ["Kite", "Key", "Kangaroo"],
      "L": ["Lion", "Lemon", "Leaf"],
      "M": ["Monkey", "Moon", "Mouse"],
      "N": ["Nest", "Nut", "Nose"],
      "O": ["Octopus", "Orange", "Owl"],
      "P": ["Penguin", "Pizza", "Panda"],
      "Q": ["Queen", "Quilt", "Question"],
      "R": ["Rabbit", "Rainbow", "Robot"],
      "S": ["Sun", "Snake", "Star"],
      "T": ["Tree", "Tiger", "Train"],
      "U": ["Umbrella", "Unicorn", "Up"],
      "V": ["Violin", "Volcano", "Vegetable"],
      "W": ["Whale", "Water", "Window"],
      "X": ["Xylophone", "X-ray", "Box"],
      "Y": ["Yo-yo", "Yellow", "Yogurt"],
      "Z": ["Zebra", "Zoo", "Zipper"]
    }
  },
  [CATEGORIES.NUMBERS]: {
    title: "Numbers",
    icon: "sort-numeric-down",
    color: {
      primary: "primary-blue",
      pastel: "pastel-blue",
      textClass: "text-primary-blue",
      bgClass: "bg-primary-blue",
      bgPastelClass: "bg-pastel-blue",
      hoverClass: "hover:bg-blue-600",
      borderClass: "border-primary-blue",
    },
    items: [
      "1", "2", "3", "4", "5", 
      "6", "7", "8", "9", "10",
      "11", "12", "13", "14", "15",
      "16", "17", "18", "19", "20"
    ],
    countExamples: {
      "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
      "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
      "11": 11, "12": 12, "13": 13, "14": 14, "15": 15,
      "16": 16, "17": 17, "18": 18, "19": 19, "20": 20
    }
  },
  [CATEGORIES.SHAPES]: {
    title: "Shapes",
    icon: "shapes",
    color: {
      primary: "primary-green",
      pastel: "pastel-green",
      textClass: "text-primary-green",
      bgClass: "bg-primary-green",
      bgPastelClass: "bg-pastel-green",
      hoverClass: "hover:bg-green-600",
      borderClass: "border-primary-green",
    },
    items: [
      "circle", "square", "triangle", "rectangle", 
      "oval", "star", "heart", "diamond", 
      "pentagon", "hexagon"
    ],
    realLifeExamples: {
      "circle": ["Clock", "Wheel", "Ball"],
      "square": ["Window", "Box", "Tile"],
      "triangle": ["Pizza Slice", "Roof", "Road Sign"],
      "rectangle": ["Door", "Book", "TV"],
      "oval": ["Egg", "Mirror", "Football"],
      "star": ["Star in Sky", "Starfish", "Star Badge"],
      "heart": ["Heart Symbol", "Valentine Card", "Candy"],
      "diamond": ["Playing Card", "Kite", "Jewel"],
      "pentagon": ["Soccer Ball Patch", "House Drawing", "Pentagon Building"],
      "hexagon": ["Honeycomb", "Nut Bolt", "Floor Tile"]
    }
  }
};

export const AVATARS = [
  { id: "red", color: "#e74c3c", icon: "smile" },
  { id: "blue", color: "#3498db", icon: "laugh-beam" },
  { id: "green", color: "#2ecc71", icon: "grin" },
];

export const AUDIO_MAP = {
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  // Alphabet sounds
  "letter-A": "/sounds/letter-a.mp3",
  "letter-B": "/sounds/letter-b.mp3",
  // Additional letter sounds would be added here
  
  // Number sounds
  "number-1": "/sounds/number-1.mp3",
  "number-2": "/sounds/number-2.mp3",
  // Additional number sounds would be added here
  
  // Shape sounds
  "shape-circle": "/sounds/shape-circle.mp3",
  "shape-square": "/sounds/shape-square.mp3",
  // Additional shape sounds would be added here
};
