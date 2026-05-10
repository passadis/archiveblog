---
title: "GraphQL API: Unlimited flexibility for your AI applications"
slug: "graphql-api-unlimited-flexibility-for-your-ai-applications"
date: 2024-12-16T04:06:20
author: "editor"
excerpt: "A practical guide on how to create a GraphQL APi Endpoint and utilize it in a real world scenario with Azure AI Speech transcriptions,"
categories: ["Azure"]
tags: ["API", "Azure", "Azure AI", "Azure Speech Service", "GraphQL", "SpeechTotext"]
featuredImage: "/wp-content/uploads/2024/12/gspeech3.jpg"
originalUrl: "https://archive.cloudblogger.eu/2024/12/16/graphql-api-unlimited-flexibility-for-your-ai-applications/"
wordpressId: 3010
---

## Building a Modern Speech-to-Text Solution with GraphQL and Azure AI Speech

![](/wp-content/uploads/2024/12/gspeech2-1024x1024.jpg)

### Intro

Have you ever wondered how to build a modern AI enhanced web application that handles audio transcription while keeping your codebase clean and maintainable? In this post, I'll walk you through how we combined the power of GraphQL with Azure's AI services to create a seamless audio transcription solution. Let's dive in!

### The Challenge

In today's world, converting speech to text is becoming increasingly important for accessibility, content creation, and data processing. But building a robust solution that handles file uploads, processes audio, and manages transcriptions can be complex. Traditional REST APIs often require multiple endpoints, leading to increased complexity and potential maintenance headaches. That's where **GraphQL** comes in.

### What is GraphQL

***GraphQL** is an open-source data query and manipulation language for APIs, and a runtime for executing those queries with your existing data. It was developed by Facebook in 2012 and publicly released in 2015.*

To break that down formally:

- It's a query language specification that allows clients to request **exactly** the data they need
- It's a type system that helps **describe your API's data model** and capabilities
- It's a **runtime engine** that processes and validates queries against your **schema**
- It provides a **single endpoint** to interact with **multiple data sources** and services

In technical documentation, **GraphQL** is officially described as: "*A query language for your API and a server-side runtime for executing queries by using a type system you define for your data.*"

### Why GraphQL?

GraphQL has revolutionized how we think about API design. Instead of dealing with multiple endpoints for different operations, we get a single, powerful endpoint that handles everything. This is particularly valuable when dealing with complex workflows like audio file processing and transcription.

Here's what makes GraphQL perfect for our use case:

- Single endpoint for all operations (uploads, queries, mutations)
- Type-safe API contracts
- Flexible data fetching
- Real-time updates through subscriptions
- Built-in documentation and introspection

### Solution Architecture

Our solution architecture centers around a modern web application built with a powerful combination of technologies. On the frontend, we utilize React to create a dynamic and responsive user interface, enhanced by Apollo Client for seamless GraphQL integration and Fluent UI for a polished and visually appealing design.

The backend is powered by Apollo Server, providing our GraphQL API. To handle the core functionality of audio processing, we leverage Azure Speech-to-Text for AI-driven transcription. File management is streamlined with Azure Blob Storage, while data persistence is ensured through Azure Cosmos DB. Finally, we prioritize security by using Azure Key Vault for the secure management of sensitive information. This architecture allows us to deliver a robust and efficient application for audio processing and transcription.

#### Flow-Chart

![GraphQL with Azure Speech solution flowchart](/wp-content/uploads/2024/12/dataflow-828x1024.png)

GraphQL API Flow Chart

### Key Technologies

#### Frontend Stack

- React for a dynamic user interface
- Apollo Client for GraphQL integration
- Fluent UI for a polished look and feel

#### Backend Stack

- Apollo Server for our GraphQL API
- Azure Speech-to-Text for AI-powered transcription
- Azure Blob Storage for file management
- Azure Cosmos DB for data persistence
- Azure Key Vault for secure secret management

![Architecture - GraphQL & Azure](/wp-content/uploads/2024/12/architecturegr-1-1024x576.png)

Architecture - GraphQL & Azure

### GraphQL Schema and Resolvers: The Foundation

At its core, GraphQL requires two fundamental components to function: a Schema Definition Language (SDL) and Resolvers.

#### Schema Definition Language (SDL)

The schema is your API's contract - it defines the types, queries, and mutations available. Here's an example:

```
import { gql } from "apollo-server";

const typeDefs = gql`
  scalar Upload

  type UploadResponse {
    success: Boolean!
    message: String!
  }

  type Transcription {
    id: ID!
    filename: String!
    transcription: String!
    fileUrl: String!
  }

  type Query {
    hello: String
    listTranscriptions: [Transcription!]
    getTranscription(id: ID!): Transcription
  }

  type Mutation {
    uploadFile(file: Upload!): UploadResponse!
  }
`;

export default typeDefs;
```

#### Resolvers

Resolvers are functions that determine how the data for each field in your schema is fetched or computed. They're the implementation behind your schema. Here's a typical resolver structure:

```
import axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import * as fs from "fs";
import FormData from "form-data";
import { GraphQLUpload } from "graphql-upload";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

// Key Vault setup
const vaultName = process.env.AZURE_KEY_VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const credential = new DefaultAzureCredential({
  managedIdentityClientId: process.env.MANAGED_IDENTITY_CLIENT_ID,
});
const secretClient = new SecretClient(vaultUrl, credential);

async function getSecret(secretName) {
  try {
    const secret = await secretClient.getSecret(secretName);
    console.log(`Successfully retrieved secret: ${secretName}`);
    return secret.value;
  } catch (error) {
    console.error(`Error fetching secret "${secretName}":`, error.message);
    throw new Error(`Failed to fetch secret: ${secretName}`);
  }
}

// Cosmos DB setup
const databaseName = "TranscriptionDB";
const containerName = "Transcriptions";

let cosmosContainer;

async function initCosmosDb() {
  const connectionString = await getSecret("COSMOSCONNECTIONSTRING");
  const client = new CosmosClient(connectionString);
  const database = client.database(databaseName);
  cosmosContainer = database.container(containerName);
  console.log(`Connected to Cosmos DB: ${databaseName}/${containerName}`);
}

// Initialize Cosmos DB connection
initCosmosDb();

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    hello: () => "Hello from Azure Backend!",

    // List all stored transcriptions
    listTranscriptions: async () => {
      try {
        const { resources } = await cosmosContainer.items.query("SELECT c.id, c.filename FROM c").fetchAll();
        return resources;
      } catch (error) {
        console.error("Error fetching transcriptions:", error.message);
        throw new Error("Could not fetch transcriptions.");
      }
    },

    // Fetch transcription details by ID
    getTranscription: async (parent, { id }) => {
      try {
        const { resource } = await cosmosContainer.item(id, id).read();
        return resource;
      } catch (error) {
        console.error(`Error fetching transcription with ID ${id}:`, error.message);
        throw new Error(`Could not fetch transcription with ID ${id}.`);
      }
    },
  },
  Mutation: {
    uploadFile: async (parent, { file }) => {
      const { createReadStream, filename } = await file;
      const id = uuidv4();
      const filePath = `/tmp/${id}-${filename}`;

      try {
        console.log("---- STARTING FILE UPLOAD ----");
        console.log(`Original filename: ${filename}`);
        console.log(`Temporary file path: ${filePath}`);

        // Save the uploaded file to /tmp
        const stream = createReadStream();
        const writeStream = fs.createWriteStream(filePath);
        await pipelineAsync(stream, writeStream);
        console.log("File saved successfully to temporary storage.");

        // Fetch secrets from Azure Key Vault
        console.log("Fetching secrets from Azure Key Vault...");
        const subscriptionKey = await getSecret("AZURESUBSCRIPTIONKEY");
        const endpoint = await getSecret("AZUREENDPOINT");
        const storageAccountUrl = await getSecret("AZURESTORAGEACCOUNTURL");
        const sasToken = await getSecret("AZURESASTOKEN");
        console.log("Storage Account URL and SAS token retrieved.");

        // Upload the WAV file to Azure Blob Storage
        console.log("Uploading file to Azure Blob Storage...");
        const blobServiceClient = new BlobServiceClient(`${storageAccountUrl}?${sasToken}`);
        const containerClient = blobServiceClient.getContainerClient("wav-files");
        const blockBlobClient = containerClient.getBlockBlobClient(`${id}-${filename}`);

        await blockBlobClient.uploadFile(filePath);
        console.log("File uploaded to Azure Blob Storage successfully.");

        const fileUrl = `${storageAccountUrl}/wav-files/${id}-${filename}`;
        console.log(`File URL: ${fileUrl}`);

        // Send transcription request to Azure
        console.log("Sending transcription request...");
        const form = new FormData();
        form.append("audio", fs.createReadStream(filePath));
        form.append(
          "definition",
          JSON.stringify({
            locales: ["en-US"],
            profanityFilterMode: "Masked",
            channels: [0, 1],
          })
        );

        const response = await axios.post(
          `${endpoint}/speechtotext/transcriptions:transcribe?api-version=2024-05-15-preview`,
          form,
          {
            headers: {
              ...form.getHeaders(),
              "Ocp-Apim-Subscription-Key": subscriptionKey,
            },
          }
        );

        console.log("Azure Speech API response received.");
        console.log("Response Data:", JSON.stringify(response.data, null, 2));

        // Extract transcription
        const combinedPhrases = response.data?.combinedPhrases;
        if (!combinedPhrases || combinedPhrases.length === 0) {
          throw new Error("Transcription result not available in the response.");
        }

        const transcription = combinedPhrases.map((phrase) => phrase.text).join(" ");
        console.log("Transcription completed successfully.");

        // Store transcription in Cosmos DB
        await cosmosContainer.items.create({
          id,
          filename,
          transcription,
          fileUrl,
          createdAt: new Date().toISOString(),
        });
        console.log(`Transcription stored in Cosmos DB with ID: ${id}`);

        return {
          success: true,
          message: `Transcription: ${transcription}`,
        };
      } catch (error) {
        console.error("Error during transcription process:", error.response?.data || error.message);
        return {
          success: false,
          message: `Transcription failed: ${error.message}`,
        };
      } finally {
        try {
          fs.unlinkSync(filePath);
          console.log(`Temporary file deleted: ${filePath}`);
        } catch (cleanupError) {
          console.error(`Error cleaning up temporary file: ${cleanupError.message}`);
        }
        console.log("---- FILE UPLOAD PROCESS COMPLETED ----");
      }
    },
  },
};

export default resolvers;
```

#### Server - Apollo

Finally the power behind all, the Apollo Server. We need to install with npm and in addition add the client to the frontend. It can easily integrate in our Javascript ExpressJS:

```
import { ApolloServer } from "apollo-server-express";
import express from "express";
import cors from "cors"; // Add CORS middleware
import { graphqlUploadExpress } from "graphql-upload";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";

const startServer = async () => {
  const app = express();

  // Add graphql-upload middleware
  app.use(graphqlUploadExpress());

  // Configure CORS middleware
  app.use(
    cors({
      origin: "https://<frontend>.azurewebsites.net", // Allow only the frontend origin
      credentials: true, // Allow cookies and authentication headers
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
  });

  await server.start();
  server.applyMiddleware({ app, cors: false }); // Disable Apollo's CORS to rely on Express

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server ready at http://0.0.0.0:${PORT}${server.graphqlPath}`)
  );
};

startServer();
```

### Getting Started

*Want to try it yourself? Check out our [GitHub repository](https://github.com/passadis/graphql-aispeech "GitHub Repo") for:*

- Complete source code
- Deployment instructions
- Configuration guides
- API documentation

### Conclusion

This project demonstrates the powerful combination of GraphQL and Azure AI services, showcasing how modern web applications can handle complex audio processing workflows with elegance and efficiency. By leveraging GraphQL's flexible data fetching capabilities alongside Azure's robust cloud infrastructure, we've created a scalable solution that streamlines the audio transcription process from upload to delivery. The integration of Apollo Server provides a clean, type-safe API layer that simplifies client-server communication, while Azure AI Speech Services ensures accurate transcription results. This architecture not only delivers a superior developer experience but also provides end-users with a seamless, professional-grade audio transcription service.

### References

- [GraphQL - Language API](https://graphql.org/ "GraphQL - Language API")
- [What is GraphQL for Azure?](https://learn.microsoft.com/azure/developer/javascript/graphql-developer-guide/?wt.mc_id=MVP_365598 "Azure & GraphQL")
- [Azure Key Vault secrets in JavaScript](https://learn.microsoft.com/azure/key-vault/secrets/javascript-developer-guide-get-started?tabs=developer-auth%2Caz-login-terminal-bash&toc=%2Fazure%2Fdeveloper%2Fjavascript%2Ftoc.json&bc=%2Fazure%2Fdeveloper%2Fjavascript%2Fbreadcrumb%2Ftoc.json?wt.mc_id=MVP_365598 "Azure Key Vault secrets in JavaScript")
- [Azure AI Speech](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/overview?wt.mc_id=MVP_365598 "Azure AI Speech")
- [Fast transcription API](https://learn.microsoft.com/azure/ai-services/speech-service/fast-transcription-create?wt.mc_id=MVP_365598 "Fast transcription API")
- [CloudBlogger - MultiAgent Speech](https://www.cloudblogger.eu/2024/03/16/azure-text-to-speech-with-container-apps/)

![](/wp-content/uploads/2024/12/gspeech22-1024x748.jpg)
