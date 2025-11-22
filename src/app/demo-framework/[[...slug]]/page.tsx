// Import init to ensure templates are registered
import '../init';

// Re-export the page from the framework
export { default, generateMetadata } from '@shopana/next-ecommerce-core/app/[[...slug]]/page';
