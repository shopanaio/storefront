import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { productQuestions } from "./product-questions.js";

const answerBodies = [
  "The salmon recipe is designed to be gentle, but transition over seven to ten days and consult your veterinarian for specific sensitivities.",
  "It is formulated for adult indoor cats. For a senior cat, ask your veterinarian whether its calorie and mineral profile fits her needs.",
  "Its dimensions meet many in-cabin guidelines, but airline rules vary. Confirm the exact allowance before traveling.",
  "Yes, both glazed ceramic bowls are dishwasher safe for everyday cleaning.",
  "Yes. Backup batteries keep scheduled portions running during a short outage, while app features require Wi-Fi.",
  "Live location typically updates within seconds where cellular coverage is available; dense terrain can reduce accuracy.",
];

export const productQuestionAnswers = productQuestions
  .filter(({ answerIds }) => answerIds.length)
  .map((question, index) => {
    const createdAt = new Date(Date.parse(question.createdAt) + 43_200_000).toISOString();
    return {
      id: question.answerIds[0],
      kind: "QUESTION_ANSWER",
      title: null,
      body: answerBodies[index],
      locale: "en",
      author: { type: "STAFF", customerId: null, displayName: "Paw & Whisker Pet Team" },
      status: "PUBLISHED",
      revision: 1,
      publishedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      metrics: contentMetrics({ likeCount: 2 + index }),
      translations: [],
      ...emptyViewerState,
      questionId: question.id,
      isOfficial: true,
      isAccepted: true,
      sortIndex: 0,
    };
  });
