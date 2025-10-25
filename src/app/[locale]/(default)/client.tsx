'use client';

import React from 'react';
import { Home } from '@src/components/Home/Home';
import useHomeClientQuery from '@src/hooks/home/useHomeClientQuery';
import Script from 'next/script';

export const HomeClient = () => {
  const sections = useHomeClientQuery();

  return (
    <>
      <Script src="/embed/widgets/box-builder.js" strategy="afterInteractive" />
      <div
        style={{
          padding: '12px',
          border: '1px dashed #999',
          marginBottom: '16px',
        }}
      >
        <button id="box-builder-button">Open Box Builder Widget</button>
      </div>
      <Home sections={sections} />
    </>
  );
};
