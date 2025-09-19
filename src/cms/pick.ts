export const cmsPick = <T>(mapping: Record<string, T>) => {
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    console.warn("warning: cms picker is not compiled");
  }

  const m = mapping[process.env.NEXT_PUBLIC_CMS_PROVIDER!];
  if (!m) {
    throw new Error(
      `Provider ${process.env.NEXT_PUBLIC_CMS_PROVIDER} not found`
    );
  }

  return m;
};
