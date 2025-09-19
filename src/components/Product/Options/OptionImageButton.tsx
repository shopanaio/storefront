"use client";

import { Thumbnail, type ThumbnailProps } from "@src/components/UI/Thumbnail/Thumbnail";

// Re-export props for backward compatibility
export type OptionImageButtonProps = ThumbnailProps;

// Alias to the shared Thumbnail component
export const OptionImageButton = Thumbnail;
