# Installation Instructions: Google Vertex AI / Cloud Run

Follow these instructions to deploy the Elyria Matrix RFx Engine to Google Cloud using Vertex AI capabilities for enterprise document processing.

## Prerequisites
1.  **Google Cloud SDK (gcloud)**: Install and initialize the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2.  **Docker**: Ensure Docker is installed and running on your machine.
3.  **Permissions**: Ensure your account has `Owner` or `Editor` roles + `Vertex AI Administrator` on the target project.

## Step 1: Enable APIs
Open your terminal and run the following to enable the necessary Google Cloud APIs:
```bash
gcloud services enable \
    compute.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    aiplatform.googleapis.com \
    firestore.googleapis.com
```

## Step 2: Prepare the Container
This application is designed to run as a full-stack Node.js application. We will containerize it and deploy to Cloud Run.

1.  **Create a Dockerfile** (if not present) in the root:
    ```dockerfile
    # Use Node 18
    FROM node:18-slim
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    EXPOSE 3000
    CMD ["npm", "start"]
    ```
2.  **Declare Environment Variables**: Ensure your `.env` contains the required `GEMINI_API_KEY` (which you can get from Google AI Studio / Vertex AI).

## Step 3: Build and Push to Artifact Registry
1.  Create a repository for your images:
    ```bash
    gcloud artifacts repositories create elyria-repo \
        --repository-format=docker \
        --location=us-central1
    ```
2.  Build and push using Cloud Build (Simplest method):
    ```bash
    gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/elyria-repo/elyria-app .
    ```
    *(Replace `[PROJECT_ID]` with your actual Google Cloud Project ID)*

## Step 4: Deploy to Cloud Run
1.  Deploy the image:
    ```bash
    gcloud run deploy elyria-app \
        --image us-central1-docker.pkg.dev/[PROJECT_ID]/elyria-repo/elyria-app \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --port 3000 \
        --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=[YOUR_API_KEY]"
    ```

## Step 5: Configure Vertex AI Grounding
Elyria uses Vertex AI (Gemini) for document analysis. To ensure the best "Grounding" experience:
1.  Navigate to the **Vertex AI** section in Google Cloud Console.
2.  Go to **Generative AI Studio** > **Language**.
3.  The application uses the `gemini-3.1-pro-preview` model via API. Ensure your Service Account for Cloud Run has the `Vertex AI User` role.

## Step 6: Connectivity
1.  Copy the URL provided by Cloud Run.
2.  If you are using Firestore (which is recommended for Elyria), ensure you have initialized a Firestore database in the same project.
3.  Update your `firebase-applet-config.json` with the project details so the client-side code can connect to the shared database.
