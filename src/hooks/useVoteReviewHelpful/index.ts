import { cmsPick } from "@src/cms/pick";
import useVoteReviewHelpfulShopana from "./useVoteReviewHelpful.shopana";

export const useVoteReviewHelpful = cmsPick({
  shopana: useVoteReviewHelpfulShopana,
});

export default useVoteReviewHelpful;
