---
title: "Durable Functions: How to perform Sentiment Analysis"
slug: "azure-ai-language-sentiment-analysis-with-durable-functions"
date: 2024-02-12T19:54:42
author: "editor"
excerpt: "How to perform Sentiment Analysis with Durable Functions: Implementing Sentiment Analysis with Azure AI Language and Durable Functions"
categories: ["Azure"]
tags: ["AI Language", "Azure", "Durable Functions", "PaaS", "Python", "Serverless", "Text Analytics"]
featuredImage: "/wp-content/uploads/2024/02/durable-ai-arch-2.png"
originalUrl: "https://archive.cloudblogger.eu/2024/02/12/azure-ai-language-sentiment-analysis-with-durable-functions/"
wordpressId: 1426
---

## Implementing Sentiment Analysis with Azure AI Language and Durable Functions

![Implementing Sentiment Analysis with Azure AI Language and Durable Functions](/wp-content/uploads/2024/02/durable-ai2-1024x553.png)

### Intro

In today's exploration, we delve into the world of Durable Functions, an innovative orchestration mechanism that elevates our coding experience. Durable Functions stand out by offering granular control over the execution steps, seamlessly integrating within the Azure Functions framework. This unique approach not only maintains the serverless nature of Azure Functions but also adds remarkable flexibility. It allows us to craft multifaceted applications, each capable of performing a variety of tasks under the expansive Azure Functions umbrella.

Originating from the [Durable Task Framework](https://github.com/Azure/durabletask), widely used by Microsoft and various organizations for automating critical processes, Durable Functions represent the next step in serverless computing. They bring the power and efficiency of the Durable Task Framework into the serverless realm of Azure Functions, offering an ideal solution for complex, mission-critical workflows. Alongside with Azure Functions we are going to build a Python Flask Web Application where users enter text and we get a Sentiment Analysis from Azure AI Language Text Analytics, while results are stored into Azure Table Storage.

### Requirements

For this workshop we need an Azure Subscription and we are using VSCode with Azure Functions Core Tools. Since each post of CloudBlogger is also pushed to GitHub the IaC or deployment scripts will also be found there! We are building an Azure Web App to host our Flask UI, Azure Language AI with Python SDK for the sentiment analysis, Azure Durable Functions and Storage Account. The Durable Functions have an HTTP Trigger, the Orchestrator and two Activity Functions. The first activity is the API that sends data to the Language Endpoint and the second stores the results into Azure Table Storage, where we can utilize later for analysis and so on.

### Build

Let's explore our elements from the UI to each Function. Our UI is a Flask Web App and we have the index.html served from our app.py program:

```
from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')  # HTML file with input form

@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.form['text']
    print("Received text:", text)

    function_url = os.environ.get('FUNCTION_URL')
    if not function_url:
        return jsonify({'error': 'Function URL is not configured'})

    # Trigger the Azure Function
    response = requests.post(function_url, json={'text': text})
    if response.status_code != 202:
        return jsonify({'error': 'Failed to start the analysis'})

    # Get the status query URL
    status_query_url = response.headers['Location']

    # Poll the status endpoint
    while True:
        status_response = requests.get(status_query_url)
        status_response_json = status_response.json()

        if status_response_json['runtimeStatus'] in ['Completed']:
            # The result should be directly in the output
            results = status_response_json.get('output', [])
            return jsonify({'results': results})
        elif status_response_json['runtimeStatus'] in ['Failed', 'Terminated']:
            return jsonify({'error': 'Analysis failed or terminated'})
        # Implement a delay here if necessary

if __name__ == '__main__':
    app.run(debug=True)
```

```
<!DOCTYPE html>
<html>
<head>
    <title>Sentiment Analysis App</title>
    <link rel="stylesheet" type="text/css" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <img src="{{ url_for('static', filename='logo.png') }}" class="icon" alt="App Icon">
    <h2>Sentiment Analysis</h2>
    <form id="textForm">
        <textarea name="text" placeholder="Enter text here..."></textarea>
        <button type="submit">Analyze</button>
    </form>
    <div id="result"></div>
    <script>
        document.getElementById('textForm').onsubmit = async function(e) {
            e.preventDefault();
            let formData = new FormData(this);
            let response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            let resultData = await response.json();
    
            // Accessing the 'results' object from the response
            let results = resultData.results;
            if (results) {
                // Constructing the display text with sentiment and confidence scores
                let displayText = `Document: ${results.document}\nSentiment: ${results.overall_sentiment}\n`;
                displayText += `Confidence - Positive: ${results.confidence_positive}, Neutral: ${results.confidence_neutral}, Negative: ${results.confidence_negative}`;
                document.getElementById('result').innerText = displayText;
            } else {
                // Handling cases where results may not be present
                document.getElementById('result').innerText = 'No results to display';
            }
        };
    </script>
    
    

</body>
</html>
```

*The highlighted area in the index file shows our Java Script that sends the text to the API Endpoint and displays the returned Sentiment Analysis results.*

#### Durable Functions

There are currently four durable function types in Azure Functions: **activity**, **orchestrator**, **entity**, and **client**. In our deployment we are using:

- **Function 1 - HTTP Trigger (Client-Starter Function)**: Receives text input from the frontend and starts the orchestrator.
- **Function 2 - Orchestrator Function**: Orchestrates the sentiment analysis workflow.
- **Function 3 - Activity Function**: Calls Azure Cognitive Services Text Analytics API to analyze sentiment.
- **Function 4 - Activity Function**: Stores results into Azure Table Storage.

*Our flow is clearly depicted in the following graphic:*

![](/wp-content/uploads/2024/02/diagram-1024x408.png)

And here is the code for each Durable Function, starting with the HTTP Trigger:

```
# HTTP Trigger - The Client\Starter Function listener
import logging
import azure.functions as func
import azure.durable_functions as df

async def main(req: func.HttpRequest, starter: str) -> func.HttpResponse:
    client = df.DurableOrchestrationClient(starter)
    text = req.params.get('text')
    if not text:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            text = req_body.get('text')
    
    if text:
        instance_id = await client.start_new("SentimentOrchestrator", None, text)
        logging.info(f"Started orchestration with ID = '{instance_id}'.")
        return client.create_check_status_response(req, instance_id)
    else:
        return func.HttpResponse(
            "Please pass the text to analyze in the request body",
            status_code=400
        )
```

Following the Orchestrator:

```
# Orchestrator Function
import azure.durable_functions as df

def orchestrator_function(context: df.DurableOrchestrationContext):
    document = context.get_input()  # Treat input as a single document
    result = yield context.call_activity("AnalyzeSentiment", document)
    # Call the function to store the result in Azure Table Storage
    yield context.call_activity("StoreInTableStorage", result)
    return result

main = df.Orchestrator.create(orchestrator_function)
```

The Orchestrator is firing the following Activity functions, the Sentiment Analysis call and the results stored to Azure Table Storage:

```
# Activity - Sentiment Analysis
import os
import requests
from azure.core.credentials import AzureKeyCredential
from azure.ai.textanalytics import TextAnalyticsClient

def main(document: str) -> dict:
    endpoint = os.environ["TEXT_ANALYTICS_ENDPOINT"]
    key = os.environ["TEXT_ANALYTICS_KEY"]

    text_analytics_client = TextAnalyticsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

    response = text_analytics_client.analyze_sentiment([document], show_opinion_mining=False)
    doc = next(iter(response))

    if not doc.is_error:
        simplified_result = {
            "overall_sentiment": doc.sentiment,
            "confidence_positive": doc.confidence_scores.positive,
            "confidence_neutral": doc.confidence_scores.neutral,
            "confidence_negative": doc.confidence_scores.negative,
            "document": document
        }
        return simplified_result
    else:
        return {"error": "Sentiment analysis failed"}
```

```
# Activity - Results to Table Storage 
from azure.data.tables import TableServiceClient
import os
import json
from datetime import datetime

def main(results: dict) -> str:
    connection_string = os.environ['AZURE_TABLE_STORAGE_CONNECTION_STRING']
    table_name = 'SentimentAnalysisResults'

    table_service = TableServiceClient.from_connection_string(connection_string)
    table_client = table_service.get_table_client(table_name)

    # Prepare the entity with a unique RowKey using timestamp
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
    row_key = f"{results.get('document')}-{timestamp}"

    entity = {
        "PartitionKey": "SentimentAnalysis",
        "RowKey": row_key,
        "Document": results.get('document'),
        "Sentiment": results.get('overall_sentiment'),
        "Confidence": results.get('confidence')
    }

    # Insert the entity
    table_client.create_entity(entity=entity)

    return "Result stored in Azure Table Storage"
```

Our Serverless Workshop is almost ready ! We need to carefully add the relevant configuration values for each resource :

- Azure Web Application : FUNCTION\_URL, the HTTP Start URL from the Durable Functions resource.
- Durable Functions : TEXT\_ANALYTICS\_ENDPOINT, the Azure AI Language endpoint.
- Durable Functions : TEXT\_ANALYTICS\_KEY, the Azure AI Language key.
- Durable Functions : AZURE\_TABLE\_STORAGE\_CONNECTION\_STRING, the connection string for the Storage Account.

We need to create a Storage Account and a Table , an Azure Web Application with an App Service Plan, an Azure Durable Functions resource and either a Cognitive Services Multi-Service account or an Azure AI Language resource.

From VSCode create a new Durable Functions Project and four Durable Functions, each one as mentioned above. Make sure to add the correct names on the bindings for example in the Store In Table Storage Function we have:

```
def main(results: dict) -> str:
    connection_string = os.environ['AZURE_TABLE_STORAGE_CONNECTION_STRING']
    table_name = 'SentimentAnalysisResults'.......
```

So in the function.json binding file make sure to match the name given in our code:

```
{
  "scriptFile": "__init__.py",
  "bindings": [
    {
      "name": "results",
      "type": "activityTrigger",
      "direction": "in"
    }
  ]
}
```

Add a System Assigned Managed Identity to the Function Resource and add the Storage Table Data Contributor role. Create the Web Application and Deploy the app.py to the Web App, make sure you have selected the Directory where your app.py file exists.

![](/wp-content/uploads/2024/02/webappdeploy-1024x430.png)

Deploy to Web App

Add the Configuration setting we described and hit the URL, you will be presented with the UI:

![](/wp-content/uploads/2024/02/web.jpg)

Sentiment Analysis Web App

Let's break down the whole procedure in addition to the flow we have seen above:

**User Enters Text**: It all starts when a user types a sentence or paragraph into the text box on your web page (the UI).

**Form Submission to Flask App**:

When the user clicks the "Analyze" button, the text is sent from the web page to your Flask app. This happens via an HTTP POST request, triggered by the JavaScript code on your web page.

The Flask app, running on a server, receives this text.

**Flask App Invokes Azure Function**:

The Flask app then sends this text to an Azure Function. This is done by making another HTTP POST request, this time from the Flask app to the Azure Function's endpoint.

The Azure Function is a part of Azure Durable Functions, which are special types of Azure Functions designed for more complex workflows.

**Processing in Azure Durable Function**:

The text first arrives at the Orchestrator function in your Azure Durable Function setup. This Orchestrator function coordinates what happens to the text next.

The Orchestrator function calls another function, typically known as an Activity function, specifically designed for sentiment analysis. This Activity function might use Azure Cognitive Services to analyze the sentiment of the text.

Once the Activity function completes the sentiment analysis, it returns the results (like whether the sentiment is positive, neutral, or negative, and confidence scores) back to the Orchestrator function.

**Storing Results (Optional)**:

If you've set it up, the Orchestrator function might then call another Activity function to store these results in Azure Table Storage for later use.

**Results Sent Back to Flask App**:

After processing (and optionally storing) the results, the Orchestrator function sends these results back to your Flask app.

**Flask App Responds to Web Page**:

Your Flask app receives the sentiment analysis results and sends them back to the web page as a response to the initial HTTP POST request.

**Displaying Results on the UI**:

Finally, the JavaScript code on your web page receives this response and updates the web page to display the sentiment analysis results to the user.

![](/wp-content/uploads/2024/02/web2.jpg)

Sentiment Analysis results

And here is the Data Stored in our Table:

![](/wp-content/uploads/2024/02/table1-1024x179.jpg)

Azure Table Storage - Sentiment Analysis Data

As you may understand we can expand the Solution to further analyze our Data, add Visualizations and ultimately provide an Enterprise grade Solution where Durable Functions is the heart of it!

Our Architecture is simple but powerful and extendable:

![](/wp-content/uploads/2024/02/durable-ai-arch-2-1024x576.png)

Durable Functions-Sentiment Analysis

### Closing

Modern solutions are bound to innovative yet powerful offerings and Azure Durable Functions can integrate seamlessly with every Azure service, even better, orchestrate our code with ease, providing fast delivery, scalability and security. Today we explored Azure AI Language with Text Analytics and Sentiment Analysis and Durable Functions helped us deliver a multipurpose solution with Azure Python SDK. Integration is key if we want to create robust and modern solutions without having to write hundreds of lines of code and Azure is leading the way with cutting edge, serverless PaaS offerings for us to keep building!

#### References

- [Azure AI Language](https://learn.microsoft.com/en-us/azure/ai-services/language-service/overview)
- [Text Analytics Python SDK](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-textanalytics-readme?view=azure-python)
- [AKS and Sentiment Analysis](https://www.cloudblogger.eu/2024/05/17/azure-ai-cloud-native-on-aks/ "AKS Sentiment Analysis")
- [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview?tabs=in-process%252Cnodejs-v3%252Cv1-model)
- [Create Python Durable Function](https://learn.microsoft.com/en-us/azure/azure-functions/durable/quickstart-python-vscode?tabs=windows%2Cazure-cli-set-indexing-flag&pivots=python-mode-configuration)
- [Video: Serverless Functions](https://learn.microsoft.com/en-us/events/dotnetconf-net-conf-2019/b206)
