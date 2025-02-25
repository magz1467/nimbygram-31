
interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
}

const Image = ({ src, alt, className, width, height, loading = "lazy", ...props }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt || ''}
      className={className || ''}
      loading={loading}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Image;

