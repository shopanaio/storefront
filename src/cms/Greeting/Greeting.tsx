"use client";
// Example component showing CMS provider selection via hooks
import useGreeting from "./useGreeting";

// Render the content using hook data
export const Greeting = () => {
  const { title } = useGreeting();

  return <div>{title}</div>;
};
