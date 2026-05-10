---
title: "Create powerful Copilots in Copilot Studio with ease"
slug: "creating-copilots-in-copilot-studio-for-your-website"
date: 2024-04-19T03:42:20
author: "editor"
excerpt: "How to create a CoPilot and use it in your Blog with your blog's Data utilizing the Copilot Studio with innovative looks!"
categories: ["Microsoft365"]
tags: ["Azure AI", "Cloud", "copilot", "m365"]
featuredImage: "/wp-content/uploads/2024/04/cpilotf.jpeg"
originalUrl: "https://archive.cloudblogger.eu/2024/04/19/creating-copilots-in-copilot-studio-for-your-website/"
wordpressId: 2277
---

# How to create a CoPilot and use it in your Blog with your blog's Data

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cpilot.png)

### Intro

Welcome to a new CloudBlogger exciting post! Today, we’re going to embark on an exciting journey of creating our very own AI assistant, or ‘Copilot’, using the powerful **Copilot Studio**. But that’s not all! We’ll also learn how to seamlessly integrate this Copilot into our **WordPress site**, transforming it into a dynamic, interactive platform. Our WordPress site will serve as the primary data source, enabling our Copilot to provide personalized and context-aware responses. Whether you’re a seasoned developer or a tech enthusiast, this guide will offer a step-by-step approach to leverage AI capabilities for your WordPress site. So, let’s dive in and start our AI adventure!

### Preparation

Luckily we can try the Copilot Studio with a trial license. So head on to <https://learn.microsoft.com/en-us/microsoft-copilot-studio/sign-up-individual> and find all the details. You will have to sign in with a Microsoft 365 user email. You need a Microsoft 365 Tenant as you understand!

> This Trial license is NOT the Microsoft 365 Copilot that adds AI and Copilots to your Microsoft 365 Apps. This is the previously known as Power Virtual Agents Application, that was eventually renamed to Copilot Studio.
>
> <https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio>

For those who are actively using Power Apps i suggest to have a god look at <https://learn.microsoft.com/en-us/microsoft-copilot-studio/environments-first-run-experience>, so you can grasp the details regarding Environments.

### Creation

Once we are ready, head over to <https://copilotstudio.microsoft.com> and you can start working with new Copilots!

Let's create one shall we ? Select the upper left Copilots menu, and New Copilot. Add the name you want and add your Blog\Site where the Copilot will get it's data. Go to the bottom and select Edit Advanced Options and check the "Include lesson topics...", select a icon and leave the default "Common Data Services Default Solution".

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp1.png)

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp2.png)

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp3.png)

Once you create the Copilot you will find it in the left menu on the Copilots section:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp4.png)

Copilot List

### Configure Copilot Studio

The first thing we are going to do is to change the Copilot message for salutation. There is a default one which we can change once we click on the Copilot and inside the chat box of the Copilot message. We will find on the left designer area the predefined message which we will change to our preference.

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp001-1024x394.png)

Copilot message

Remember to Save your changes!

#### Topics in Copilot Studio

The most important element of our Copilot are the Topics. Topics are the core building blocks of a chatbot. Topics can be seen as the bot competencies: they define how a conversation dialog plays out. Topics are discrete conversation paths that, when used together, allow for users to have a conversation with a bot that feels natural and flows appropriately.

In our Copilot we have 3 Topics that we do not need, so from the Topics menu, select each Lesson Topic, from the dotted selection and disable it. You can also delete completely these three unneeded Topics.

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp002-1024x404.png)

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp002a-1024x375.png)

It is also important to disable Topics that we don't need otherwise we have to resolve any errors on the existing Topics, since we are making changes. The Topics we need to disable are in grey :

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp001b.png)

Disable System Topics

Before starting deep we also changed a standard Topic named "Goodbye". You will understand that we may need to make it simpler so here is a proposed version:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp001c.png)

As you can see we just changed the end of the Chat with a simple "Thanks for using ..."

We also propose to change the Greeting to Redirect to the Conversation Start for a unified experience !

Let's create a simple Topic, where the Copilot responds to specific questions. You can add your own phrases as well. From the Topics menu select "Create" - "Topic" - "From Blank"

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp003a.png)

Add the Trigger phrases you wish. We have selected the following :

*What do you do?, What is your reach?, What can you tell me?*

Add a node with the Message property and add the text which the Copilot will use to answer. You can add the name of the Copilot by selecting the variable icon inside the node. Add a final node that ends this topic:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp003-1024x657.png)

You can edit the name of your Topic in the upper left corner, and save it ! Before anything you can always test it on the left chat box! Now let's do something more creative ! Let's ask the user if they would provide their email so we can send a summary of the conversation !

The Copilot should make it clear that it is optional and should not interrupt the conversation. So the first thing we need to do is to add a new Topic where we can get the user's email address and store it as a variable. Since the user can request to provide the email later, we can offer this option as well, with the trigger. Here is our Topic:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp004.png)

Pay attention to the closing node and the comment. We have added a Redirect to the Greeting Topic, so we can avoid falling in the Loop of the Start Conversation. To do that we add a new node, Topic Management - Go to another Topic. Now let's build the the request with a condition, by editing the Conversation Start Topic ( the one we edited at the beginning ). From the Topics menu select All and find the Conversation Start Topic. Add a new Node after the Message with a question. We have this text so the user is aware about the options they have:

*Would you like to provide an email so you can get a summary of our Interaction? It is optional and you can add it later by simply saying "**Get my Email"**!*

In this Question Node, select the Multiple Choice options and add the YES and NO possible answers, while saving the answer on a variable. You can rename the variable if you want to. The next node is an "Add a Condition" node and when the answer is YES we send the conversation to the Get User's Email Topic, while the opposite we send it to the Greeting. Here is our design for the Topic:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp005.png)

Conditional conversation

Save the Topic, and you can test your Copilot on the left Chat box. You will notice that we can't redirect the user without a validation message. So we can edit the Get User's Email Topic with a Message Node like this:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp004b.png)

Message in Copilot

Now we have the basic idea of the Topics ! Play around and create your paths ! Be careful not to fall under loops and always try the Copilot !

We can expand to Power Apps for Data operations , like storing the Email to a Table or creating a Flow in Power automate but that's not our focus.

#### Authentication-Channels

Once we are happy with our Copilot we need to make it available to our Channels, specifically to Web Sites. If we select Channels from the left menu we will get a message about Authentication:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp006-1024x385.png)

Authentication in Copilot Channels

So we have to follow a straight forward process to configure Authentication for our Copilot to be available in all Channels. Unless we want users to Sign in we won't activate that option but you can always change that option. We will enable Entra ID as our Service Provider.

**The following part is from Microsoft Documentation**

**Source:**

**[Configure user authentication with Microsoft Entra ID - Microsoft Copilot Studio | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-authentication-azure-ad)**

---

##### Create an app registration

1. Sign in to the [Azure portal](https://portal.azure.com/), using an admin account in the same tenant as your copilot.
2. Go to **App registrations**, either by selecting the icon or searching in the top search bar.![Screenshot showing App registrations in Azure services.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/start-app-reg.png)
3. Select **New registration** and enter a name for the registration.It can be helpful later to use the name of your copilot. For example, if your copilot is called "Contoso sales help," you might name the app registration "ContosoSalesReg."
4. Under **Supported account types**, select **Accounts in any organizational directory (Any Microsoft Entra ID directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)**.
5. Leave the **Redirect URI** section blank for now. Enter that information in the next steps.
6. Select **Register**.
7. After the registration is complete, go to **Overview**.
8. Copy the **Application (client) ID** and paste it in a temporary file. You need it in later steps.

##### Add the redirect URL

1. Go to **Authentication**, and then select **Add a platform**.![Screenshot of the App registrations window with Authentication and the Add a platform button highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/add-platform.png)
2. Under **Platform configurations**, select **Add a platform**, and then select **Web**.![Screenshot of the Platform configurations window with the Web application platform highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/configure-platform.png)
3. Under **Redirect URIs**, enter `https://token.botframework.com/.auth/web/redirect` and `https://europe.token.botframework.com/.auth/web/redirect`.

 Note

The authentication configuration pane in Copilot Studio might show the following redirect URL: `https://unitedstates.token.botframework.com/.auth/web/redirect`. Using that URL makes the authentication fail; use the URI instead.

1. In the **Implicit grant and hybrid flows** section, turn on both **Access tokens (used for implicit flows)** and **ID tokens (used for implicit and hybrid flows)**.![Screenshot of the Configure Web window with the redirect URI and implicit grant and hybrid flow tokens highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/redirect-url.png)
2. Select **Configure**.

##### Generate a client secret

1. Go to **Certificates & secrets**.
2. In the **Client secrets** section, select **New client secret**.
3. (Optional) Enter a description. One is provided if left blank.
4. Select the expiry period. Select the shortest period that's relevant for the life of your copilot.
5. Select **Add** to create the secret.
6. Store the secret's **Value** in a secure temporary file. You need it when you configure your copilot's authentication later on.

 Tip

Don't leave the page before you copy the value of the client secret. If you do, the value is obfuscated and you must generate a new client secret.

##### Configure manual authentication

1. In Copilot Studio, in the navigation menu under **Settings**, select **Security**. Then select the **Authentication** card.![Screenshot of selecting the Authentication card.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configuration-end-user-authentication/auth-manage-sm.png)
2. Select **Manual (for any channel including Teams)** then turn on **Require users to sign in**.![Screenshot of selecting the manual authentication option.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configuration-end-user-authentication/auth-select-manual.png)
3. Enter the following values for the properties:
   - **Service provider**: Select **Microsoft Entra ID**.
   - **Client ID**: Enter the application (client) ID that you copied earlier from the Azure portal.
   - **Client secret**: Enter the client secret you generated earlier from the Azure portal.
   - **Scopes**: Enter `profile openid`.
4. Select **Save** to finish the configuration.

##### Configure API permissions

1. Go to **API permissions**.
2. Select **Grant admin consent for <your tenant name>**, and then select **Yes**. If the button isn't available, you may need to ask a tenant administrator to do enter it for you.![Screenshot of the API permissions window with a tenant permission highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/api-permission.png) NoteTo avoid users from having to consent to each application, a Global Administrator, Application Administrator, or Cloud Application Administrator can grant tenant-wide consent to your app registrations.
3. Select **Add a permission**, and then select **Microsoft Graph**.![Screenshot of the Request API permissions window with Microsoft Graph highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/request-api-permission.png)
4. Select **Delegated permissions**.![Screenshot with Delegated permissions highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/delegated-permission.png)
5. Expand **OpenId permissions** and turn on **openid** and **profile**.![Screenshot with OpenId permissions, openid, and profile highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/select-permission.png)
6. Select **Add permissions**.

##### Define a custom scope for your copilot

[Scopes](https://learn.microsoft.com/en-us/azure/active-directory/develop/developer-glossary#scopes) allow you to determine user and admin roles and access rights. You create a custom scope for the canvas app registration that you create in a later step.

1. Go to **Expose an API** and select **Add a scope**.![Screenshot with Expose an API and the Add a scope button highlighted.](https://learn.microsoft.com/en-us/microsoft-copilot-studio/media/configure-web-sso/expose-api.png)
2. Set the following properties. You can leave the other properties blank.Expand tablePropertyValueScope nameEnter a name that makes sense in your environment, such as `Test.Read`Who can consent?Select **Admins and users**Admin consent display nameEnter a name that makes sense in your environment, such as `Test.Read`Admin consent descriptionEnter `Allows the app to sign the user in.`StateSelect **Enabled**
3. Select **Add scope**.

*Source: [Configure user authentication with Microsoft Entra ID - Microsoft Copilot Studio | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-authentication-azure-ad)*

---

You can always make the Copilot more secure by adding [required Authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-end-user-authentication?tabs=web) and [SSO](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-sso?tabs=webApp). Read the Documentation to see how you can also add scopes on the Copilot.

Now it's time to Publish ! Hit the Publish from the menu and publish your Copilot. If any errors occur it will mostly be a Topic. Read carefully our instructions and of course you can make your own routes since you got the concept ! Once Publishing is done, the Channels menu will activate all channels and from the Custom Website you can grab the embedding code and add it in a Post on your Wordpress or your Webpage !

![](/wp-content/uploads/2024/04/cp0012.png)

You can also see it in the Demo Website if you have not enabled ["require secure access"](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security).

![](/wp-content/uploads/2024/04/democ-1024x546.png)

Here it is in the actual WordPress using the embedded code:

![Copilots in Copilot Studio](/wp-content/uploads/2024/04/cp0010-1024x609.png)

### Closing

With Copilot Studio, building a custom AI assistant and seamlessly integrating it into your WordPress site is simpler than you might have imagined. It empowers you to create a more dynamic and personalized user experience. Whether you're looking to automate tasks, provide intelligent insights, or offer a more conversational interface on your site, Copilot Studio provides the tools and straightforward process to get you there. Remember, the possibilities are endless. Experiment, refine, and watch as your WordPress site becomes a hub of unparalleled AI-powered engagement!

### References

- [Create Copilots with Copilot Studio](https://learn.microsoft.com/en-us/training/paths/work-power-virtual-agents/)
- [Manage Topics in Copilot Studio](https://learn.microsoft.com/en-us/training/modules/manage-power-virtual-agents-topics/1-introduction)
- [AI-based copilot authoring overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-gpt-overview)
- [Quickstart guide for building copilots with generative AI](https://learn.microsoft.com/en-us/microsoft-copilot-studio/nlu-gpt-quickstart)
- [Microsoft Copilot Studio overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio)
