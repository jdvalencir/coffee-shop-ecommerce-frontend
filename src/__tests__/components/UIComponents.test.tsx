import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

// ── Badge ─────────────────────────────────────────────────────────────────────

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders with default variant classes', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-primary');
  });

  it('renders with secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Beta</Badge>);
    expect(container.firstChild).toHaveClass('bg-secondary');
  });

  it('renders with destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Alert</Badge>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('renders with outline variant', () => {
    const { container } = render(<Badge variant="outline">Tag</Badge>);
    expect(container.firstChild).toHaveClass('text-foreground');
  });

  it('accepts and applies custom className', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

// ── Card components ───────────────────────────────────────────────────────────

describe('Card', () => {
  it('renders children inside a div', () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="my-card">test</Card>);
    expect(container.firstChild).toHaveClass('my-card');
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });
});

describe('CardTitle', () => {
  it('renders as h3 with the title text', () => {
    render(<CardTitle>My Title</CardTitle>);
    const title = screen.getByText('My Title');
    expect(title.tagName).toBe('H3');
  });
});

describe('CardDescription', () => {
  it('renders description text', () => {
    render(<CardDescription>Some description</CardDescription>);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body content</CardContent>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders footer children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});

describe('Card composition', () => {
  it('renders a complete card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Product</CardTitle>
          <CardDescription>A great product</CardDescription>
        </CardHeader>
        <CardContent>Content here</CardContent>
        <CardFooter>Footer here</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('A great product')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
