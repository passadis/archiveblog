---
title: "Service Bus with Container Apps : Part 1"
slug: "service-bus-with-container-apps"
date: 2023-04-25T18:13:04
author: "editor"
excerpt: "How to build a lightning fast user signup Application"
categories: ["Azure", "Devops"]
tags: ["automation", "Azure", "containerapps", "docker", "iac", "servicebus", "terraform"]
featuredImage: "/wp-content/uploads/2023/04/Sbus-2.png"
originalUrl: "https://archive.cloudblogger.eu/2023/04/25/service-bus-with-container-apps/"
wordpressId: 790
---

#### How to build a lightning fast user signup Application

![Terraform and Azure](/wp-content/uploads/2023/05/terraz2-1.png)

### Part 1 : The Terraform files

Welcome to another CloudBlogger post ! This time we are exploring Azure Service Bus lightning fast messaging with a real world example including Container Apps and Azure Functions.

Azure Service Bus is a fully managed enterprise message broker with message queues and publish-subscribe topics (in a namespace). Service Bus is used to decouple applications and services from each other, providing the following benefits:

- Load-balancing work across competing workers
- Safely routing and transferring data and control across service and application boundaries
- Coordinating transactional work that requires a high-degree of reliability

#### What we need:

- An Azure Subscription
- VSCode or your favorite editor
- Terraform
- Docker
- Let's Encrypt Certificate

First things first, create a Service Principal so Terraform can authenticate to Azure

```
az ad sp create-for-rbac --n tform --role Contributor --scopes /subscriptions/00000000-0000-0000-0000-000000000000
```

We are going to need as always our standard files :

- providers.tf
- variables.tf
- terraform.tfvars
- main.tf

So lets create our files to start with, notice we are storing all variables into terraform.tfvars and also label the sp secret as sensitive. Terraform will never show this on the plan or apply tasks :

```
# providers.tf
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.48.0"
    }
  }
}
provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
  subscription_id = "var.azure_subidid"
  tenant_id       = "var.azure_tenantid"
  client_id       = var.azure_clientid
  client_secret   = var.azure_spsecret
}
```

```
# variables.tf
variable "azure_spsecret" {
  description = "SP"
  type        = string
  sensitive = true

}
variable "azure_clientid" {
  description = "AppID"
  type        = string
}
variable "azure_subid" {
    description = "SubscriptionID"
    type        = string
}
variable "azure_tenantid" {
    description = "TenantID"
    type        = string
}
variable  "azure_user" {
  description = "Azure Portal User"
  type = "string"
}
```

```
# terraform.tfvars
#Azure SP Secret
azure_spsecret = "xxxxx"
#Azure  ClientID
azure_clientid = "xxxxxx-xxxx"
#Azure  SubsctiptionID
azure_subid = "xxxxxxxxxx-xxx"
#Azure TenantID
azure_tenantid = "xxxxx-xxxxx"
#Azure User
azure_user = "xxx-xxx-xxx"
```

And of course the main.tf , with all our resources :

```
# main.tf
resource "azurerm_resource_group" "rgroup" {
  name     = "rg-app"
  location = "West Europe"
}
resource "random_string" "str-name" {
  length  = 5
  upper   = false
  numeric = false
  lower   = true
  special = false
}
resource "azurerm_storage_account" "storage" {
  name                     = "st${random_string.str-name.result}01"
  resource_group_name      = azurerm_resource_group.rgroup.name
  location                 = azurerm_resource_group.rgroup.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_log_analytics_workspace" "logs" {
  name                = "Logskp"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "appinsights" {
  name                = "funcinsights"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  workspace_id        = azurerm_log_analytics_workspace.logs.id
  application_type    = "Node.JS"
}

output "instrumentation_key" {
  value     = azurerm_application_insights.appinsights.instrumentation_key
  sensitive = true
}

output "connection_string" {
  value     = azurerm_application_insights.appinsights.connection_string
  sensitive = true
}

resource "azurerm_service_plan" "appsrv" {
  name                = "aplan-${random_string.str-name.result}"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_function_app" "funcapp" {
  name                = "fnc${random_string.str-name.result}"
  location            = azurerm_resource_group.rgroup.location
  resource_group_name = azurerm_resource_group.rgroup.name
  service_plan_id     = azurerm_service_plan.appsrv.id

  storage_account_name       = azurerm_storage_account.storage.name
  storage_account_access_key = azurerm_storage_account.storage.primary_access_key

  functions_extension_version = "~4"
  app_settings = {
    "WEBSITE_RUN_FROM_PACKAGE"               = "1"
    "FUNCTIONS_WORKER_RUNTIME"               = "node"
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.appinsights.connection_string
    "APPINSIGHTS_INSTRUMENTATIONKEY"               = azurerm_application_insights.appinsights.instrumentation_key
  }
  identity {
    type = "SystemAssigned"
  }
  site_config {
    application_stack {
      node_version = "18"
    }
    cors {
      allowed_origins = ["*"]
    }
  }

}

resource "azurerm_resource_group" "rgsbus" {
  name     = "rg-sbus"
  location = "West Europe"
}
resource "azurerm_servicebus_namespace" "sbus" {
  name                = "kpsbus01"
  location            = azurerm_resource_group.rgsbus.location
  resource_group_name = azurerm_resource_group.rgsbus.name
  sku                 = "Standard"
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_servicebus_queue" "squeue" {
  name         = "sbusqueue"
  namespace_id = azurerm_servicebus_namespace.sbus.id

  enable_partitioning = true
}
# Create a KeyVault
data "azurerm_client_config" "current" {}
resource "azurerm_key_vault" "kv1" {
  name                = "kvk${random_string.str-name.result}2"
  location            = azurerm_resource_group.rgsbus.location
  resource_group_name = azurerm_resource_group.rgsbus.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
}

resource "azurerm_key_vault_access_policy" "kvpolicy" {
  key_vault_id = azurerm_key_vault.kv1.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_linux_function_app.funcapp.identity[0].principal_id

  secret_permissions = [
    "Get",
  ]
}
resource "azurerm_key_vault_access_policy" "worker_access_policy" {
  key_vault_id = azurerm_key_vault.kv1.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id

  key_permissions = [
    "Create",
    "Get"
  ]

  secret_permissions = [
    "Set",
    "Get",
    "Delete",
    "Purge",
    "Recover"
  ]
}
resource "azurerm_key_vault_access_policy" "user_access_policy" {
  key_vault_id = azurerm_key_vault.kv1.id

  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = var.azure_user
  secret_permissions = [
    "List",
    "Set",
    "Get",
    "Purge",
    "Recover",
    "Delete",
    "Backup",
    "Restore"
  ]
}

resource "azurerm_container_app_environment" "cappenv" {
  name                       = "contEnvironment"
  location                   = azurerm_resource_group.rgsbus.location
  resource_group_name        = azurerm_resource_group.rgsbus.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
}
resource "azurerm_container_app" "capp" {
  name                         = "c${random_string.str-name.result}001"
  container_app_environment_id = azurerm_container_app_environment.cappenv.id
  resource_group_name          = azurerm_resource_group.rgsbus.name
  revision_mode                = "Single"

  template {
        max_replicas = 5
        min_replicas = 1
    container {
      name   = "webreg01"
      image  = "docker.io/kpassadis/webreg01:v2"
      cpu    = 1.0
      memory = "2Gi"
    }
  }
  ingress {
    allow_insecure_connections = "false"
    external_enabled = "true"
    target_port = 80
    traffic_weight {
    percentage = "100"
    latest_revision = true
    }
  }
}
```

Great ! At this point we have created two resource groups with all the required resources :

- Log Analytics Workspace with Application Insights
- Function App with an App Service Plan (Linux) and Storage Account
- Service Bus Queue
- Key Vault
- Container App with a Docker App ( Simple HTML to POST the HTTP Trigger)

Now, i will make quick reference to the Docker Application. All we need is a Docker File and we can push it to Docker Hub and later call it directly from Container Apps, Pretty cool right ?

So here are the HTML container app elements (index.html ,style.css ,Dockerfile) :

```
index.html
<!DOCTYPE html>  
<html>  
<head>  
    <link rel="stylesheet" type="text/css" href="style.css">  
    <style>
      #message {
        margin-top: 20px;
        padding: 10px;
        background-color: lightgray;
        border-radius: 5px;
        text-align: center;
        font-weight: bold;
        display: none;
      }
      /* added CSS */
      .center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    </style>
<script>
async function sendMessage(event) {
    event.preventDefault();
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const nickname = document.getElementById("nickname").value;

    const userData = {
        firstname: firstname,
        lastname: lastname,
        nickname: nickname
    };

    const response = await fetch("https://xxxxx.azurewebsites.net/api/xxxxx", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    const result = await response.json();
    document.getElementById('message').innerText = result.message;

}

    </script>
</head>  
<body>  
<div class="container">
    <form method="post" action="https://xxxxx.azurewebsites.net/api/submit-form" onsubmit="sendMessage(event)">
        <label for="firstname">First Name</label>
        <input type="text" id="firstname" name="firstname" required>
        
        <label for="lastname">Last Name</label>
        <input type="text" id="lastname" name="lastname" required>
        
        <label for="nickname">Nickname</label>
        <input type="text" id="nickname" name="nickname" required>
        
        <button type="submit">Submit</button>
    </form>
</div>
<div id="message"></div>

</body>  
</html>
```

```
style.css
body {
    font-family: Arial, sans-serif;
    background-color: #cce6ff;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.container {
    background-color: #0073e6;
    padding: 2rem;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
    width: 400px;
}

form {
    display: flex;
    flex-direction: column;
}

label {
    font-weight: bold;
    margin-bottom: 0.5rem;
}

input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 3px;
}

button {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}
------------------------------------------------
Dockerfile
FROM nginx:stable-alpine
COPY . /usr/share/nginx/html
```

It is quite simple to publish the image on Docker Hub via VSCode :

We need NGINX that's why our Dockerfile is as it is, and 3 simple steps:

- **docker build -t myapp:v1 .**
- **docker login**
- **docker push myusername/myapp:v1**

I won't dive deeper into Docker but it is that simple! You can validate also with a local run {**docker run --name test-container -p 8080:80 -d myusername/myapp:v1**}, and all documentation is available at <https://docs.docker.com/get-started/>.

Now prepare a [Let's Encrypt certificate with you custom Domain](https://certbot.eff.org/), and stay tuned for Part 2! It is coming very very soon!

![](/wp-content/uploads/2023/04/dockerazure.png)

Docker on Azure Container Apps
