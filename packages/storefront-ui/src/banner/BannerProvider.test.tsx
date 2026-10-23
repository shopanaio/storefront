import { cleanup, render, screen } from '@testing-library/react';
import { Banner } from './Banner';
import { BannerProvider } from './BannerProvider';

afterEach(cleanup);

const Tone = ({ label }: { label: string }) => <svg data-testid={label} />;

describe('BannerProvider', () => {
  it('a nested provider adds to the outer one', () => {
    render(
      <BannerProvider
        classNames={{ root: 'outer', title: 'outer-title' }}
        styles={{ root: { borderWidth: 2, borderStyle: 'dashed' } }}
        icons={{
          action: () => <Tone label="outer-action" />,
          success: () => <Tone label="outer-success" />,
        }}
      >
        <BannerProvider
          classNames={{ root: 'inner' }}
          styles={{ root: { borderWidth: 3 } }}
          icons={{ action: () => <Tone label="inner-action" /> }}
        >
          <Banner tone="action" title="Choose delivery" />
          <Banner tone="success" title="Saved" />
        </BannerProvider>
      </BannerProvider>
    );

    const [action, success] = screen.getAllByRole('status');
    // Classes of a part add up; styles override one by one.
    expect(action).toHaveClass('outer', 'inner');
    expect(screen.getByText('Choose delivery')).toHaveClass('outer-title');
    expect(action).toHaveStyle({ borderWidth: '3px', borderStyle: 'dashed' });
    // An icon set inside wins; the others stay the outer ones.
    expect(screen.getByTestId('inner-action')).toBeInTheDocument();
    expect(screen.queryByTestId('outer-action')).toBeNull();
    expect(success).toContainElement(screen.getByTestId('outer-success'));
  });

  it('the banner own classes and styles win over the theme', () => {
    render(
      <BannerProvider
        classNames={{ root: 'theme' }}
        styles={{ root: { borderWidth: 2 } }}
      >
        <Banner
          tone="warning"
          title="Price changed"
          className="own"
          classNames={{ root: 'own-part' }}
          styles={{ root: { borderWidth: 4 } }}
          style={{ marginTop: 8 }}
        />
      </BannerProvider>
    );

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('theme', 'own', 'own-part');
    expect(banner).toHaveStyle({ borderWidth: '4px', marginTop: '8px' });
  });

  it('tone colors of the provider color the banner', () => {
    render(
      <BannerProvider tones={{ critical: { background: 'rgb(1, 2, 3)' } }}>
        <BannerProvider tones={{ critical: { border: 'rgb(4, 5, 6)' } }}>
          <Banner tone="critical" title="Payment failed" />
        </BannerProvider>
      </BannerProvider>
    );

    const banner = screen.getByRole('alert');
    expect(getComputedStyle(banner).backgroundColor).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(banner).borderColor).toBe('rgb(4, 5, 6)');
  });
});
