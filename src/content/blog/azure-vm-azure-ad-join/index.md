---
title: "Azure VM - Azure AD Join and RDP"
slug: "azure-vm-azure-ad-join"
date: 2023-01-13T12:21:44
author: "editor"
excerpt: "Azure AD Join and login with RDP"
categories: ["Azure", "Microsoft365"]
tags: ["AzureAD", "intune", "MDM"]
featuredImage: "/wp-content/uploads/2023/01/AAD2.png"
originalUrl: "https://archive.cloudblogger.eu/2023/01/13/azure-vm-azure-ad-join/"
wordpressId: 681
---

### Azure AD Join and login with RDP

WIth Azure AD Device Groups and the ability to Join the Device to Azure we can easily deploy our VMs, onboard them to Intune and apply Policies even Onboard to Defender automatically! But what about RDP to the VM with the User Credentials ? Yes it is already possible and quite mature so it is a quick way to utilize the whole nine yards!

Create a VM with Windows Professional or Enterprise and select Login with Azure AD on the Management Step:

![](/wp-content/uploads/2023/01/azadsihn.png)

Select Login with Azure AD

The managed identity check box will be activated and we proceed to Monitoring leaving defaults and on the Advanced Tab we select an Extension to install, which is **Azure AD based Windows Login** :

![](/wp-content/uploads/2023/01/azad2q.png)

![](/wp-content/uploads/2023/01/azad2.png)

![](/wp-content/uploads/2023/01/azad2q.png)

![](/wp-content/uploads/2023/01/azad2.png)

Proceed to create the VM and in the meantime verify you have an Azure AD user ready with Intune License, and assigned to MDM Intune setting from Azure AD. We have already the ability to onboard the VM to Defender for Endpoint , and control the device with Endpoint Management - Intune for Windows, so we create the CNAME for Windows AutoEnrollement [as documented here from Microsoft](https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-setup-auto-enrollment).

Add from IAM (Role Based Access Control ) the Virtual Machine Administrator Login and User Login roles to the user you want to login.

The VM should be ready so login with the initial Administrator and perform 3 tasks - **open sysdm.cpl** , **uncheck the Requirement for NLA** , and **run with Admin Powershell the command below**

```
net localgroup "remote desktop users" /add "AzureAD\myuser@something.net"
```

![](/wp-content/uploads/2023/01/azaduse3a-1024x714.png)

Changes with Initial Admin

Now download and edit the RDP file with Notepad++ and make it look like this :

```
full address:s:xx.xx.xx.xx:3389
prompt for credentials:i:1
administrative session:i:1
enablecredsspsupport:i:0
authentication level:i:2
```

We need also a setting to add the User as a Local Admin in case we want that option :

![](/wp-content/uploads/2023/01/azaddevadm1.png)

Assign the Azure AD Local Administrators for Devices

Restart the VM and login with the edited RDP connecion using :

**AzureAD\username@somedomain.net**

![](/wp-content/uploads/2023/01/azaddev4-1024x491.png)

Log In with AzureAD prefix

And thats it ! We can have a Conditional Access Policy to force Intune OnBoarding or add from the Accouns menu our Work account.

We will examine the Onboarding on MDM and Defender in a later post !

Links, References

- [Auto Enroll Windows Devices](https://learn.microsoft.com/en-us/mem/intune/enrollment/quickstart-setup-auto-enrollment)
- [Azure AD Login](https://learn.microsoft.com/en-us/azure/active-directory/devices/howto-vm-sign-in-azure-ad-windows)

![](/wp-content/uploads/2023/01/AAD2-300x110.png)

Azure AD Join
