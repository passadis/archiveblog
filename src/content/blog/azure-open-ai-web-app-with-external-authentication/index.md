---
title: "Azure Open AI - Web App with External Authentication"
slug: "azure-open-ai-web-app-with-external-authentication"
date: 2023-07-29T01:13:49
author: "editor"
excerpt: "Create the one - click Web App for ChatGPT and add another Azure AD-Entra ID for Authentication"
categories: ["Azure"]
tags: ["Azure", "Azure Open AI", "ChatGPT", "Cognitive Services", "OpenAI", "webapp"]
featuredImage: "/wp-content/uploads/2023/07/OpenAI.jpeg"
originalUrl: "https://archive.cloudblogger.eu/2023/07/29/azure-open-ai-web-app-with-external-authentication/"
wordpressId: 920
---

## Create the one - click Web App for ChatGPT and add another Azure AD-Entra ID for Authentication

![](/wp-content/uploads/2023/07/oaiapp1.png)

Welcome to Cloudblogger !

Today we are looking into Azure OpenAI and the Web App provided for ChatGPT !

Suppose we have our OpenAI deployment ready and as we work with our models we can see that ChatGPT Deployments provide the ability to create a new Web App with a single click directly from the Playground :

![](/wp-content/uploads/2023/07/chatgpt-web-app-1024x528.png)

OpenAI ChatGPT

Well, that is great ! Deploy to a Web App directly and once we select our App Service Plan and Region, there it is in a matter of minutes!

![](/wp-content/uploads/2023/07/oai-2.jpg)

Just for your convenience you cannot start using it unless you add Authentication.

So lets add our Authentication from another Azure AD, since for whatever reason we do not want to touch the current one where our Subscription resides.

From the Azure portal, select the newly created Web App and go to Settings-Authentication

![](/wp-content/uploads/2023/07/web-app-authentication-1024x636.png)

Select Add Identity Provider - Microsoft and Customer :

![](/wp-content/uploads/2023/07/oai-iden-1.jpg)

Now, go to the actual Directory where your users want to utilize the Web App.

Create a new App Registration and a Secret, proceed to add a Web URI with this value and register your App :

```
https://<yourapp>.azurewebsites.net/.auth/login/aad/callback
```

![](/wp-content/uploads/2023/07/oai-iden2.jpg)

Users Tenant App Registration

Add also the base URI being **https://<appname>.azurewebsites.net**

![](/wp-content/uploads/2023/07/oai-iden7-1024x308.jpg)

Create a new secret and add the option to request a token from the Authorization Endpoint with ID Tokens:

![](/wp-content/uploads/2023/07/oai-iden5.jpg)

Implicit grant - ID Tokens

![](/wp-content/uploads/2023/07/oai-iden6.jpg)

Certificates and Secrets

Now that you have the App Registration details, return to the Web App and enter the required details, Application ID, Secret from the previous Directory App Registration and the issuer URL which should be as follows:

```
https://sts.windows.net/<OTHER-TENANT-ID>/v2.0
```

![](/wp-content/uploads/2023/07/oai-iden3.jpg)

OpenAI ChatGPT Web App Authentication Parameters

Proceed without adding nothing more and we are done !

We may have to wait up to 10 minutes, but i have seen it working in a couple of minutes !

It is better to start from the Azure OpenAI Studio , sometimes i have seen better response for the first time rather from the Browse button, but eventually it will work from both selections :

![](/wp-content/uploads/2023/07/oai-3.jpg)

![](/wp-content/uploads/2023/07/oai-4-1.jpg)

You will be presented with the familiar Azure AD\Entra ID directory login, and the first time you will have to accept consent from the Application.

That's it ! Ready to provide ChatGPT from Azure OpenAI to a secondary Azure Tenant via the Web App and the Identity Configurations we applied today for Web App Authentication!

![](/wp-content/uploads/2023/07/oai-app-1a.jpg)

OpenAI ChatGPT Web App Interface

### Final thoughts

OpenAI is a powerful tool that can be used to improve the functionality and user experience of web applications. By integrating OpenAI APIs and models into a web app, developers can add advanced natural language processing capabilities, language generation, and more. This can enhance the app's ability to understand and respond to user inputs, leading to a more personalized and intuitive experience. Additionally, OpenAI can help streamline backend processes, such as data analysis and prediction, ultimately leading to more efficient and effective web applications. Overall, the use of OpenAI in a web app can improve both user experience and business outcomes. ( Conclusion written by this Web App! )

Links , references :

- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- [What is Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview?wt.mc_id=acom_openaiwhatis_webpage_gdc)
- [Learning Portal - Azure OpenAI](https://learn.microsoft.com/en-us/training/modules/explore-azure-openai/?wt.mc_id=acom_openaiintroduction_webpage_gdc)
- [Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/overview)
