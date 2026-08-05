import useToken from 'antd/es/theme/useToken';
import { PiCreditCardDuotone } from "react-icons/pi";

export function BTLogo({ size = 20, ...props }: { size?: number }) {
  const [, token] = useToken();
  return <PiCreditCardDuotone color={token.colorPrimary} {...props} size={size} />;
}
