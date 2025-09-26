export const useServer = () => {
  return typeof window === "undefined";
};
