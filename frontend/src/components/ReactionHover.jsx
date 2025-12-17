const reactions = [
  { type: "like", emoji: "👍" },
  { type: "love", emoji: "❤️" },
  { type: "haha", emoji: "😂" },
  { type: "wow", emoji: "😮" },
  { type: "sad", emoji: "😢" },
  { type: "angry", emoji: "😡" },
];

const ReactionHover = ({ onSelect }) => (
  <div className="absolute -top-12 left-0 flex gap-1 bg-white border rounded-full px-2 py-1 shadow-lg z-50">
    {reactions.map(r => (
      <button
        key={r.type}
        onClick={() => onSelect(r.type)}
        className="text-lg hover:scale-125 transition"
      >
        {r.emoji}
      </button>
    ))}
  </div>
);

export default ReactionHover;
