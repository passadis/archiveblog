---
title: "Intro to Microsoft Copilot for Security"
slug: "intro-to-microsoft-copilot-for-security"
date: 2024-06-29T21:39:15
author: "editor"
excerpt: "Intro to Microsoft Copilot for Security: All you need to know to deploy your own Copilot for Security Instance. An end to end demonstration of the Copilot for Security use case."
categories: ["Azure", "Co Pilot", "Microsoft365"]
tags: ["AI", "Azure", "Cloud", "copilot", "Security"]
featuredImage: "/wp-content/uploads/2024/06/Security-Consultation-1.png"
originalUrl: "https://archive.cloudblogger.eu/2024/06/29/intro-to-microsoft-copilot-for-security/"
wordpressId: 2446
---

### All you need to know to deploy your own Copilot for Security Instance

![Security Copilot graphic](/wp-content/uploads/2024/06/Designer-46-edited.jpeg)

### Intro

Welcome to CloudBlogger, a Web Site that gets you ahead in the exciting fields of Azure, DevOps and M365 with detailed Workshops and amazing posts. Today we are implementing Microsoft Copilot for Security the latest Cybersecurity innovation from Microsoft. Copilot for Security is a generative AI security product that empowers security and IT professionals respond to cyber threats, process signals, and assess risk exposure at the speed and scale of AI.

Let's see what are the prerequisites as the [documentation](https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot) states.

### Minimum requirements

#### Subscription

In order to purchase security compute units, ***you need to have an Azure subscription***. For more information, see [Create your Azure free account](https://azure.microsoft.com/free).

#### Security compute units

Security compute units are the required units of resources that are needed for dependable and consistent performance of Microsoft Copilot for Security.

Copilot for Security is sold in a provisioned capacity model and is billed by the hour. You can provision Security Compute Units (SCUs) and increase or decrease them at any time. Billing is calculated on an hourly basis with a minimum of one hour.

*For more information, see [Microsoft Copilot for Security pricing](https://aka.ms/CopilotforSecurity_Pricing).*

#### Capacity

Capacity in the context of Copilot for Security, is an Azure resource that contains SCUs. SCUs are provisioned for Copilot for Security. You can easily manage capacity by increasing or decreasing provisioned SCUs within the Azure portal or the Copilot for Security portal. Copilot for Security provides a usage monitoring dashboard for Copilot owners, allowing them to track usage over time and make informed decisions about capacity provisioning. For more information, see [Managing usage](https://learn.microsoft.com/en-us/copilot/security/manage-usage).

### Provisioning

We have 2 options to provision Compute Units, directly from the [Copilot for Security Portal](https://securitycopilot.microsoft.com/) or from our Azure Subscription. The second option is to simply head over to Azure, search for Copilot for Security and you can create the resource, which in fact represents the billable CUs for the Directory the Subscription is associated with.

![Security Copilot diagram Azure Initialization](/wp-content/uploads/2024/06/az1.png)

Azure - Copilot for Security resource

The first is the recommended option where we go through the [actual portal](https://securitycopilot.microsoft.com/) where we can later manage Access and see our provisioned CUs, and follow a wizard type of activation.

![Step 1 - Welcome](/wp-content/uploads/2024/06/sec1-1024x506.png)

Step 1 - Welcome

![Step 2 - Select Subscription](/wp-content/uploads/2024/06/sec2-1024x511.png)

Step 2 - Select Subscription

![Step 3 - CUs](/wp-content/uploads/2024/06/sec3-1024x637.png)

Step 3 - CUs

![Step 4 - Data residency](/wp-content/uploads/2024/06/sec4.png)

Step 4 - Data residency

![Step 5 - Share with Microsoft](/wp-content/uploads/2024/06/sec5.png)

Step 5 - Share with Microsoft

![Step 6 - Roles & Access](/wp-content/uploads/2024/06/sec6.png)

Step 6 - Roles & Access

We are done ! In a few clicks we were able to activate our Copilot for Security, selected the number of CUs we need, as well as the data residency for our data.

![Copilot for Security  setup completed](/wp-content/uploads/2024/06/sec7.png)

### Configure

Once we complete the wizard and press finish we are ready to start working with our Copilot for Security. Observe the information on the Home screen of the portal, with links to Training Prompts and Documentation.

![Copilot for Security admin portal](/wp-content/uploads/2024/06/sec8-1024x669.png)

Copilot for Security Home Screen

### Authentication & Roles

It is important to have a good understating of the Roles and permissions that apply for Copilot for Security.

#### Copilot for Security roles

Copilot for Security introduces two roles that function like access groups but aren't Microsoft Entra ID roles. Instead, they only control access to the capabilities of the Copilot for Security platform.

- Copilot owner
- Copilot contributor

By default, all users in the Microsoft Entra tenant are given **Copilot contributor** access.

#### Microsoft Entra roles

The following Microsoft Entra roles automatically inherit **Copilot owner** access.

- Security Administrator
- Global Administrator

Have a look at the relevant documentation page explaining everything about Roles & permissions:

[Understand authentication in Microsoft Copilot for Security | Microsoft Learn](https://learn.microsoft.com/en-us/copilot/security/authentication).

### Copilot in action

Once we have a good understanding and we have built our Team, we can start working with Copilot for Security within Defender Dashboards from **https://security.microsoft.com.**

Most Dashboards offer the interactive experience that helps us understand different signals, take potential actions and get explanatory suggestions from the Copilot.

![Copilot for Security example](/wp-content/uploads/2024/06/ms-sec1-1-1024x281.png)

Threat Analytics - Copilot for Security

"Copilot for Threat Analytics is designed to assist users in understanding and responding to security threats. It provides evidence-based, objective, and actionable insights derived from security data. The purpose is to help users make informed decisions about their security posture and response strategies. It does this by analyzing data from various sources, identifying potential threats, and providing detailed information about those threats. This includes information about the nature of the threat, its potential impact, and possible mitigation strategies. The goal is to provide users with the information they need to effectively manage and respond to security threats." (*generated from Copilot for Security*)

![Copilot for Security Advanced Hunting](/wp-content/uploads/2024/06/ms-sec2-1024x339.png)

Defender Advanced Hunting - Copilot for Security

Especially in Advanced Hunting, Copilot offers a preset of KQL Queries that we can run directly or load them into our Editor for further editing.

![Copilot for Security KQL](/wp-content/uploads/2024/06/ms-sec5b.png)

Custom Query

![Copilot for Security KQL 2](/wp-content/uploads/2024/06/ms-sec5.png)

Preset Query

Another powerful capability lays inside the Incidents that we get from Defender for Endpoint. Just click on the incident and Copilot will provide information and investigation information along with recommendations if available.

![Copilot for Security Defender](/wp-content/uploads/2024/06/ms-sec6-1024x472.png)

Defender for Endpoint - Copilot for Security

### Intune - Copilot the Endpoints

Yes you are reading correct! Once your Copilot Platform is ready you are in for a nice surprise! In Endpoint Management or Intune you will find Copilot ready to assist on your Endpoints Management Tasks! It is an integration in Preview, and i believe it is going to be a great addition for Endpoint Administrators.

![Copilot for Security Intune](/wp-content/uploads/2024/06/intune1-1024x891.png)

Copilot in Intune

Here is an example where we are getting a summary of our Windows policy in Intune:

![Copilot for Security App Policy](/wp-content/uploads/2024/06/intune2-1024x260.png)

Intune - Copilot for Security

If we wanted to list the functionality here is a list of the main points:

- **Input Processing**: When you ask Copilot a question in Intune, it sends the query to Copilot for Security.
- **Data Sources**: Copilot for Security uses data from your tenant and authoritative Microsoft documentation sources.
- **Response Generation**: It processes the input and generates a response, which is then displayed in Intune.
- **Session Tracking**: You can review all interactions in Copilot for Security by checking your sessions.
- **Privacy and Verification**: Always double-check Copilot’s responses, as it may not always be accurate.
- **Partial Information**: In some cases, Copilot might provide partial information due to large data volumes.

It is quite important to pay attention to the Responsible use of AI. A Frequently Asked Questions page is available for everyone as well.

*Copilot for Security is a natural language, AI-powered security analysis tool that assists security professionals in responding to threats quickly, processing signals at machine speed, and assessing risk exposure in minutes. It draws context from plugins and data to answer security-related prompts so that security professionals can help keep their organizations secure. Users can collect the responses that they find useful from Copilot for Security and pin them to the pinboard for future reference.* (*source: [Microsoft Responsible use of AI FAQ](https://learn.microsoft.com/en-us/copilot/security/rai-faqs-security-copilot)*)

But that's not all. Apart from the Defender portal, a good use of Copilot for Security comes within the [Copilot for Security Platform](https://securitycopilot.microsoft.com/). We can find a wide range of Prompts, we can utilize Plugins even build our own. We can upload files that provide guidance to the Copilot, *examples of files you can upload are your organization’s policy and compliance documents, investigation and response procedures, and templates. Integrating this wealth of knowledge into Copilot allows Copilot to reason over the knowledge base or documents and generate responses that are more relevant, specific, and customized to your operational needs (source [Microsoft Documentation](https://learn.microsoft.com/en-us/copilot/security/upload-file)).*

![Copilot for Security - Plugins](/wp-content/uploads/2024/06/main1-1024x693.png)

Copilot for Security - Plugins

![Copilot for Security - Files upload](/wp-content/uploads/2024/06/main2-1024x702.png)

Copilot for Security - Files upload

The current library of Plugins is quite extensive but a key capability is the fact that we can create our own.

*You can create new plugins to extend what Copilot can do by following the steps in [Create new plugins](https://learn.microsoft.com/en-us/copilot/security/custom-plugins).* *To add and manage your custom plugins to Copilot for Security, follow the steps in [Manage custom plugins](https://learn.microsoft.com/en-us/copilot/security/manage-plugins#manage-custom-plugins). (source [Microsoft Documentation](https://learn.microsoft.com/en-us/copilot/security/plugin-overview))*.

### Final thoughts

Microsoft has significantly impacted the cybersecurity landscape with Copilot for Security. This powerful tool provides an instant upgrade for organizations, enabling IT and security teams to work more efficiently, prioritize findings, and take action without exhausting investigation efforts.

Copilot for Security serves as a valuable AI expert assistant, guiding the security landscape in the right direction. It also acts as an upskilling platform, presenting a positive challenge for all involved to embrace the AI era through the lens of cybersecurity excellence. My personal testimony through the experience so far, is that the Product Team did an excellent Job building an AI Security platform that makes the difference and combines the best of our technology at hand with our needs for secure environments, while keeping a "learn while doing" pattern as usual. Don't forget to download the [Security Copilot diagram](https://learn.microsoft.com/en-us/copilot/security/media/security-copilot-diagram.png#lightbox) and get a high level overview of the architecture.

![Security Copilot diagram](/wp-content/uploads/2024/06/security-copilot-diagram-570x285.png)

#### References

- [Microsoft Copilot for Security - Getting started](https://learn.microsoft.com/en-us/copilot/security/get-started-security-copilot)
- [Navigate Copilot for Security](https://learn.microsoft.com/en-us/copilot/security/navigating-security-copilot)
- [Prompting in Copilot for Security](https://learn.microsoft.com/en-us/copilot/security/prompting-security-copilot)
- [Sample Use Case: Triage incidents](https://learn.microsoft.com/en-us/copilot/security/triage-alert-with-enriched-threat-intel)
- [Sample Use Case: Investigate an incident](https://learn.microsoft.com/en-us/copilot/security/investigate-incident-malicious-script)

![Security Copilot logo](/wp-content/uploads/2024/06/Security-Consultation-1-1024x651.png)
