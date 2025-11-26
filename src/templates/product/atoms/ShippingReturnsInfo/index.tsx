import { Typography } from "antd";

const { Paragraph } = Typography;

export const ShippingReturnsInfo = () => {
  return (
    <>
      <Paragraph>
        Delivery, setup and packaging removal included. Setup is in
        accordance with manufacturing guidelines so product is ready for
        intended use.
      </Paragraph>
      <Paragraph>
        *Our delivery coverage is within 50-miles of a Costco Wholesale
        warehouse (some exceptions apply). Orders shipped to Alaska, Hawaii
        or Puerto Rico may have an additional shipping and handling charge
        calculated and applied at checkout. To confirm availability in your
        area, enter the delivery zip code at the top of the item page.
      </Paragraph>
      <Paragraph>Shipping is included in the quoted price.</Paragraph>
      <Paragraph>
        *Delivery is available to Alaska, Hawaii and Puerto Rico; however,
        an additional Shipping and Handling fee will apply. This fee will be
        quoted at checkout. Additional transit time may also be required.
        Locations outside of a regular delivery area may be restricted.
        Click Here to view restricted areas. To inquire about delivery to
        these areas, please contact customer service.
      </Paragraph>
      <Paragraph>
        Costco.com products can be returned to any of our more than 800
        Costco warehouses worldwide.
      </Paragraph>
    </>
  );
};
