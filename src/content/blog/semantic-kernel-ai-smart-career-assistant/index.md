---
title: "How to create an AI Smart Career Assistant"
slug: "semantic-kernel-ai-smart-career-assistant"
date: 2024-07-31T22:46:23
author: "editor"
excerpt: "How to create an AI Smart Career Assistant and Job Search Engine with Semantic Kernel and utilize AI capabilities for a Job Search AI enhanced Application"
categories: ["Azure", "Devops"]
tags: ["ASP NET", "Azure", "Azure AI", "Azure OpenAI", "Cloud", "DOTNET", "React", "Semantic Kernel", "terraform"]
featuredImage: "/wp-content/uploads/2024/07/archiecture-1.png"
originalUrl: "https://archive.cloudblogger.eu/2024/07/31/semantic-kernel-ai-smart-career-assistant/"
wordpressId: 2578
---

# How to create an AI Smart Career Assistant with Semantic Kernel

![AI Smart Career Assistant](/wp-content/uploads/2024/07/Designer-31.jpeg)

[GitHub Repo Link](https://github.com/passadis/semantickernel-careeradvice)

### Intro

Welcome to our cloud-powered adventure! Are you ready to explore the intersection of technology and career guidance with an AI Smart Career Assistant? In this blog post, we’ll delve into the fascinating world of Azure Container Apps and discover how Semantic Kernel, Microsoft’s open-source development kit, can revolutionize your approach to career advice. Buckle up—we’re about to embark on a transformative journey!

### The concept of AI Smart Career Assistant

#### The Rise of Semantic Kernel

Semantic Kernel, an open-source development kit, has taken the .NET community by storm. With support for C#, Python, and Java, it seamlessly integrates with dotnet services and applications. But what makes it truly remarkable? Let’s dive into the details.

#### A Perfect Match: Semantic Kernel and .NET

Picture this: you’re building a web app, and you want to infuse it with AI magic. Enter Semantic Kernel. It’s like the secret sauce that binds your dotnet services and AI capabilities into a harmonious blend. Whether you’re a seasoned developer or just dipping your toes into AI waters, **Semantic Kernel** simplifies the process. As part of the Semantic Kernel community, I’ve witnessed its evolution firsthand. The collaborative spirit, the shared knowledge—it’s electrifying! We’re not just building software; we’re shaping the future of AI-driven web applications.

#### The Web App

Our initial plan was simple: create a job recommendations engine. But Semantic Kernel had other ideas. It took us on an exhilarating ride. Now, our web application not only suggests career paths but also taps into third-party APIs to fetch relevant job listings. And that’s not all—it even crafts personalized skilling plans and preps candidates for interviews. Talk about exceeding expectations!

### Build

Since i have already created the repository on [GitHub](https://github.com/passadis/semantickernel-careeradvice) i don't think it is critical to re post Terraform files here. We are building our main Infrastructure with Terraform and also invoke an Azure Cli script to automate the Container Image build and push. We will have these resources at the end:

![Azure Resource Group Designer : AI Smart Career Assistant](/wp-content/uploads/2024/07/rg-mybotapp-1024x316.png)

Resources Visualizer

Before deployment make sure to assign the Service Principal with the role "RBAC Administrator" and narrow down the assignments to AcrPull, AcrPush, so you can create a User Assigned Managed Identity with these roles.

Since we are building and pushing the Container Images with local-exec and Az Cli scripts within Terraform you will notice some explicit dependencies, for us to make sure everything builds in order. It is really amazing the fact that we can build all the Infra including the Apps with Terraform !

### Architecture of AI Smart Career Assistant

Upon completion you will have a functioning React Web App with the ASP NET Core webapi, utilizing Semantic Kernel and an external Job Listings API, to get advice, find Jobs and get a Skilling Plan for a specific recommended role! The following is a reference Architecture. Aside the Private Endpoints the same deployment is available in GitHub.

![AI Smart Career Assistant with Semantic Kernel Architecture](/wp-content/uploads/2024/07/archiecture-1-1024x576.png)

Architecture

### Kernel SDK

The SDK provides a simple yet powerful array of commands to configure and "set" the Semantic Kernel characteristics. Let's the first endpoint, where users ask for recommended career paths:

```
        [HttpPost("get-recommendations")]
        public async Task<IActionResult> GetRecommendations([FromBody] UserInput userInput)
        {
            _logger.LogInformation("Received user input: {Skills}, {Interests}, {Experience}", userInput.Skills, userInput.Interests, userInput.Experience);

            var query = $"I have the following skills: {userInput.Skills}. " +
                        $"My interests are: {userInput.Interests}. " +
                        $"My experience includes: {userInput.Experience}. " +
                        "Based on this information, what career paths would you recommend for me?";

            var history = new ChatHistory();
            history.AddUserMessage(query);

            ChatMessageContent? result = await _chatCompletionService.GetChatMessageContentAsync(history);

            if (result == null)
            {
                _logger.LogError("Received null result from the chat completion service.");
                return StatusCode(500, "Error processing your request.");
            }

            string content = result.Content;

            _logger.LogInformation("Received content: {Content}", content);

            var recommendations = ParseRecommendations(content);

            _logger.LogInformation("Returning recommendations: {Count}", recommendations.Count);

            return Ok(new { recommendations });
```

The actual data flow is depicted below, and we can see the Interaction with the local Endpoints and the external endpoint as well. The user provides Skills, Interests, Experience and Level of current position and the API sends the Payload to Semantic kernel with a constructed prompt asking for positions recommendations. The recommendations return with clickable buttons, one to find relevant positions from LinkedIn listings using the external API, and another to ask again the Semantic Kernel for skill up advice!

![AI Smart Career Assistant data flow](/wp-content/uploads/2024/07/flow-1024x604.png)

Data Flow

![AI Smart Career Assistant Screen 1](/wp-content/uploads/2024/07/career1-1024x492.png)

Home Page - Get Recommendations

![AI Smart Career Assistant UI](/wp-content/uploads/2024/07/career2-1024x128.png)

Skilling Plan

![AI Smart Career Assistant response](/wp-content/uploads/2024/07/career3-1024x262.png)

Linked In Job Listings

The Project can be extended to a point of automation and AI Integration where users can upload their CVs and ask the Semantic Kernel to provide feedback as well as apply for a specific position! As we discussed earlier some additional optimizations are good to have, like the Private Endpoints, Azure Front Door and/or Azure Firewall, but the point is to see Semantic Kernel in action with it's amazing capabilities especially when used within the .NET SDK.

*Important Note: This could have been a one shot deployment but we cannot add the custom domain with Terraform ( **unless we use Azure DNS**) and the Cors Settings. So we have to add these details for our Solution to function properly!*

Once the Terraform completes, add the Custom Domains to both Container Apps. The advantage here is that we will know the Frontend and Backend FQDNs, since we decide the Domain name, and the React Environment Value is preconfigured with the backend URL. Same for the Backend, we have set as Environment Value for the ALLOWED\_ORIGINS, the frontend URL. So we can just go to Custom Domain on each App, and add the domain names after selecting the Certificate which will be already there, since we have uploaded it via Terraform!

![AI Smart Career Assistant Custom Domain](/wp-content/uploads/2024/08/domain.png)

### Lessons Learned

This was a real adventure and i want to share with you important lessons learned and hopefully save you some time and effort. Prepare ahead with a **Certificate**. I was having problems from the get go with ASP NET refusing to build on Containers until i integrated the certificate. The local development works fine without it. **Cross Origin** is very important, do not underestimate it ! Configure it correctly and in this example i went directly to **Custom Domains**, so i can have better overall control. This solution worked both on **Azure Web Apps** and **Azure Container Apps**. The Git Hub repo has the Container Apps solution but you can go with Web Apps. Finally don't waste you time to go with Dapr. React does not 'react' well with the Dapr Client and my lesson learned here is that Dapr is made for same framework invocation or you are going to need a middleware. Since we cannot create the Custom Domain with Terraform there are solutions we can use, like using AzApi, We utilized a small portion of what really Semantic Kernel can do and i stopped when i realized that this project will never end if i continue pursuing ideas ! It is much better to have it on GiHub and probably we can come back and add some more features !

### Conclusion

In this journey through the intersection of technology and career guidance, we've explored the powerful capabilities of Azure Container Apps and the transformative potential of Semantic Kernel, Microsoft’s open-source development kit. By seamlessly integrating AI into .NET applications, Semantic Kernel has not only simplified the development process but also opened new doors for innovation in career advice.

Our adventure began with a simple idea—creating a job recommendations engine. However, with the help of Semantic Kernel, this idea evolved into a sophisticated web application that goes beyond recommendations. It connects to third-party APIs, crafts personalized skilling plans, and prepares candidates for interviews, demonstrating the true power of AI-driven solutions.

By leveraging Terraform for infrastructure management and Azure CLI for automating container builds, we successfully deployed a robust architecture that includes a React Web App, ASP.NET Core web API, and integrated AI services. This project highlights the ease and efficiency of building and deploying cloud-based applications with modern tools. The code is available in GitHub for you to explore, contribute and extend as mush as you want to !

#### Links\References

- [Intro to Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/)
- [Understanding the kernel](https://learn.microsoft.com/en-us/semantic-kernel/concepts/kernel?pivots=programming-language-csharp)
- [Chat completion](https://learn.microsoft.com/en-us/semantic-kernel/concepts/ai-services/chat-completion/?tabs=csharp-AzureOpenAI%2Cpython-AzureOpenAI%2Cjava-AzureOpenAI&pivots=programming-language-csharp)
- [Deep dive into Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/get-started/detailed-samples?pivots=programming-language-csharp)
- [Azure Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/)

![AI Smart Career Assistant graphic](/wp-content/uploads/2024/07/Large_SK_Logo-300x300-1.png)
