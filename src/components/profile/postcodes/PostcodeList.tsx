
import { PostcodeItem } from '../PostcodeItem';
import { Button } from "@/components/ui/button";
import { Postcode } from '@/hooks/use-postcode-section';

interface PostcodeListProps {
  postcodes: Postcode[];
  showAddNew: boolean;
  onAddClick: () => void;
  onDelete: (id: number) => void;
  onAlertClick: (postcode: string, id: number) => void;
}

export const PostcodeList = ({
  postcodes,
  showAddNew,
  onAddClick,
  onDelete,
  onAlertClick
}: PostcodeListProps) => {
  return (
    <div className="space-y-2 mt-2">
      {postcodes.map((item) => (
        <PostcodeItem
          key={item.id}
          id={item.id}
          postcode={item.postcode}
          radius={item.radius}
          onDelete={onDelete}
          onAlertClick={(postcode) => onAlertClick(postcode, item.id)}
        />
      ))}

      {!showAddNew && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onAddClick}
        >
          Add Postcode
        </Button>
      )}
    </div>
  );
};
