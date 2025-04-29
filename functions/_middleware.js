// File: functions/_middleware.js
export async function onRequest(context) {
  // Get the original response from the static asset
  const response = await context.next();
  
  // Only process HTML content
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  
  // Get the HTML content
  const originalHtml = await response.text();
  
  // Get current server timestamp
  const serverTime = Date.now();
  
  // Calculate countdown for metadata
  const targetDate = 1760511599999; // October 14, 2025, 23:59:59 UTC
  const difference = targetDate - serverTime;
  
  let countdownText;
  if (difference <= 0) {
    countdownText = "Windows 10 has reached end of life!";
  } else {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    countdownText = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  }
  
  // Create metadata for embeds
  const pageTitle = `Windows 10 End of Life: ${countdownText}`;
  const pageDescription = `Windows 10 support ends on October 14, 2025. Time remaining: ${countdownText}`;
  
  // Inject the server timestamp into the HTML
  let modifiedHtml = originalHtml.replace(
    'SERVER_TIMESTAMP_PLACEHOLDER',
    serverTime.toString()
  );
  
  // Update title for embeds
  modifiedHtml = modifiedHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${pageTitle}</title>`
  );
  
  // Add meta tags for embeds
  modifiedHtml = modifiedHtml.replace(
    '</head>',
    `  <!-- Meta tags for social media embeds -->
    <meta name="description" content="${pageDescription}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
</head>`
  );
  
  // Return the modified HTML
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
