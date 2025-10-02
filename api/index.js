// This is a Vercel Serverless Function which handles requests.
export default function handler(request, response) {
  // Set the response HTTP status code and content type
  response.status(200).setHeader('Content-Type', 'text/html');

  // The HTML content for the page
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>QuickChat - Coming Soon</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #f3f4f6;
          color: #111827;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .container {
          text-align: center;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        h1 {
          font-size: 2.25rem;
          font-weight: 700;
          color: #4f46e5; /* Indigo color from your project */
        }
        p {
          color: #4b5563;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>QuickChat</h1>
        <p>Our new platform for experts is launching soon.</p>
        <p>This is a temporary page for hosting tests.</p>
      </div>
    </body>
    </html>
  `;

  // Send the HTML content as the response
  response.send(htmlContent);
}