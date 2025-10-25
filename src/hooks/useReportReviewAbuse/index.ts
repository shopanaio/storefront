import { cmsPick } from "@src/cms/pick";
import useReportReviewAbuseShopana from "./useReportReviewAbuse.shopana";

export const useReportReviewAbuse = cmsPick({
  shopana: useReportReviewAbuseShopana,
});

export default useReportReviewAbuse;
