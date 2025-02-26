
interface CardImageProps {
  imageUrl?: string | null;
  title: string;
}

export const CardImage = ({ imageUrl, title }: CardImageProps) => {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  return (
    <div className="relative w-full aspect-[4/3]">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
};

