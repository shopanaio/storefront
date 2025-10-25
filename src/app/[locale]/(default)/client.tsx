'use client';

import React from 'react';
import { Home } from '@src/components/Home/Home';
import useHomeClientQuery from '@src/hooks/home/useHomeClientQuery';
import Script from 'next/script';

export const HomeClient = () => {
  const sections = useHomeClientQuery();

  return (
    <>
      {/* Load widget and pass custom selector via data attribute */}
      <Script
        src="/embed/widgets/box-builder.js"
        strategy="afterInteractive"
        data-selector=".js-open-boxbuilder"
      />
      <div
        style={{
          padding: '12px',
          border: '1px dashed #999',
          marginBottom: '16px',
        }}
      >
        <button className="js-open-boxbuilder" style={{ marginLeft: 8 }}>
          Open Box Builder (custom selector)
        </button>
      </div>
      <Home sections={sections} />
    </>
  );
};
