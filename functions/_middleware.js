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
  
  // Calculate the current countdown for metadata only
  // This won't affect the main page functionality
  const targetDate = new Date('2025-10-14T07:00:00.000Z').getTime();
  const currentTime = Date.now();
  const difference = targetDate - currentTime;
  
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
  
  // Create metadata for embeds only
  const pageTitle = `Windows 10 End of Life: ${countdownText}`;
  const pageDescription = `Windows 10 support ends on October 14, 2025. Time remaining: ${countdownText}`;
  
  // Only modify the metadata, leave the rest of the page as is
  let modifiedHtml = originalHtml;
  
  // Replace title for embeds
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
  
  // Return the modified HTML with metadata added but main functionality unchanged
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
