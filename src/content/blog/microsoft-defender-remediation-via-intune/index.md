---
title: "Defender for Endpoint remediation via Intune"
slug: "microsoft-defender-remediation-via-intune"
date: 2022-09-26T00:54:29
author: "editor"
excerpt: "Defender for Endpoint remediation via Intune"
categories: ["Microsoft365"]
tags: ["defender", "intune", "m365"]
featuredImage: "/wp-content/uploads/2023/12/az21.png"
originalUrl: "https://archive.cloudblogger.eu/2022/09/26/microsoft-defender-remediation-via-intune/"
wordpressId: 316
---

Microsoft 365 Defender Security Center offers all the tools for your Organization to architect and deploy a fully functional Security Center, with integration to other Microsoft Services, so your Security engine runs well tuned and optimized. The Security portal provides insights, real time overview, alerting, hunting as well as recommendations and remediation options.

![](/wp-content/uploads/2022/09/def23a-1024x295.jpg)

Security recommendations from Defender for Endpoint

Each recommendation is exceptionally described, explained and the Security Administrator can evaluate the risk and decide whether to take action or not. An example recommendation might be the software that needs to be updated, several security controls to be activated, automatic updates and so on.Once a recommendation is active, we can check the remediation options available:

![](/wp-content/uploads/2022/09/def23ab-1.jpg)

A recommendation for enabling Automatic Updates with three different options to choose from

As we can see in Option 2, we can create a MEM Policy described step by step!

The point of this post now is to describe the process from a Security Analyst perspective, of getting the job done without any hustle, semi automated while focusing on the specialization of analyzing and keeping an eye on the security rather than a general approach, where everyone does everything.The remediation is send to Intune as a Security Task and the Endpoint Administrator is provided with the options to complete the tasks.

**It's a requirement that Microsoft Endpoint Configuration Manager is fully integrated with Microsoft Defender for Endpoint. Configure Defender for Endpoint from Intune ([as from Microsoft Documentation](https://learn.microsoft.com/en-us/mem/intune/protect/advanced-threat-protection-configure)):**

- Sign in to the [Microsoft Endpoint Manager admin center](https://go.microsoft.com/fwlink/?linkid=2109431).
- Select **Endpoint security** > **Microsoft Defender for Endpoint**, and then select **Open the Microsoft Defender for Endpoint admin console**.

This opens the **Microsoft 365 Defender** portal at *security.microsoft.com*, which [replaces the use of the previous portal](https://learn.microsoft.com/en-us/microsoft-365/security/defender/microsoft-365-defender?view=o365-worldwide&preserve-view=true) at *securitycenter.windows.com*.

**Tip**

If the **Connection status** at the top of the page is already set to **Enabled**, the connection to Intune has already been made, and the admin center displays different UI than in the following screen shot. In this event, you can use the link **Open the Microsoft Defender for Endpoint admin console** to open the Microsoft Defender Security Center and use the guidance in the following step to confirm that the **Microsoft Intune connection** is set to **On**.

![](/wp-content/uploads/2022/09/atp-device-compliance-open-microsoft-defender-1024x603.png)

- In **Microsoft 365 Defender**, (previously the *Microsoft Defender Security Center*):
  - Select [**Settings** > **Endpoints** >**Advanced features**](https://security.microsoft.com/preferences2/integration).
  - For **Microsoft Intune connection**, choose **On**:

![](/wp-content/uploads/2022/09/atp-security-center-intune-toggle-1024x110.png)

- Select **Save preferences**.

**Note**

Once the connection is established, the services are expected to sync with each other *at least* once every 24 hours. The number of days without sync until the connection is considered unresponsive is configurable in the [**Microsoft Endpoint Manager admin center**](https://go.microsoft.com/fwlink/?linkid=2109431). Select **Endpoint security** > **Microsoft Defender for Endpoint** > **Number of days until partner is unresponsive**

- Return to **Microsoft Defender for Endpoint** page in the Microsoft Endpoint Manager admin center.
  - To use Defender for Endpoint with **compliance policies**, configure the following under **MDM Compliance Policy Settings** for the platforms you support:
    - Set **Connect Android devices** to Microsoft Defender for Endpoint to **On**
    - Set **Connect iOS devices** to Microsoft Defender for Endpoint to **On**
    - Set **Connect Windows devices** to Microsoft Defender for Endpoint to **On**

When these configurations are *On*, applicable devices that you manage with Intune, and devices you enroll in the future, are connected to Microsoft Defender for Endpoint for compliance.

For iOS devices, Defender for Endpoint also supports the following settings:

**Note**

Before you can use the following two settings, you must opt-in to an MDE Preview. To opt-in, contact mdatpmobile@microsoft.com.

- **Enable App Sync for iOS Devices**: Set to **On** to allow Defender for Endpoint to request metadata of iOS applications from Intune to use for threat analysis purposes. The iOS device must be MDM-enrolled and will provide updated app data during device check-in.
  - **Send full application inventory data on personally-owned iOS/iPadOS Devices**: This setting controls the application inventory data that Intune shares with Defender for Endpoint when Defender for Endpoint syncs app data and requests the app inventory list.

When set to **On**, Defender for Endpoint can request a list of applications from Intune for personally-owned iOS/iPadOS devices. This includes unmanaged apps as well as apps that were deployed through Intune.

When set to **Off**, data about unmanaged apps isn’t provided. Intune does share data for the apps that were deployed through Intune.

For more information, see [Mobile Threat Defense toggle options](https://learn.microsoft.com/en-us/mem/intune/protect/mtd-connector-enable#mobile-threat-defense-toggle-options).

1. To use Defender for Endpoint with **app protection policies**, configure the following under **App Protection Policy Settings** for the platforms you support. These capabilities are available for Android and iOS/iPadOS.
   1. Set **Connect Android devices** to Microsoft Defender for Endpoint for app protection policy evaluation to **On**.
   1. Set **Connect iOS devices** to Microsoft Defender for Endpoint for app protection policy evaluation to **On**.

For more information about both MDM Compliance Policy Settings and App Protection Policy Settings, see [Mobile Threat Defense toggle options](https://learn.microsoft.com/en-us/mem/intune/protect/mtd-connector-enable#mobile-threat-defense-toggle-options).

Select **Save** and soon we should see our connection in the Enabled Status:

![](/wp-content/uploads/2022/09/enabledmedef-1024x292.jpg)

Intune succesfully connected with Microsoft Defender for Endpoint

Now we are exploring our Security recommendations, and since we need our Software to be fully updated we see the Enable Automatic Updates recommendation. Down in the pop-up there is a Request Remediation button, once we select it the process to initiate a remediation begins :

[](/wp-content/uploads/2022/09/DefenderTasks.mp4)

Remediation steps from Defender for Endpoint

Once the process is complete, we can see immediately in the Security Tasks menu in the Endpoint Manager Admin Center, the remediation request, and clicking on it, there is the detailed methodology:

![](/wp-content/uploads/2022/09/remdef1-1024x195.jpg)
![](/wp-content/uploads/2022/09/remdef1a-1024x516.jpg)

The Security Task from the remediation request with details

When the Intune \ Endpoint Administrator accepts the process the status on the Defender portal changes to Approved, and when the complete set of actions is done the Task is set to Completed by the Endpoint Administartor, so does the Defender Activity, Any comments the Endpoint Administrator wrote, appear as well:

![](/wp-content/uploads/2022/09/remdef1b-1.jpg)

The Task was accepted

![](/wp-content/uploads/2022/09/remdef1c.jpg)

The Task is completed

Defender for Endpoint is the real deal regarding modern Security products for Devices. With great integration capabilities, an enormous community to reach and connect , it is not your average Antivirus solution. We will explore more scenarios with SIEM integration, we will check out Defender for Cloud Apps, and of course Defender for 365 for Email Threat Protection, in later posts!

Some usefull links are always welcome:

- [Manage endpoint security in Microsoft Intune | Microsoft Learn](https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security)
- [Configure Microsoft Defender for Endpoint in Microsoft Intune | Microsoft Learn](https://learn.microsoft.com/en-us/mem/intune/protect/advanced-threat-protection-configure)
- [Microsoft Defender Vulnerability Management | Microsoft Learn](https://learn.microsoft.com/en-us/microsoft-365/security/defender-vulnerability-management/defender-vulnerability-management?source=recommendations&view=o365-worldwide)
- [The endpoint manager's guide to what's coming in Windows 11 - Microsoft Tech Community](https://techcommunity.microsoft.com/t5/microsoft-endpoint-manager-blog/the-endpoint-manager-s-guide-to-what-s-coming-in-windows-11/ba-p/3264632)

![](/wp-content/uploads/2022/09/defendelogo.png)
