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
  
  // Add meta tags for SEO without changing the actual countdown functionality
  const pageTitle = "RIP Windows 10 | Countdown to Windows 10's End of Life";
  const pageDescription = "Windows 10 reaches end of life on October 14, 2025. <t:1760425200:R> Track the exact time remaining.";
  
  // Modify the HTML by adding meta tags for SEO
  let modifiedHtml = originalHtml;
  
  // Keep the original title but add meta tags
  modifiedHtml = modifiedHtml.replace('</head>', `
    <!-- SEO meta tags -->
    <meta name="description" content="${pageDescription}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    </head>`);
  
  // Set the initial countdown value to a loading message that will be updated by the script
  // This preserves the original functionality without introducing any middleware-specific time calculation
  modifiedHtml = modifiedHtml.replace(
    /<div class="countdown" id="countdown">.*?<\/div>/i,
    `<div class="countdown" id="countdown">Loading countdown...</div>`
  );
  
  // Ensure the targetDate in the script is correct - it should match the original (October 14, 2025 at 07:00:00 UTC)
  modifiedHtml = modifiedHtml.replace(
    /const targetDate = new Date\('.*?'\)\.getTime\(\);/,
    `const targetDate = new Date('2025-10-14T07:00:00.000Z').getTime();`
  );
  
  // Return the modified HTML with the same status and headers
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
