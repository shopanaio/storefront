import { cmsPick } from "@src/cms/pick";
import useCreateReviewShopana from "./useCreateReview.shopana";

export const useCreateReview = cmsPick({
  shopana: useCreateReviewShopana,
});

export default useCreateReview;
