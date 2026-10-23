import { render, screen } from '@testing-library/react';
import { ImageFan } from './ImageFan';

const images = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    key: `line-${index}`,
    src: `https://cdn.test/${index}.jpg`,
    alt: `Product ${index}`,
  }));

describe('ImageFan', () => {
  it('draws at most three cards, the first on top', () => {
    render(<ImageFan images={images(5)} />);
    const drawn = screen.getAllByRole('img');
    expect(drawn.map((image) => image.getAttribute('alt'))).toEqual([
      'Product 0',
      'Product 1',
      'Product 2',
    ]);
    const zIndex = (image: HTMLElement) =>
      Number(image.parentElement?.style.zIndex);
    expect(zIndex(drawn[0])).toBeGreaterThan(zIndex(drawn[1]));
    expect(zIndex(drawn[0])).toBeGreaterThan(zIndex(drawn[2]));
  });

  it('turns the cards behind out to opposite sides', () => {
    render(<ImageFan images={images(3)} />);
    const [front, left, right] = screen
      .getAllByRole('img')
      .map((image) => image.parentElement?.style.transform);
    expect(front).toBe('translate(0px, 0px) rotate(0deg)');
    expect(left).toContain('rotate(-');
    expect(right).not.toContain('rotate(-');
  });

  it('keeps its proportions at any size', () => {
    const fan = (size: number) => {
      const { container, unmount } = render(
        <ImageFan images={images(3)} size={size} />
      );
      const box = container.firstElementChild as HTMLElement;
      const cards = [...box.children] as HTMLElement[];
      const result = {
        width: parseFloat(box.style.width),
        transforms: cards.map((card) => card.style.transform),
      };
      unmount();
      return result;
    };
    const small = fan(50);
    const large = fan(100);
    expect(large.width).toBeCloseTo(small.width * 2);
    expect(large.transforms[2]).toBe(
      small.transforms[2].replace(
        /(-?[\d.]+)px/g,
        (_, value) => `${Number(value) * 2}px`
      )
    );
  });

  it('draws nothing without images', () => {
    const { container } = render(<ImageFan images={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
