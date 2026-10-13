# Apollo mutation cache strategies

Every mutation domain uses an explicit cache strategy:

| Domain | Strategy |
| --- | --- |
| Cart create/add/update/remove/replace/clear | Mutation responses include the complete normalized `Checkout` entity. Apollo replaces entity fields by `__typename + id`; the Zustand cart store supplies optimistic UI and rollback. |
| Checkout addresses, recipients, delivery, payment, promo, identity and note | Each mutation returns the complete `Checkout`, so normalized entity replacement updates the active checkout query. |
| Checkout submit | The server response is consumed as the terminal order result; no connection insertion is required. |
| Review create | Evict `Product.reviews` after success. A submitted review may require moderation, so it is not inserted optimistically into the visible connection. |
| Review vote/report | Responses contain the review content `id` plus changed `metrics` or `viewerEngagement`; Apollo updates the normalized review entity. |
| Session sign-in/sign-up/sign-out | Session handlers update or clear the session store and cookie. Subsequent session reads use `network-only`; no stale normalized session entity is retained. |
| Box builder cleanup | Evict affected checkout entities and run garbage collection after the domain store has been cleared. |

Optimistic responses are only used when the complete normalization identity and
all UI-required fields are available. Cart uses its existing typed Zustand
optimistic operations because they also provide deterministic rollback.
