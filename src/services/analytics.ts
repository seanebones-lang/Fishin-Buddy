import PostHog from 'posthog-react-native';
PostHog.init('phc_...', { host: 'https://app.posthog.com' });
export const track = (event: string, props?: any) => PostHog.capture(event, props);