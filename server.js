// File: functions/_middleware.js
// This file intercepts requests and modifies the response

export async function onRequest(context) {
  // Get the original response from the static asset
  const response = await context.next();
  
  // Only process HTML content
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }
  
  // Get the current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
  
  // Page title and description with current time
  const pageTitle = `Current Time: ${formattedDate}`;
  const pageDescription = `Live timestamp: ${formattedDate}`;
  
  // Get the HTML content
  const originalHtml = await response.text();
  
  // Inject meta tags with current time
  const modifiedHtml = originalHtml
    // Replace or add title
    .replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`)
    // Replace or add meta tags
    .replace('</head>', `
    <!-- Twitter Card meta tags -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${pageDescription}" />
    
    <!-- Open Graph meta tags for Discord and other platforms -->
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDescription}" />
    <meta property="og:type" content="website" />
    
    <!-- Regular meta description -->
    <meta name="description" content="${pageDescription}" />
    </head>`);
  
  // Return the modified HTML with the same status and headers
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
