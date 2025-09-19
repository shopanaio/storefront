"use client";

import { Flex } from "antd";
import React from "react";
import { HomeSectionType, Sections, SectionSettings } from "./sections";
import { createStyles } from "antd-style";
import { HomeProductGrid } from "./HomeProductGrid";
export interface HomeSection {
  id: string;
  type: HomeSectionType;
  settings: SectionSettings;
}

export const Home = ({ sections }: { sections: HomeSection[] }) => {
  const { styles } = useStyles();

  /* console.log(sections); */

  return (
    <Flex vertical gap={95} className={styles.container}>
      {/* <HomeProductGrid categoryHandle="electronics" /> */}

      {sections.map(({ settings, type, id }) => {
        const Component = Sections[type] as React.FC<SectionSettings>;

        if (!Component) {
          throw new Error(`Unknown section type: ${type}`);
        }

        return <Component key={id} {...settings} />;
      })}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      padding-top: ${token.padding}px;
    `,
    slide: css``,
    swiper: css``,
  };
});
