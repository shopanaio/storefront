"use client";

import { Theme } from "@src/components/Theme/Theme";
import ConfirmPortalHost from "@src/components/UI/Confirm/ConfirmPortalHost";
import { WishlistProvider } from "@src/modules/wishlist";

interface IAppProps {
  children: React.ReactNode;
}

const App = ({ children }: IAppProps) => {
  return (
    <WishlistProvider>
      <Theme>
        {children}
        <ConfirmPortalHost />
      </Theme>
    </WishlistProvider>
  );
};

export default App;
