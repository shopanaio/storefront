'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from '@shopana/storefront/navigation';
import { App } from 'antd';
import { useModalStackMessages } from '../i18n/messages';
import { connectModalStackUrl } from '../url/controller';

export function ModalStackUrlController() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { modal } = App.useApp();
  const messages = useModalStackMessages();
  const confirmRef = useRef<() => Promise<boolean>>(async () => false);
  const connection = useRef<ReturnType<typeof connectModalStackUrl> | null>(
    null
  );
  // Declared before the connection: its first sync may already ask to leave.
  useEffect(() => {
    confirmRef.current = async () =>
      Boolean(
        await modal.confirm({
          icon: null,
          title: messages.unsavedChanges,
          content: messages.unsavedChangesMessage,
          okText: messages.leave,
          cancelText: messages.stay,
        })
      );
  }, [modal, messages]);

  useEffect(() => {
    const controller = connectModalStackUrl({
      read: () => new URL(window.location.href),
      replace: (url) =>
        window.history.replaceState(window.history.state, '', url),
      confirmLeave: () => confirmRef.current(),
    });
    connection.current = controller;
    const onPopState = () => {
      void controller.syncLocation();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      connection.current = null;
      window.removeEventListener('popstate', onPopState);
      controller.dispose();
    };
  }, []);

  useEffect(() => {
    void connection.current?.syncLocation();
  }, [pathname, searchParams]);
  return null;
}
