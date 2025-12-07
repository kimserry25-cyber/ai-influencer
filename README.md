# InfluencerAI

A virtual influencer generator using Google Gemini API.

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root directory and add your Gemini API Key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Deploy to Vercel

1.  Push this repository to GitHub.
2.  Go to the [Vercel Dashboard](https://vercel.com/) and click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  In the **"Configure Project"** screen:
    *   **Framework Preset**: Vite
    *   **Root Directory**: ./ (default)
    *   **Environment Variables**:
        *   Key: `API_KEY`
        *   Value: `Your Actual Gemini API Key`
5.  Click **Deploy**.
