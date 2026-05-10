---
title: "How to create Azure AI Assistants with Logic Apps"
slug: "azure-ai-assistants-with-logic-apps"
date: 2024-08-08T19:01:02
author: "editor"
excerpt: "Introduction to AI Automation with Azure OpenAI Assistants with Logic Apps. How to create AI Assistants with function calling using Azure Logic Apps"
categories: ["Azure"]
tags: ["automation", "Azure", "Azure AI", "Azure OpenAI", "Logic Apps"]
featuredImage: "/wp-content/uploads/2024/08/Designer-42.jpeg"
originalUrl: "https://archive.cloudblogger.eu/2024/08/08/azure-ai-assistants-with-logic-apps/"
wordpressId: 2618
---

# Introduction to AI Automation with Azure AI Assistants

![AI Assistants with Logic Apps](/wp-content/uploads/2024/08/main-1.png)

### Intro

Welcome to the future of automation! In the world of Azure, AI assistants are becoming your trusty sidekicks, ready to tackle the repetitive tasks that once consumed your valuable time. But what if we could make these assistants even smarter? In this post, we'll dive into the exciting realm of integrating Azure AI assistants with Logic Apps – Microsoft's powerful workflow automation tool. Get ready to discover how this dynamic duo can transform your workflows, freeing you up to focus on the big picture and truly innovative work.

### Azure OpenAI Assistants (preview)

Azure OpenAI Assistants (Preview) allows you to create AI assistants tailored to your needs through custom instructions and augmented by advanced tools like code interpreter, and custom functions. To accelerate and simplify the creation of intelligent applications, we can now enable the ability to call Logic Apps workflows through function calling in Azure OpenAI Assistants. The Assistants playground enumerates and lists all the workflows in your subscription that are eligible for function calling. Here are the requirements for these workflows:

**Schema**: The workflows you want to use for function calling should have a JSON schema describing the inputs and expected outputs. Using Logic Apps you can streamline and provide schema in the trigger, which would be automatically imported as a function definition.

**Consumption Logic Apps**: Currently supported **consumption workflows**.

**Request trigger**: Function calling requires a REST-based API. Logic Apps with a request trigger provides a REST endpoint. Therefore only workflows with a request trigger are supported for function calling.

### AI Automation

So apart from the Assistants API, which we will explore in another post, we know that we can Integrate Azure Logic Apps workflows! Isn't that amazing ? The road now is open for AI Automation and we are on the genesis of it, so let's explore it. We need an Azure Subscription and:

- Azure OpenAI in the [supported regions](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#assistants-preview). This demo is on Sweden Central.
- Logic Apps consumption Plan.

We will work in Azure OpenAI Studio and utilize the Playground. Our model deployment is GPT-4o.

The Assistants Playground offers the ability to create and save our Assistants, so we can start working and return later, open the Assistant and continue. We can find the System Message option and the three tools that enhance the Assistants with **Code Interpreter**, **Function Calling ( Including Logic Apps)** and **Files upload**. The following table describes the configuration elements of our Assistants:

| **Name** | **Description** |
| --- | --- |
| **Assistant name** | Your deployment name that is associated with a specific model. |
| **Instructions** | Instructions are similar to system messages this is where you give the model guidance about how it should behave and any context it should reference when generating a response. You can describe the assistant's personality, tell it what it should and shouldn't answer, and tell it how to format responses. You can also provide examples of the steps it should take when answering responses. |
| **Deployment** | This is where you set which model deployment to use with your assistant. |
| **Functions** | Create custom function definitions for the models to formulate API calls and structure data outputs based on your specifications |
| **Code interpreter** | Code interpreter provides access to a sandboxed Python environment that can be used to allow the model to test and execute code. |
| **Files** | You can upload up to 20 files, with a max file size of 512 MB to use with tools. You can upload up to 10,000 files using [AI Studio](https://learn.microsoft.com/en-us/azure/ai-services/openai/assistants-quickstart?pivots=programming-language-ai-studio). |

The Studio provides 2 sample Functions (Get Weather and Get Stock Price) to get an idea of the schema requirement in JSON for Function Calling. It is important to provide a clear message that makes the Assistant efficient and productive, with careful consideration since the longer the message the more Tokens are consumed.

#### Challenge #1 - Summarize Wordpress Blog Posts

How about providing a prompt to the Assistant with a URL instructing it to summarize a WordPress blog post? It is WordPress cause we have a unified API and we only need to change the URL. We can be more strict and narrow down the scope to a specific URL but let's see the flexibility of Logic Apps in a workflow.

We should start with the Logic App. We will generate the JSON schema directly from the Trigger which must be an HTTP request.

```
{
  "name": "__ALA__lgkapp002", // Remove this for the Logic App Trigger
  "description": "Fetch the latest post from a WordPress website,summarize it, and return the summary.",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The base URL of the WordPress site"
      },
      "post": {
        "type": "string",
        "description": "The page number"
      }
    },
    "required": [
      "url",
      "post"
    ]
  }
}
```

In the Designer this looks like this :

![Trigger in AI Assistants with Logic Apps](/wp-content/uploads/2024/08/logapp-0.png)

Step 1 - Trigger

As you can see the Schema is the same, excluding the name which is need only in the OpenAI Assistants. We will see this detail later on. Let's continue with the call to WordPress. An HTTP Rest API call:

![REST API Call in AI Assistants with Logic Apps](/wp-content/uploads/2024/08/logapp-1-1-1024x588.png)

Step 2 - HTTP Rest Call

And finally mandatory as it is, a Response action where we tell the Assistant that the Call was completed and bring some payload, in our case the body of the previous step:

![](/wp-content/uploads/2024/08/logapp-2.png)

Step 3 - Response

Now it is time to open our Azure OpenAI Studio and create a new Assistant. Remember the prerequisites we discussed earlier!

From the Assistants menu create a **[+New]** Assistant, give it a meaningful name, select the **deployment** and add a **System Message** . For our case it could be something like : *" You are a helpful Assistant that summarizes the WordPress Blog Posts the users request, using Functions. You can utilize code interpreter in a sandbox Environment for advanced analysis and tasks if needed "*. The Code interpreter here could be an overkill but we mention it to see the use of it ! Remember to save the Assistant. Now, in the Functions, do not select Logic Apps, rather stay on the custom box and add the code we presented earlier. The Assistant will understand that the Logic App named xxxx must be called, aka ["name": **"\_\_ALA\_\_lgkapp002**",] in the schema! In fact the Logic App is declared **by 2 underscores as prefix and 2 underscores as suffix**, with ALA inside and the name of the Logic App.

Let's give our Assistant a Prompt and see what happens:

![](/wp-content/uploads/2024/08/logapp-asstresp1-1024x452.png)

The Assistant responded pretty solidly with a meaningful summary of the post we asked for! Not bad at all for a Preview service.

#### Challenge #2 - Create Azure Virtual Machine based on preferences

*For the purpose of this task we have activated System Assigned managed identity to the Logic App we use, and a pre-provisioned Virtual Network with a subnet as well.* *The Logic App must reside in the same subscription as our Azure OpenAI resource.*

This is a more advanced request, but after all it translates to Logic Apps capabilities. Can we do it fast enough so the Assistant won't time out? Yes we do, by using the Azure Resource Manager latest API which indeed is lightning fast! The process must follow the same pattern, **Request - Actions - Response**. The request in our case must include such input so the Logic App can carry out the tasks. The Schema should include a **"name"** input which tells the Assistant which Logic App to look up:

```
{
    "name": "__ALA__assistkp02" //remove this for the Logic App Trigger
    "description": "Create an Azure VM based on the user input",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "The name of the VM"
            },
            "location": {
                "type": "string",
                "description": "The region of the VM"
            },
            "size": {
                "type": "string",
                "description": "The size of the VM"
            },
            "os": {
                "type": "string",
                "description": "The OS of the VM"
            }
        },
        "required": [
            "name",
            "location",
            "size",
            "os"
        ]
    }
}
```

And the actual screenshot from the Trigger, observe the absence of the "name" here:

![](/wp-content/uploads/2024/08/logapp-asst1.png)

Now as we have number of options, this method allows us to keep track of everything including the user's inputs like VM Name , VM Size, VM OS etc.. Of Course someone can expand this, since we use a default resource group and a default VNET and Subnet, but it's also configurable! So let's store the input into variables, we Initialize 5 variables. The name, the size, the location (which is preset for reduced complexity since we don't create a new VNET), and we break down the OS. Let's say the user selects Windows 10. The API expects an offer and a sku. So we take Windows 10 and create an offer variable, the same with OS we create an OS variable which is the expected sku:

```
if(equals(triggerBody()?['os'], 'Windows 10'), 'Windows-10', if(equals(triggerBody()?['os'], 'Windows 11'), 'Windows-11', 'default-offer'))
```

![](/wp-content/uploads/2024/08/logapp-asst2.png)

```
if(equals(triggerBody()?['os'], 'Windows 10'), 'win10-22h2-pro-g2', if(equals(triggerBody()?['os'], 'Windows 11'), 'win11-22h2-pro', 'default-sku'))
```

![](/wp-content/uploads/2024/08/logapp-asst2a.png)

As you understand this is narrowed to Windows Desktop only available choices, but we can expand the Logic App to catch most well know Operating Systems.

After the Variables all we have to do is create a Public IP (optional) , a Network Interface, and finally the VM. This is the most efficient way i could make, so we won't get complains from the API and it will complete it very fast ! Like 3 seconds fast ! The API calls are quite straightforward and everything is available in [Microsoft Documentation](https://learn.microsoft.com/en-us/rest/api/). Let's see an example for the Public IP:

![](/wp-content/uploads/2024/08/logapp-asst3a.png)

And the Create VM action with highlight to the storage profile - OS Image setup:

![](/wp-content/uploads/2024/08/logapp-asst3b.png)

Finally we need the response which can be as we like it to be. I am facilitating the Assistant's response with an additional Action "Get Virtual Machine" that allows us to include the properties which we add in the response body:

![](/wp-content/uploads/2024/08/logapp-01.png)

Let's make our request now, through the Assistants playground in Azure OpenAI Studio. Our prompt is quite clear: **"Create a new VM with size=Standard\_D4s\_v3, location=swedencentral, os=Windows 11, name=mynewvm02"**. Even if we don't add the parameters the Assistant will ask for them as we have set in the System Message.

![](/wp-content/uploads/2024/08/logapp-asstresp2-1024x440.png)

Pay attention to the limitation also . When we ask about the Public IP, the Assistant does not know it. Yet it informs us with a specific message, that makes sense and it is relevant to the whole operation. If we want to have a look of the time it took we will be amazed :

![](/wp-content/uploads/2024/08/logappsuccess1-1024x337.png)

The sum of the time starting from the user request till the response from the Assistant is around 10 seconds. We have a limit of 10 minutes for Function Calling execution so we can built a whole Infrastructure using just our prompts.

### Conclusion

In conclusion, this experiment highlights the powerful synergy between Azure AI Assistant's Function Calling capability and the automation potential of Logic Apps. By successfully tackling two distinct challenges, we've demonstrated how this combination can streamline workflows, boost efficiency, and unlock new possibilities for integrating intelligent decision-making into your business processes. Whether you're automating customer support interactions, managing data pipelines, or optimizing resource allocation, the integration of AI assistants and Logic Apps opens doors to a more intelligent and responsive future. We encourage you to explore these tools further and discover how they can revolutionize your own automation journey.

### References:

- [Getting started with Azure OpenAI Assistants (Preview)](https://learn.microsoft.com/azure/ai-services/openai/how-to/assistant/?wt.mc_id=MVP_365598?? "Getting started with Azure OpenAI Assistants (Preview)")
- [Call Azure Logic apps as functions using Azure OpenAI Assistants](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/assistants-logic-apps "Call Azure Logic apps as functions using Azure OpenAI Assistants")
- [Azure OpenAI Assistants function calling](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/assistant-functions?tabs=python)
- [Azure OpenAI Service models](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#assistants-preview)
- [Sample demo with Logic Apps](https://www.cloudblogger.eu/2024/01/14/azure-vm-auto-provisioning-web-app-with-logic-apps-approval-workflow/)
- [Azure Resource Manager - Rest Operations](https://learn.microsoft.com/en-us/rest/api/azure/?view=rest-compute-2024-03-02)

![azure AI Assistants with Logic Apps](/wp-content/uploads/2024/08/Designer-42.jpeg)
