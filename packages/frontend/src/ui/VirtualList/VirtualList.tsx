import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  // Updated renderItem signature to include style for react-window
  renderItem: (item: T, index: number, style: React.CSSProperties) => JSX.Element;
  height: number;
  width?: number | string; // Optional width, defaults to 100%
}

const VirtualList = <T extends unknown>({
  items,
  itemHeight,
  renderItem,
  height,
  width = '100%',
}: VirtualListProps<T>) => {

  // Row component that react-window will render
  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = items[index];
    // Pass the style prop from react-window to the rendered item
    // This is crucial for positioning the items correctly
    return renderItem(item, index, style);
  };

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width={width}
    >
      {Row}
    </FixedSizeList>
  );
};

export default VirtualList;