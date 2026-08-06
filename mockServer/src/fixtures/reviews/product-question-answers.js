import { contentMetrics, emptyViewerState, gid } from "../shared.js";
import { customers } from "../customers/customers.js";
import { productQuestionAnswerDefinitions } from "./product-question-answer-definitions.js";
import { productQuestions } from "./product-questions.js";

export const productQuestionAnswers = productQuestions.flatMap((question, questionIndex) =>
  productQuestionAnswerDefinitions[questionIndex].map(([body, customerIndex, isAccepted], answerIndex) => {
    const customer = customerIndex === null ? null : customers[customerIndex];
    const createdAt = new Date(Date.parse(question.createdAt) + 43_200_000 + answerIndex * 3_600_000).toISOString();
    return {
      id: gid("ProductQuestionAnswer", `${questionIndex + 1}-${answerIndex + 1}`),
      kind: "QUESTION_ANSWER",
      title: null,
      body,
      locale: "en",
      author: customer
        ? { type: "CUSTOMER", customerId: customer.id, displayName: customer.displayName }
        : { type: "STAFF", customerId: null, displayName: "Paw & Whisker Pet Team" },
      status: "PUBLISHED",
      revision: 1,
      publishedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      metrics: contentMetrics({ likeCount: 2 + questionIndex + answerIndex }),
      translations: [],
      ...emptyViewerState,
      questionId: question.id,
      isOfficial: customer === null,
      isAccepted,
      sortIndex: answerIndex,
    };
  }));
