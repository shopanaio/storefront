import './init'; // Register templates
import type { ReactNode } from 'react';

export default function DemoFrameworkLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        <header style={{
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '2rem',
          borderBottom: '4px solid rgba(255,255,255,0.2)'
        }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
            ⚡ Next E-commerce Core Demo
          </h1>
          <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>
            RSC-first framework with type-safe templates
          </p>
        </header>
        <nav style={{
          background: '#f8f9fa',
          padding: '1rem 2rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <a href="/demo-framework" style={{
            padding: '0.5rem 1rem',
            background: '#667eea',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            🏠 Home
          </a>
          <a href="/demo-framework/products/demo-product" style={{
            padding: '0.5rem 1rem',
            background: '#764ba2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            📦 Product Page
          </a>
          <a href="/demo-framework/collections/demo-collection" style={{
            padding: '0.5rem 1rem',
            background: '#f093fb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            📚 Collection Page
          </a>
          <a href="/demo-framework/cart" style={{
            padding: '0.5rem 1rem',
            background: '#4facfe',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            🛒 Cart Page
          </a>
        </nav>
        {children}
      </div>
    </div>
  );
}
