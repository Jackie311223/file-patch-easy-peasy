import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestProviders } from '../../utils/testUtils';
import { VirtualList } from '../../utils/VirtualList';

describe('VirtualList Component', () => {
  // Mock data for testing
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
  
  // Mock render item function
  const renderItem = (item: { id: number; name: string }, index: number) => (
    <div key={item.id} data-testid={`item-${item.id}`}>
      {item.name}
    </div>
  );

  test('renders visible items only', () => {
    const { container } = render(
      <TestProviders>
        <VirtualList
          items={mockItems}
          height={300}
          itemHeight={50}
          renderItem={renderItem}
          itemKey={(item) => item.id}
        />
      </TestProviders>
    );
    
    // Check that the container has the correct height
    const virtualListContainer = container.querySelector('div');
    expect(virtualListContainer).toHaveStyle('height: 300px');
    
    // Check that the total size div has the correct height (100 items * 50px)
    const totalSizeDiv = container.querySelector('div > div');
    expect(totalSizeDiv).toHaveStyle('height: 5000px');
    
    // Check that only a subset of items are rendered (not all 100)
    const renderedItems = screen.queryAllByTestId(/item-\d+/);
    expect(renderedItems.length).toBeLessThan(mockItems.length);
    expect(renderedItems.length).toBeGreaterThan(0);
  });

  test('renders items with correct positioning', () => {
    const { container } = render(
      <TestProviders>
        <VirtualList
          items={mockItems}
          height={300}
          itemHeight={50}
          renderItem={renderItem}
          itemKey={(item) => item.id}
        />
      </TestProviders>
    );
    
    // Get all rendered item containers
    const itemContainers = container.querySelectorAll('div > div > div');
    
    // Check that each item has absolute positioning and correct height
    itemContainers.forEach((itemContainer) => {
      expect(itemContainer).toHaveStyle('position: absolute');
      expect(itemContainer).toHaveStyle('height: 50px');
      expect(itemContainer).toHaveStyle('width: 100%');
      
      // Check that transform is using translateY for positioning
      const style = window.getComputedStyle(itemContainer);
      expect(style.transform).toMatch(/translateY\(\d+px\)/);
    });
  });

  test('calls onEndReached when scrolled near the end', async () => {
    const onEndReachedMock = jest.fn();
    
    const { container } = render(
      <TestProviders>
        <VirtualList
          items={mockItems}
          height={300}
          itemHeight={50}
          renderItem={renderItem}
          itemKey={(item) => item.id}
          onEndReached={onEndReachedMock}
          endReachedThreshold={0.8}
        />
      </TestProviders>
    );
    
    // Get the scrollable container
    const scrollContainer = container.firstChild as HTMLElement;
    
    // Simulate scrolling to 80% of the list
    Object.defineProperty(scrollContainer, 'offsetHeight', { value: 300 });
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 4000 * 0.8 - 300 });
    
    // Trigger scroll event
    fireEvent.scroll(scrollContainer);
    
    // Check that onEndReached was called
    await waitFor(() => {
      expect(onEndReachedMock).toHaveBeenCalled();
    });
  });
});
