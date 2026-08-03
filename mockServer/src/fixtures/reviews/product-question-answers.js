import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { productQuestions } from "./product-questions.js";

const answerBodies = [
  "The tee is pre-washed and should have minimal shrinkage when washed cool and air dried. Choose your usual size.",
  "The Cloud linen is lightly opaque. Most customers wear it on its own, though darker undergarments may show in bright light.",
  "Yes. The suspended sleeve fits most 16-inch laptops up to 36 × 25 cm.",
  "Yes, both glazes are dishwasher and microwave safe for everyday use.",
  "A full charge takes approximately three hours with the included USB-C cable.",
  "Yes. Multipoint pairing supports two active devices and lets you switch audio automatically.",
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
      author: { type: "STAFF", customerId: null, displayName: "Northstar Product Team" },
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
