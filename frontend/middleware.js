const BOT_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'WhatsApp',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
];

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);

  // Only intercept /blog/:blog_id paths for social media crawlers
  const blogMatch = url.pathname.match(/^\/blog\/(.+)$/);
  if (!blogMatch) return;

  const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()));
  if (!isBot) return;

  const blogId = blogMatch[1];
  const apiDomain = process.env.VITE_SERVER_DOMAIN;

  if (!apiDomain) return;

  // Rewrite bot requests to the server OG endpoint
  return Response.redirect(`${apiDomain}/og/blog/${blogId}`, 302);
}

export const config = {
  matcher: '/blog/:path*',
};
