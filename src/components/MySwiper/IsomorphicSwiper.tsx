import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { StaticSwiper } from "./Swiper";
import { StaticSwiperSlide } from "./SwiperSlide";

// TODO: Make a global state for isSSR
let isServer = true;

export const IsomorphicSwiper = ({
  children,
}: {
  children: (props: {
    Swiper: typeof Swiper;
    SwiperSlide: typeof SwiperSlide;
  }) => React.ReactNode;
}) => {
  const [isClient, setIsClient] = useState(!isServer);

  useEffect(() => {
    isServer = false;
    setIsClient(!isServer);
  }, []);

  const SwiperComponent = isClient ? Swiper : StaticSwiper;
  const SwiperSlideComponent = isClient ? SwiperSlide : StaticSwiperSlide;

  return (
    <>
      {children({
        Swiper: SwiperComponent,
        SwiperSlide: SwiperSlideComponent,
      })}
    </>
  );
};
