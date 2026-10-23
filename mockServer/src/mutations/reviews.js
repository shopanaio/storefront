import { contentMetrics, emptyViewerState, gid } from '../fixture-helpers.js';
import { reviewError } from '../helpers.js';

/**
 * Review settings of the store. `MOCK_GUEST_REVIEWS`, `MOCK_GUEST_QUESTIONS` and
 * `MOCK_CUSTOMER_ANSWERS` (`true` or `false`) override the fixture's `guestReviewsEnabled`,
 * `guestQuestionsEnabled` and `customerAnswersEnabled`.
 */
const CONFIGURATION_SWITCHES = {
  guestReviewsEnabled: 'MOCK_GUEST_REVIEWS',
  guestQuestionsEnabled: 'MOCK_GUEST_QUESTIONS',
  customerAnswersEnabled: 'MOCK_CUSTOMER_ANSWERS',
};

export const reviewStoreConfiguration = (store) => {
  const configuration = store.state.reviewStoreConfiguration;
  const overrides = Object.entries(CONFIGURATION_SWITCHES)
    .filter(
      ([, variable]) =>
        process.env[variable] === 'true' || process.env[variable] === 'false'
    )
    .map(([field, variable]) => [field, process.env[variable] === 'true']);
  return overrides.length
    ? { ...configuration, ...Object.fromEntries(overrides) }
    : configuration;
};

const contentCollections = (store) => [
  store.state.reviews,
  store.state.productQuestions,
  store.state.productQuestionAnswers,
  store.state.reviewReplies,
];

const findContent = (store, id) =>
  contentCollections(store)
    .flat()
    .find((content) => content.id === id) ?? null;

const authorFor = (customer, submission) =>
  customer
    ? {
        type: 'CUSTOMER',
        customerId: customer.id,
        displayName: customer.displayName,
      }
    : {
        type: 'GUEST',
        customerId: null,
        displayName: submission.author?.displayName?.trim() || 'Store visitor',
      };

const contentBase = (store, kind, submission, customer, status) => {
  const now = store.now();
  return {
    kind,
    title: null,
    body: submission.body,
    locale: submission.locale ?? 'en',
    author: authorFor(customer, submission),
    status,
    revision: 1,
    publishedAt: status === 'PUBLISHED' ? now : null,
    createdAt: now,
    updatedAt: now,
    metrics: contentMetrics({ updatedAt: now }),
    translations: [],
    ...structuredClone(emptyViewerState),
    viewerCapabilities: {
      canUpdate: Boolean(customer),
      canDelete: Boolean(customer),
      editableUntil: customer
        ? new Date(Date.parse(now) + 72 * 3_600_000).toISOString()
        : null,
    },
  };
};

const ownershipError = (store, context, id) => {
  const content = findContent(store, id);
  if (!content || !store.owns(context.customer, content)) {
    return {
      error: reviewError(
        'CONTENT_NOT_FOUND',
        'The review content is unavailable.',
        ['id']
      ),
    };
  }
  return { content };
};

const applyContentEdit = (store, content, edit) => {
  if (!edit) return;
  for (const field of ['title', 'body', 'locale']) {
    if (Object.hasOwn(edit, field)) content[field] = edit[field];
  }
  store.touchContent(content);
};

const reviewMediaFromInput = (store, review, mediaInput) => {
  const existing = new Map(
    store.state.reviewMedia
      .filter(({ reviewId }) => reviewId === review.id)
      .map((media) => [media.mediaId, media])
  );
  store.state.reviewMedia = store.state.reviewMedia.filter(
    ({ reviewId }) => reviewId !== review.id
  );
  const media = (mediaInput ?? []).map((input, index) => {
    const previous = existing.get(input.mediaId);
    return {
      id:
        previous?.id ??
        gid('ReviewMedia', `runtime-${store.next('review-media')}`),
      reviewId: review.id,
      revision: (previous?.revision ?? 0) + 1,
      mediaId: input.mediaId,
      sortIndex: input.sortIndex ?? index,
      caption: input.caption ?? null,
      status: review.status,
      createdAt: previous?.createdAt ?? review.createdAt,
      updatedAt: review.updatedAt,
    };
  });
  store.state.reviewMedia.push(...media);
  review.mediaIds = media.map(({ id }) => id);
  review.metrics.mediaCount = media.length;
};

const contentOwnerKey = (context) => context.customer?.id ?? 'anonymous-viewer';

const validateGuestAuthor = (context, submission) => {
  if (context.customer) return [];

  const errors = [];
  if (!submission.author?.displayName?.trim()) {
    errors.push(
      reviewError('GUEST_AUTHOR_REQUIRED', 'Guest display name is required.', [
        'content',
        'author',
        'displayName',
      ])
    );
  }
  if (!submission.author?.email?.trim()) {
    errors.push(
      reviewError('GUEST_AUTHOR_REQUIRED', 'Guest email is required.', [
        'content',
        'author',
        'email',
      ])
    );
  }
  return errors;
};

const validateRatingsAndMedia = (store, ratings, media) => {
  const errors = [];
  if (
    ratings?.some(
      ({ criterionId }) =>
        store.get(criterionId)?.__typename !== 'ReviewRatingCriterion'
    )
  ) {
    errors.push(
      reviewError(
        'RATING_CRITERION_NOT_FOUND',
        'A rating criterion does not exist.',
        ['ratings', 'criterionId']
      )
    );
  }
  const mediaTypes = new Set([
    'MediaImage',
    'Video',
    'ExternalVideo',
    'Model3d',
  ]);
  if (
    media?.some(
      ({ mediaId }) => !mediaTypes.has(store.get(mediaId)?.__typename)
    )
  ) {
    errors.push(
      reviewError('MEDIA_NOT_FOUND', 'A review media item does not exist.', [
        'media',
        'mediaId',
      ])
    );
  }
  if (
    (media?.length ?? 0) > reviewStoreConfiguration(store).maxReviewMediaCount
  ) {
    errors.push(
      reviewError(
        'TOO_MANY_MEDIA_ITEMS',
        'The review contains too many media items.',
        ['media']
      )
    );
  }
  return errors;
};

export const reviewMutations = (store) => ({
  reviewCreate: (_, { input }, context) =>
    store.replay('reviewCreate', input.content.idempotencyKey, () => {
      const product = store.get(input.productId);
      const variant = input.variantId ? store.get(input.variantId) : null;
      const errors = [];
      if (product?.__typename !== 'Product')
        errors.push(
          reviewError('PRODUCT_NOT_FOUND', 'The product does not exist.', [
            'productId',
          ])
        );
      if (
        input.variantId &&
        (variant?.__typename !== 'ProductVariant' ||
          variant.productId !== input.productId)
      ) {
        errors.push(
          reviewError(
            'VARIANT_NOT_FOUND',
            'The product variant does not exist.',
            ['variantId']
          )
        );
      }
      if (input.rating < 1 || input.rating > 5)
        errors.push(
          reviewError('INVALID_RATING', 'Rating must be between 1 and 5.', [
            'rating',
          ])
        );
      if (!context.customer) {
        if (!reviewStoreConfiguration(store).guestReviewsEnabled) {
          errors.push(
            reviewError(
              'AUTHENTICATION_REQUIRED',
              'Guest reviews are disabled.'
            )
          );
        } else {
          errors.push(...validateGuestAuthor(context, input.content));
        }
      }
      errors.push(
        ...validateRatingsAndMedia(store, input.ratings, input.media)
      );
      if (errors.length) return { review: null, userErrors: errors };

      const base = contentBase(
        store,
        'REVIEW',
        input.content,
        context.customer,
        'PUBLISHED'
      );
      const review = {
        ...base,
        id: gid('Review', `runtime-${store.next('review')}`),
        title: input.title ?? null,
        productId: input.productId,
        variantId: input.variantId ?? null,
        rating: input.rating,
        ratings: (input.ratings ?? []).map((rating) => ({
          ...rating,
          createdAt: base.createdAt,
          updatedAt: base.updatedAt,
        })),
        verificationStatus: 'UNVERIFIED',
        isVerifiedPurchase: false,
        isIncentivized: false,
        incentiveDisclosure: null,
        mediaIds: [],
        replyIds: [],
      };
      reviewMediaFromInput(store, review, input.media);
      store.state.reviews.unshift(review);
      const request = store.state.reviewRequests.find(
        (candidate) =>
          candidate.customerId === context.customer?.id &&
          candidate.productId === review.productId &&
          !candidate.reviewId
      );
      if (request) {
        request.reviewId = review.id;
        request.status = 'SUBMITTED';
        request.submittedAt = review.createdAt;
        request.updatedAt = review.createdAt;
      }
      store.reindex();
      return { review, userErrors: [] };
    }),

  reviewUpdate: (_, { input }, context) => {
    const { content: review, error } = ownershipError(
      store,
      context,
      input.reviewId
    );
    if (error || review?.__typename !== 'Review')
      return {
        review: null,
        userErrors: [
          error ??
            reviewError('REVIEW_NOT_FOUND', 'The review is unavailable.'),
        ],
      };
    const validationErrors = validateRatingsAndMedia(
      store,
      input.ratings,
      input.media
    );
    if (validationErrors.length)
      return { review: null, userErrors: validationErrors };
    if (input.rating !== null && input.rating !== undefined) {
      if (input.rating < 1 || input.rating > 5)
        return {
          review: null,
          userErrors: [
            reviewError('INVALID_RATING', 'Rating must be between 1 and 5.', [
              'rating',
            ]),
          ],
        };
      review.rating = input.rating;
    }
    if (input.ratings) {
      review.ratings = input.ratings.map((rating) => ({
        ...rating,
        createdAt: review.createdAt,
        updatedAt: store.now(),
      }));
    }
    applyContentEdit(store, review, input.content);
    if (!input.content) store.touchContent(review);
    if (input.media) reviewMediaFromInput(store, review, input.media);
    store.reindex();
    return { review, userErrors: [] };
  },

  reviewDelete: (_, { input }, context) => {
    const { content: review, error } = ownershipError(store, context, input.id);
    if (error || review?.__typename !== 'Review')
      return {
        deletedReviewId: null,
        userErrors: [
          error ??
            reviewError('REVIEW_NOT_FOUND', 'The review is unavailable.'),
        ],
      };
    store.state.reviews = store.state.reviews.filter(
      ({ id }) => id !== review.id
    );
    store.state.reviewMedia = store.state.reviewMedia.filter(
      ({ reviewId }) => reviewId !== review.id
    );
    store.state.reviewReplies = store.state.reviewReplies.filter(
      ({ reviewId }) => reviewId !== review.id
    );
    store.reindex();
    return { deletedReviewId: review.id, userErrors: [] };
  },

  productQuestionCreate: (_, { input }, context) =>
    store.replay('productQuestionCreate', input.content.idempotencyKey, () => {
      const product = store.get(input.productId);
      const variant = input.variantId ? store.get(input.variantId) : null;
      const errors = [];
      if (product?.__typename !== 'Product')
        errors.push(
          reviewError('PRODUCT_NOT_FOUND', 'The product does not exist.', [
            'productId',
          ])
        );
      if (
        input.variantId &&
        (variant?.__typename !== 'ProductVariant' ||
          variant.productId !== input.productId)
      ) {
        errors.push(
          reviewError(
            'VARIANT_NOT_FOUND',
            'The product variant does not exist.',
            ['variantId']
          )
        );
      }
      if (!context.customer) {
        if (!reviewStoreConfiguration(store).guestQuestionsEnabled) {
          errors.push(
            reviewError(
              'AUTHENTICATION_REQUIRED',
              'Guest questions are disabled.'
            )
          );
        } else {
          errors.push(...validateGuestAuthor(context, input.content));
        }
      }
      if (errors.length) return { productQuestion: null, userErrors: errors };
      const question = {
        ...contentBase(
          store,
          'PRODUCT_QUESTION',
          input.content,
          context.customer,
          'PUBLISHED'
        ),
        id: gid('ProductQuestion', `runtime-${store.next('product-question')}`),
        productId: input.productId,
        variantId: input.variantId ?? null,
        answerIds: [],
        viewerSubscription: null,
      };
      store.state.productQuestions.unshift(question);
      store.reindex();
      return { productQuestion: question, userErrors: [] };
    }),

  productQuestionUpdate: (_, { input }, context) => {
    const { content: question, error } = ownershipError(
      store,
      context,
      input.productQuestionId
    );
    if (error || question?.__typename !== 'ProductQuestion') {
      return {
        productQuestion: null,
        userErrors: [
          error ??
            reviewError('QUESTION_NOT_FOUND', 'The question is unavailable.'),
        ],
      };
    }
    applyContentEdit(store, question, input.content);
    return { productQuestion: question, userErrors: [] };
  },

  productQuestionDelete: (_, { input }, context) => {
    const { content: question, error } = ownershipError(
      store,
      context,
      input.id
    );
    if (error || question?.__typename !== 'ProductQuestion') {
      return {
        deletedProductQuestionId: null,
        userErrors: [
          error ??
            reviewError('QUESTION_NOT_FOUND', 'The question is unavailable.'),
        ],
      };
    }
    store.state.productQuestions = store.state.productQuestions.filter(
      ({ id }) => id !== question.id
    );
    store.state.productQuestionAnswers =
      store.state.productQuestionAnswers.filter(
        ({ questionId }) => question.id !== questionId
      );
    store.reindex();
    return { deletedProductQuestionId: question.id, userErrors: [] };
  },

  productQuestionAnswerCreate: (_, { input }, context) =>
    store.replay(
      'productQuestionAnswerCreate',
      input.content.idempotencyKey,
      () => {
        // Answers are the customer's, and only when the store takes them.
        if (!context.customer) {
          return {
            productQuestion: null,
            answer: null,
            userErrors: [
              reviewError(
                'AUTHENTICATION_REQUIRED',
                'A customer session is required.'
              ),
            ],
          };
        }
        if (!reviewStoreConfiguration(store).customerAnswersEnabled) {
          return {
            productQuestion: null,
            answer: null,
            userErrors: [
              reviewError(
                'ANSWERS_DISABLED',
                'Customer answers are disabled.',
                ['input']
              ),
            ],
          };
        }
        const question = store.get(input.productQuestionId);
        if (question?.__typename !== 'ProductQuestion') {
          return {
            productQuestion: null,
            answer: null,
            userErrors: [
              reviewError(
                'QUESTION_NOT_FOUND',
                'The question is unavailable.',
                ['productQuestionId']
              ),
            ],
          };
        }
        const answer = {
          ...contentBase(
            store,
            'QUESTION_ANSWER',
            input.content,
            context.customer,
            'PENDING'
          ),
          id: gid(
            'ProductQuestionAnswer',
            `runtime-${store.next('question-answer')}`
          ),
          questionId: question.id,
          isOfficial: false,
          isAccepted: false,
          sortIndex: question.answerIds.length,
        };
        store.state.productQuestionAnswers.push(answer);
        question.answerIds.push(answer.id);
        question.metrics.childCount += 1;
        question.metrics.lastChildAt = answer.createdAt;
        store.touchContent(question);
        store.reindex();
        return { productQuestion: question, answer, userErrors: [] };
      }
    ),

  productQuestionAnswerUpdate: (_, { input }, context) => {
    const { content: answer, error } = ownershipError(
      store,
      context,
      input.answerId
    );
    if (error || answer?.__typename !== 'ProductQuestionAnswer') {
      return {
        answer: null,
        userErrors: [
          error ??
            reviewError('ANSWER_NOT_FOUND', 'The answer is unavailable.'),
        ],
      };
    }
    applyContentEdit(store, answer, input.content);
    return { answer, userErrors: [] };
  },

  productQuestionAnswerDelete: (_, { input }, context) => {
    const { content: answer, error } = ownershipError(store, context, input.id);
    if (error || answer?.__typename !== 'ProductQuestionAnswer') {
      return {
        deletedAnswerId: null,
        userErrors: [
          error ??
            reviewError('ANSWER_NOT_FOUND', 'The answer is unavailable.'),
        ],
      };
    }
    store.state.productQuestionAnswers =
      store.state.productQuestionAnswers.filter(({ id }) => id !== answer.id);
    const question = store.get(answer.questionId);
    if (question) {
      question.answerIds = question.answerIds.filter((id) => id !== answer.id);
      question.metrics.childCount = Math.max(
        0,
        question.metrics.childCount - 1
      );
      store.touchContent(question);
    }
    store.reindex();
    return { deletedAnswerId: answer.id, userErrors: [] };
  },

  productQuestionSubscriptionSet: (_, { input }, context) => {
    const question = store.get(input.productQuestionId);
    if (question?.__typename !== 'ProductQuestion')
      return {
        subscription: null,
        userErrors: [
          reviewError('QUESTION_NOT_FOUND', 'The question is unavailable.'),
        ],
      };
    if (!context.customer)
      return {
        subscription: null,
        userErrors: [
          reviewError(
            'AUTHENTICATION_REQUIRED',
            'A customer session is required.'
          ),
        ],
      };
    let subscription = store.state.productQuestionSubscriptions.find(
      (candidate) =>
        candidate.questionId === question.id &&
        candidate.subscriberCustomerId === context.customer.id
    );
    const now = store.now();
    if (!subscription) {
      subscription = {
        id: gid(
          'ProductQuestionSubscription',
          `runtime-${store.next('question-subscription')}`
        ),
        questionId: question.id,
        subscriberCustomerId: context.customer.id,
        channel: input.channel ?? 'EMAIL',
        status: input.subscribed ? 'ACTIVE' : 'UNSUBSCRIBED',
        locale: input.locale ?? 'en',
        lastNotifiedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      store.state.productQuestionSubscriptions.push(subscription);
    } else {
      subscription.status = input.subscribed ? 'ACTIVE' : 'UNSUBSCRIBED';
      subscription.channel = input.channel ?? subscription.channel;
      subscription.locale = input.locale ?? subscription.locale;
      subscription.updatedAt = now;
    }
    store.reindex();
    return { subscription, userErrors: [] };
  },

  reviewContentVoteSet: (_, { input }, context) => {
    const content = findContent(store, input.contentId);
    if (!content)
      return {
        content: null,
        vote: null,
        userErrors: [
          reviewError(
            'CONTENT_NOT_FOUND',
            'The review content is unavailable.'
          ),
        ],
      };
    const ownerKey = contentOwnerKey(context);
    let vote = store.state.reviewContentVotes.find(
      (candidate) =>
        candidate.contentId === content.id && candidate.viewerKey === ownerKey
    );
    const now = store.now();
    if (vote && vote.type !== input.type)
      content.metrics[`${vote.type.toLowerCase()}Count`] = Math.max(
        0,
        content.metrics[`${vote.type.toLowerCase()}Count`] - 1
      );
    if (!vote) {
      vote = {
        id: gid('ReviewContentVote', `runtime-${store.next('review-vote')}`),
        contentId: content.id,
        voterCustomerId: context.customer?.id ?? null,
        viewerKey: ownerKey,
        type: input.type,
        createdAt: now,
        updatedAt: now,
      };
      store.state.reviewContentVotes.push(vote);
      content.metrics[`${input.type.toLowerCase()}Count`] += 1;
    } else if (vote.type !== input.type) {
      vote.type = input.type;
      vote.updatedAt = now;
      content.metrics[`${input.type.toLowerCase()}Count`] += 1;
    }
    content.viewerEngagement.vote = input.type;
    content.metrics.updatedAt = now;
    store.reindex();
    return { content, vote, userErrors: [] };
  },

  reviewContentVoteRemove: (_, { input }, context) => {
    const content = findContent(store, input.contentId);
    if (!content)
      return {
        content: null,
        removedVoteId: null,
        userErrors: [
          reviewError(
            'CONTENT_NOT_FOUND',
            'The review content is unavailable.'
          ),
        ],
      };
    const ownerKey = contentOwnerKey(context);
    const vote = store.state.reviewContentVotes.find(
      (candidate) =>
        candidate.contentId === content.id && candidate.viewerKey === ownerKey
    );
    if (!vote) return { content, removedVoteId: null, userErrors: [] };
    store.state.reviewContentVotes = store.state.reviewContentVotes.filter(
      ({ id }) => id !== vote.id
    );
    content.metrics[`${vote.type.toLowerCase()}Count`] = Math.max(
      0,
      content.metrics[`${vote.type.toLowerCase()}Count`] - 1
    );
    content.viewerEngagement.vote = null;
    content.metrics.updatedAt = store.now();
    store.reindex();
    return { content, removedVoteId: vote.id, userErrors: [] };
  },

  reviewContentReportCreate: (_, { input }, context) => {
    const content = findContent(store, input.contentId);
    if (!content)
      return {
        content: null,
        report: null,
        userErrors: [
          reviewError(
            'CONTENT_NOT_FOUND',
            'The review content is unavailable.'
          ),
        ],
      };
    if (input.reason === 'OTHER' && !input.details?.trim()) {
      return {
        content: null,
        report: null,
        userErrors: [
          reviewError(
            'DETAILS_REQUIRED',
            'Details are required for the OTHER reason.',
            ['details']
          ),
        ],
      };
    }
    const ownerKey = contentOwnerKey(context);
    let report = store.state.reviewContentReports.find(
      (candidate) =>
        candidate.contentId === content.id &&
        candidate.viewerKey === ownerKey &&
        candidate.status === 'OPEN'
    );
    if (!report) {
      const now = store.now();
      report = {
        id: gid(
          'ReviewContentReport',
          `runtime-${store.next('review-report')}`
        ),
        contentId: content.id,
        reporterCustomerId: context.customer?.id ?? null,
        viewerKey: ownerKey,
        reason: input.reason,
        details: input.details ?? null,
        status: 'OPEN',
        resolvedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      store.state.reviewContentReports.push(report);
    }
    content.viewerEngagement.hasReported = true;
    store.reindex();
    return { content, report, userErrors: [] };
  },
});
