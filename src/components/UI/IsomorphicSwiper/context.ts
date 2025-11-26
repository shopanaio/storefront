import { createContext } from "react";
import { SwiperOptions } from "swiper/types";

export const ctx = createContext<
  SwiperOptions & { currentDirection?: "horizontal" | "vertical" }
>({});
