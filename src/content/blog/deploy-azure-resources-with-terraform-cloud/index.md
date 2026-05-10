---
title: "How to use Terraform Cloud"
slug: "deploy-azure-resources-with-terraform-cloud"
date: 2022-07-29T05:40:02
author: "editor"
excerpt: "How to use Terraform Cloud in order to built your Azure Infrastructure: Azure Virtual Network & Subnet with NSG using Terraform Cloud."
categories: ["Azure", "Devops"]
tags: ["Azure", "iac", "terraform"]
featuredImage: ""
originalUrl: "https://archive.cloudblogger.eu/2022/07/29/deploy-azure-resources-with-terraform-cloud/"
wordpressId: 170
---

# Azure Virtual Network & Subnet with NSG and Sample Security Rules via Terraform Cloud ( Free Tier)

Let's have a look into IaC, shall we? Ok the purpose of this post is to understand that IaC allows us to deploy fast, secure and at-scale our resources on demand, perform our tasks, and remove those billable units, while keeping the template in Terraform files. Any tools of IaC can do the same, Terraform is used mostly for the Cloud part! You see, our state, can stay on Terraform Cloud !

Let's create a service principal to Authenticate Terraform to Azure using Cloud Shell:

```
az ad sp create-for-rbac --name "terra1" --role Contributor --scopes /subscriptions/xxxxxxxxxxxxxxx
```

Keep the Exported Values, and open Terraform Cloud

<https://app.terraform.io/session>

Create an Organization and a Workspace

**We are logged in to an Organization and here we have our workspaces. Before anything go to Settings, API Tokens cerate a User Token and copy it** **in a txt** **file.**

![](/wp-content/uploads/2022/07/TCloudlogin.jpg)

![](/wp-content/uploads/2022/07/TClVariables-1024x574.jpg)

**Create a Variable Set for the Azure Subscription and the Service Principal values we have kept. Pay attention to the Variable settings, as of the Sensitive Value and Category.**

*Take a look the Set can be applied to multiple workspaces.*

**Besides Variable Sets we will create Variables on our Workspace, like location or prefix:**

![](/wp-content/uploads/2022/07/TCWspaceVArs-1024x224.jpg)

Now we have to install terraform or open Vscode and install it

[Install the Azure Terraform Visual Studio Code extension | Microsoft Docs](https://docs.microsoft.com/en-us/azure/developer/terraform/configure-vs-code-extension-for-terraform?tabs=azure-cli)

Create the file below with the token

- *On Windows, the file must be named `terraform.rc` and placed in the relevant user's `%APPDATA%` directory. The physical location of this directory depends on your Windows version and system configuration; use `$env:APPDATA` in PowerShell to find its location on your system.*
- *On all other systems, the file must be named `.terraformrc` (note the leading period) and placed directly in the home directory of the relevant user.*

```
credentials "app.terraform.io" {
token = "TokenWeCreated.atlasv1.xxxx"
}
```

```
Create your Folder on your Filesystem e.x
c:\hashi\vnetexample
And the files
```

clouds.tf - Used to select Workpsace and Org ( it can have any name)

```
terraform {
  cloud {
    organization = "sponsors"

    workspaces {
      name = "azurepass"
    }
  }
}
```

providers.tf - The mandatory providers file, it can contain all of our Cloud Providers

```
terraform {

  required_version = ">=1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
}

provider "azurerm" {
  features {}
}
```

variables.tf - Here we have our variables file we can declare them also here:

```
variable "prefix" {
  type        = string
  description = "Prefix of the resource group name that's combined with a random ID so name is unique in your Azure subscription."
}

variable "location" {
  type        = string
  description = "Location of the resource group."
}
```

main.tf - The core configuration file for our Azure Subscription:

```
resource "azurerm_resource_group" "rsg-az-north1" {
  name     = "${var.prefix}-resource-group"
  location = var.location

  tags = {
    Type = "Development"
  }
}

resource "azurerm_virtual_network" "vnet-north" {
  resource_group_name = azurerm_resource_group.rsg-az-north1.name
  name                = "${var.prefix}-vnet-north"
  location            = var.location

  address_space = [
    "192.168.20.0/24",
  ]
  tags = {
    Type = "Development"
  }
}

resource "azurerm_subnet" "snet-north" {
  resource_group_name  = azurerm_resource_group.rsg-az-north1.name
  virtual_network_name = azurerm_virtual_network.vnet-north.name
  name                 = "${var.prefix}-snet-north"
  address_prefixes     = ["192.168.20.0/26"]
}

resource "azurerm_network_security_group" "nsg-north" {
  resource_group_name = azurerm_resource_group.rsg-az-north1.name
  name                = "nsg-north"
  location            = var.location
  tags = {
    Type = "Development"
  }
}

resource "azurerm_network_security_rule" "rulenet" {
  resource_group_name         = azurerm_resource_group.rsg-az-north1.name
  network_security_group_name = azurerm_network_security_group.nsg-north.name
  source_port_range           = "*"
  source_address_prefix       = "*"
  protocol                    = "Tcp"
  priority                    = "110"
  name                        = "FTP"
  direction                   = "Inbound"
  destination_port_ranges      = "["21","8088"]
  destination_address_prefix  = "*"
  description                 = "Remote Desktop"
  access                      = "Allow"

}
```

When we are ready on our Folder root e.x c:\my\terra-az\ , we run in Bash or Powershell,

terraform init

terraform plan

terraform apply , and we write yes for the Deployment to execute

![](/wp-content/uploads/2022/07/TCVscodeStr.jpg)

Our screen displays all the resources which are going to be deployed and only yes will deploy them

Also we can observe the run from terraform cloud, we are given the link once the plan and once the apply begins:

![](/wp-content/uploads/2022/07/TCVScode55.jpg)
![](/wp-content/uploads/2022/07/vsterra3w-1024x568.jpg)

The Cloud Console is showing the Plan phase

While terraform waits for the Yes user input the cloud console can also discard or accept the apply run:

![](/wp-content/uploads/2022/07/vsterra4www.jpg)

The Cloud Console can also confirm or discard the run

In a few minutes we can see our Environment ready to work ! In our example

![](/wp-content/uploads/2022/07/tfcvnet111-1024x248.jpg)

The Rules are in place

![](/wp-content/uploads/2022/07/tfcvnetnsg-1024x320.jpg)

Associated with our Subnet

Now we can erase all the folders that terraform created, among them is the State file, a standstill , a frame of the current config , which can have versions and we can re deploy as is. The state file is now stored only on Terraform Cloud, we can go to States from the Workspace Menu :

![](/wp-content/uploads/2022/07/terrastates12-1024x515.jpg)

We can also download our state file and scrolling down we can see if any changes are there from older runs.

And that's it!

Helpful Links :

- [Quickstart: Install and Configure Terraform | Microsoft Docs](https://docs.microsoft.com/en-us/azure/developer/terraform/quickstart-configure)
- <https://www.terraform.io/cloud-docs>
- [Authenticate Terraform to Azure | Microsoft Docs](https://docs.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash)
- [Backend Type: azurerm | Terraform by HashiCorp](https://www.terraform.io/language/settings/backends/azurerm)
- [What is Infrastructure as Code? - Azure DevOps | Microsoft Docs](https://docs.microsoft.com/en-us/devops/deliver/what-is-infrastructure-as-code)

![](/wp-content/uploads/2022/07/cloud-infrastructure-3409259-2838599.png)

Infrastructure as a Code
