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
  
  // Calculate current countdown for embedding purposes
  const targetDate = new Date('2025-10-14T07:00:00.000Z').getTime();
  const currentTime = Date.now();
  
  // Calculate difference with a small adjustment to ensure correct day count
  // Add a buffer of 1000ms (1 second) to ensure day boundary calculations are correct
  const difference = targetDate - currentTime + 1000;
  
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
  
  // Add meta tags for embeds but leave the main content unchanged
  const pageTitle = `Windows 10 End of Life: ${countdownText}`;
  const pageDescription = `Windows 10 support ends on October 14, 2025. Time remaining: ${countdownText}`;
  
  // Only modify the meta tags, leave all other HTML unchanged
  let modifiedHtml = originalHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${pageTitle}</title>`
  );
  
  // Add OpenGraph and Twitter meta tags for embeds
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
  
  // Return the modified HTML with just the meta tags changed
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
