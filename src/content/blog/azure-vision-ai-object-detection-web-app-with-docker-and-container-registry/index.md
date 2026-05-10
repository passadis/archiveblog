---
title: "Azure Vision AI - Object Detection Web App with Docker and Container Registry"
slug: "azure-vision-ai-object-detection-web-app-with-docker-and-container-registry"
date: 2023-10-06T00:53:30
author: "editor"
excerpt: "Build a Python Container Image and Deploy via Azure Container Registry to Azure Web Apps for Object Detection. Terraform Docker, and Scripts!"
categories: ["Azure", "Devops"]
tags: ["Azure", "Azure AI", "Cognitive Services", "iac"]
featuredImage: "/wp-content/uploads/2023/10/InfraVisionA.jpg"
originalUrl: "https://archive.cloudblogger.eu/2023/10/06/azure-vision-ai-object-detection-web-app-with-docker-and-container-registry/"
wordpressId: 1065
---

## Build a Python Container Image and Deploy via Azure Container Registry to Azure Web Apps for Object Detection. Terraform Docker, and Scripts!

![](/wp-content/uploads/2023/10/InitVision-1024x576.jpg)

Welcome to another post by CloudBlogger!

Before we continue to our post i want to pay my respect and give a loud shout-out to [FeedSpot](https://www.feedspot.com) !

Feedspot is a social feed reader compiling news feeds from online sources that users can customize and share with other social network users. It helps to keep up with multiple websites in one place. It keeps up favorite websites as easy as checking email. It helps to automate workflow and make life easier. As of today most of [user reviews are 5 stars](https://www.cuspera.com/products/feedspot-x-7279), and you can try it for yourself, so go ahead and come back for today's very interesting post!

## Intro

Our era is marked by amazing achievements and groundbreaking technologies. Artificial Intelligence is one of them and Cloud Vendors have been investing widely on new innovations making AI twice as powerful and also **reachable**! Azure AI Services ( Cognitive Services ) are on the front line delivering a range of Products accessible, for novice and experienced users, for Development and Production.

Today we are exploring Azure AI Vision with Computer Vision API integrated in our Web App for object detection. The approach expands to the use of Azure Container Registry for Web Apps and we build a Python application with Flask, containerize it with Docker and configure Continuous Deployment with Webhooks. So let's start !

## Deployment

This is a deployment with terraform, so let's have a look. We need our code editor, in our case VSCode and our standard files. It is quite a big deployment but IaC is here to help!

Here is our Terraform file i will dipslay only the main.tf , since we have seen a lot of Terraform in our blog (Reference : [Service Bus with Container Apps : Part 1 – CloudBlogger@2023](https://www.cloudblogger.eu/2023/04/25/service-bus-with-container-apps/))

So since the structure is standard here is our very interesting main.tf :

```
# Create Local Variables to use later, execute bash script
locals {
  storage_account_url         = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net/"
  cognitive_services_endpoint = azurerm_cognitive_account.cvision.endpoint
  vision_api_key              = azurerm_cognitive_account.cvision.primary_access_key
  acr_url                     = "https://${azurerm_container_registry.acr.login_server}/"
  ftp_username                = data.external.ftp_credentials.result["username"]
  ftp_password                = data.external.ftp_credentials.result["password"]
}
data "external" "ftp_credentials" {
  program = ["bash", "${path.module}/find.sh"]
  depends_on = [azurerm_linux_web_app.webapp]
}

output "ftp_username" {
  value     = data.external.ftp_credentials.result["username"]
  sensitive = true
}

output "ftp_password" {
  value     = data.external.ftp_credentials.result["password"]
  sensitive = true
}

# Create Randomness
resource "random_string" "str-name" {
  length  = 5
  upper   = false
  numeric = false
  lower   = true
  special = false
}

# Create a resource group
resource "azurerm_resource_group" "rgdemo" {
  name     = "rg-webvideo"
  location = "northeurope"
}

# Create virtual network
resource "azurerm_virtual_network" "vnetdemo" {
  name                = "vnet-demo"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
}

# Create 2 subnets
resource "azurerm_subnet" "snetdemo" {
  name                 = "snet-demo"
  address_prefixes     = ["10.0.1.0/24"]
  virtual_network_name = azurerm_virtual_network.vnetdemo.name
  resource_group_name  = azurerm_resource_group.rgdemo.name
  service_endpoints    = ["Microsoft.Storage", "Microsoft.ContainerRegistry", "Microsoft.CognitiveServices"]
}

resource "azurerm_subnet" "snetdemo2" {
  name                 = "snet-demo2"
  address_prefixes     = ["10.0.2.0/24"]
  virtual_network_name = azurerm_virtual_network.vnetdemo.name
  resource_group_name  = azurerm_resource_group.rgdemo.name
  service_endpoints    = ["Microsoft.Storage", "Microsoft.ContainerRegistry", "Microsoft.CognitiveServices"]
  delegation {
    name = "delegation"
    service_delegation {
      name = "Microsoft.Web/serverFarms"
    }
  }
}

# Create a Storage Account 
resource "azurerm_storage_account" "storage" {
  name                     = "s${random_string.str-name.result}01"
  resource_group_name      = azurerm_resource_group.rgdemo.name
  location                 = azurerm_resource_group.rgdemo.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create a Container
resource "azurerm_storage_container" "blob" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "container"
}

# Create Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                          = "azr${random_string.str-name.result}"
  resource_group_name           = azurerm_resource_group.rgdemo.name
  location                      = azurerm_resource_group.rgdemo.location
  sku                           = "Premium"
  admin_enabled                 = true
  data_endpoint_enabled         = true
  public_network_access_enabled = true
  network_rule_set {
    default_action = "Deny"
    ip_rule {
      action   = "Allow"
      ip_range = "4.210.120.223/32"
    }
  }
}
output "acrname" {
  value = azurerm_container_registry.acr.name
}

# Create an App Service Plan
resource "azurerm_service_plan" "asp" {
  name                = "asp-${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgdemo.name
  location            = azurerm_resource_group.rgdemo.location
  os_type             = "Linux"
  sku_name            = "B3"
}

# WebApp
resource "azurerm_linux_web_app" "webapp" {
  name                = "wv${random_string.str-name.result}"
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
  service_plan_id     = azurerm_service_plan.asp.id
  logs {
    http_logs {
      file_system {
        retention_in_mb   = 35
        retention_in_days = 2
      }
    }
  }
  site_config {
    always_on              = true
    vnet_route_all_enabled = true

    application_stack {
      docker_image_name        = "videoapp:v20"
      docker_registry_url      = local.acr_url
      docker_registry_username = azurerm_container_registry.acr.admin_username
      docker_registry_password = azurerm_container_registry.acr.admin_password
    }
  }
  app_settings = {
    AZURE_ACCOUNT_URL                   = local.storage_account_url
    AZURE_CONTAINER_NAME                = "uploads"
    COMPUTERVISION_ENDPOINT             = local.cognitive_services_endpoint
    COMPUTERVISION_KEY                  = local.vision_api_key
    DOCKER_ENABLE_CI                    = "true"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "true"
    WEBSITE_PULL_IMAGE_OVER_VNET        = "true"
  }

  identity {
    type = "SystemAssigned"
  }
}

# VNET Integration
resource "azurerm_app_service_virtual_network_swift_connection" "vnetintegrationconnection" {
  app_service_id = azurerm_linux_web_app.webapp.id
  subnet_id      = azurerm_subnet.snetdemo2.id
}

# WebHook
resource "azurerm_container_registry_webhook" "whook" {
  actions             = ["push"]
  location            = azurerm_resource_group.rgdemo.location
  name                = "wh${random_string.str-name.result}"
  registry_name       = azurerm_container_registry.acr.name
  resource_group_name = azurerm_resource_group.rgdemo.name
  scope               = "videoapp:v20"
  service_uri         = "https://${local.ftp_username}:${local.ftp_password}@${azurerm_linux_web_app.webapp.name}.scm.azurewebsites.net/api/registry/webhook"
  depends_on          = [azurerm_linux_web_app.webapp]
}

# Create Computer Vision
resource "azurerm_cognitive_account" "cvision" {
  name                  = "ai-${random_string.str-name.result}01"
  location              = azurerm_resource_group.rgdemo.location
  resource_group_name   = azurerm_resource_group.rgdemo.name
  kind                  = "ComputerVision"
  custom_subdomain_name = "ai-${random_string.str-name.result}01"

  sku_name = "F0"
  identity {
    type = "SystemAssigned"
  }
}

# Private DNS
resource "azurerm_private_dns_zone" "blobzone" {
  name                = "privatelink.blob.core.azure.com"
  resource_group_name = azurerm_resource_group.rgdemo.name
}

resource "azurerm_private_endpoint" "blobprv" {
  location            = azurerm_resource_group.rgdemo.location
  name                = "spriv${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgdemo.name
  subnet_id           = azurerm_subnet.snetdemo.id
  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [azurerm_private_dns_zone.blobzone.id]
  }
  private_service_connection {
    is_manual_connection           = false
    name                           = "storpriv"
    private_connection_resource_id = azurerm_storage_account.storage.id
    subresource_names              = ["blob"]
  }
}

resource "azurerm_private_dns_zone_virtual_network_link" "bloblink" {
  name                  = "main"
  resource_group_name   = azurerm_resource_group.rgdemo.name
  private_dns_zone_name = azurerm_private_dns_zone.blobzone.name
  virtual_network_id    = azurerm_virtual_network.vnetdemo.id
}

resource "azurerm_private_dns_zone" "aizone" {
  name                = "privatelink.cognitiveservices.azure.com"
  resource_group_name = azurerm_resource_group.rgdemo.name
}

resource "azurerm_private_endpoint" "visionpriv" {
  location            = azurerm_resource_group.rgdemo.location
  name                = "vis${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgdemo.name
  subnet_id           = azurerm_subnet.snetdemo.id
  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [azurerm_private_dns_zone.aizone.id]
  }
  private_service_connection {
    is_manual_connection           = false
    name                           = "visonpriv"
    private_connection_resource_id = azurerm_cognitive_account.cvision.id
    subresource_names              = ["account"]
  }
}
resource "azurerm_private_dns_zone_virtual_network_link" "ailink" {
  name                  = "main"
  resource_group_name   = azurerm_resource_group.rgdemo.name
  private_dns_zone_name = azurerm_private_dns_zone.aizone.name
  virtual_network_id    = azurerm_virtual_network.vnetdemo.id
}

resource "azurerm_private_dns_zone" "acrzone" {
  name                = "privatelink.azurecr.io"
  resource_group_name = azurerm_resource_group.rgdemo.name
}
resource "azurerm_private_endpoint" "acrpriv" {
  location            = azurerm_resource_group.rgdemo.location
  name                = "acr${random_string.str-name.result}"
  resource_group_name = azurerm_resource_group.rgdemo.name
  subnet_id           = azurerm_subnet.snetdemo.id
  private_dns_zone_group {
    name                 = "default"
    private_dns_zone_ids = [azurerm_private_dns_zone.acrzone.id]
  }
  private_service_connection {
    is_manual_connection           = false
    name                           = "acrpriv"
    private_connection_resource_id = azurerm_container_registry.acr.id
    subresource_names              = ["registry"]
  }
}
resource "azurerm_private_dns_zone_virtual_network_link" "acrlink" {
  name                  = "main"
  resource_group_name   = azurerm_resource_group.rgdemo.name
  private_dns_zone_name = azurerm_private_dns_zone.acrzone.name
  virtual_network_id    = azurerm_virtual_network.vnetdemo.id
}
# Assign RBAC Role to WebApp
data "azurerm_subscription" "current" {}

resource "azurerm_role_assignment" "rbac1" {
  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_web_app.webapp.identity[0].principal_id
}
```

I know we could have broken this one down to separate files per resources by type etc. , but i prefer to have it all in one and understand what we are building here . Most important, this is not a Production deployment no recommended for example without key vault, but we have the opportunity to see some cool features like extracting the FTP Username & password from Azure Web App with a Bash program, and watch the values marked as sensitive never revealed in our console.

So what have we build here ? Let's have a look on our Terraform code to understand better :

We are building an Azure Infrastructure, ready made, connected with all Private Endpoints and Private DNS Zones in place. We have also extracted with a bash script some variables to make a WebHook fully integrated in our code so the only thing we have to do is to build our App and push it to Azure Container Registry ! The Webhook is already in sync with our Web App to push the image, and that's it ! Cool right ?

Our APP is a Python 3.10 Flask Web App exposed by Gunicorn, and let's explain what we are doing here:

We have a simple Web Interface where users can Browse a Video Library (Storage Blob Containers) or upload videos. In the browse page we can see Thumbnails of our Videos and a Button "Analyze' under each Video. Here is the magic ! Once the Analyze is clicked our Python App has already extracted frames of the Video ( n=5sec) and the analysis selects a Frame sends it to our Computer Vision resource ( Azure AI Vision) and Object Detection is performed, bringing the frame into our page with bounding boxes and some text with the detected objects names. We need one small thing to do, build and push our App as a Docker Image to Azure Container Registry, so first login and get the ACR name:

```
az acr login --name $(az acr list -g rg-webvideo --query "[].{name: name}" -o tsv)
az acr list -g rg-webvideo --query "[].{name: name}" -o tsv
```

Then build the Image , tag it and push it :

```
docker build -t videoapp .
docker tag videoapp azruoxwf.azurecr.io/videoapp:v20
docker push azruoxwf.azurecr.io/videoapp:v20
```

Be careful and consistent ! I have my tag set to v20 so you must decide ahead these details that could really mess things up ! So, we have our Image Build , Tagged and Pushed !

Because the dependencies are both ways, we need to make sure that the Web App can pull the Image,so go to Deployment Center and make sure of the setting, if needed set it :

![](/wp-content/uploads/2023/10/depcenter.jpg)

Run once more the **docker push azruoxwf.azurecr.io/videoapp:v20** command and restart the WebApp.

## Object Detection

Start by uploading a Video , 10-20 seconds is enough and go to Browse ( i have to add a button there to go directly ), by returning to home and browse. You will see the Video there with full controls, Press Analyze and there you go :

![](/wp-content/uploads/2023/10/vid1.jpg)

![](/wp-content/uploads/2023/10/vid2.jpg)

![](/wp-content/uploads/2023/10/vid3.jpg)

I suggest a P1V3 Plan or scaling rules starting with 2 x B3 so you wont get nasty fails on the UI, better keep that in mind. Another variation of this Application is to perform Streaming Video analysis, while may looks similar, it is a whole new approach !

I will share the Python code and leave the HTML \ CSS to you!

```
from flask import Flask, render_template, request, redirect, url_for, flash
from azure.storage.blob import BlobServiceClient
from azure.identity import DefaultAzureCredential
from werkzeug.utils import secure_filename
from azure.cognitiveservices.vision.face import FaceClient
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
import requests
import os
import cv2
import io
import logging
import tempfile
import random
import numpy as np

app = Flask(__name__)
app.config['UPLOAD_EXTENSIONS'] = ['.mp4', '.mov', '.avi']
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB
app.secret_key = '1q2w3e4r'
logging.basicConfig(filename='error.log', level=logging.ERROR)
computervision_client = ComputerVisionClient(os.getenv('COMPUTERVISION_ENDPOINT'), CognitiveServicesCredentials(os.getenv('COMPUTERVISION_KEY')))
blob_service_client = BlobServiceClient(account_url=os.getenv('AZURE_ACCOUNT_URL'), credential=DefaultAzureCredential())
vision_api_endpoint = os.getenv('COMPUTERVISION_ENDPOINT')
vision_api_key = os.getenv('COMPUTERVISION_KEY')
vision_client = ComputerVisionClient(vision_api_endpoint, CognitiveServicesCredentials('COMPUTERVISION_KEY'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        filename_with_ext = secure_filename(file.filename)
        filename, file_ext = os.path.splitext(filename_with_ext)
        
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            flash('Invalid file type!')
            return redirect(url_for('upload'))
        
        # Save the file temporarily
        temp_path = os.path.join(tempfile.gettempdir(), filename_with_ext)  # Use filename with extension for temp save
        file.save(temp_path)

        container_client = blob_service_client.get_container_client(os.getenv('AZURE_CONTAINER_NAME'))
        blob_client = container_client.get_blob_client(filename_with_ext)
        
        try:
            # Save video to Blob Storage
            with open(temp_path, 'rb') as f:
                blob_client.upload_blob(f, overwrite=True)
            
            # Open the video file from temporary location
            cap = cv2.VideoCapture(temp_path)
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
            # Set the time interval (in seconds)
            time_interval = 5
    
            # Calculate the total number of intervals
            num_intervals = frame_count // (fps * time_interval)
            # Loop through each interval and save the corresponding frame
            for i in range(num_intervals + 1):  # +1 to include the last frame
                frame_number = i * time_interval * fps
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
                ret, frame = cap.read()
            
                if ret:
                    _, buffer = cv2.imencode('.jpg', frame)
                    img_byte_io = io.BytesIO(buffer)
            
                    frame_blob_name = f"{filename}/frame_{frame_number}.jpg"
                    frame_blob_client = container_client.get_blob_client(frame_blob_name)
            
                    frame_blob_client.upload_blob(img_byte_io, overwrite=True)
            
            cap.release()
            os.remove(temp_path)  # Remove the temporary file once done
            
            flash('File and frames uploaded successfully')  
        except Exception as e:        
            flash(f'An error occurred: {e}')
            return redirect(url_for('upload'))

        return redirect(url_for('upload'))

    flash('No file uploaded')
    return redirect(url_for('upload'))
def get_video_urls():
    container_client = blob_service_client.get_container_client(os.getenv('AZURE_CONTAINER_NAME'))
    blob_list = container_client.list_blobs()

    # Only fetch .mp4 files
    video_urls = [container_client.get_blob_client(blob.name).url for blob in blob_list if blob.name.endswith('.mp4')]
    return video_urls

@app.route('/browse')
def browse():
    video_urls = get_video_urls()
    return render_template('browse.html', video_urls=video_urls)

@app.route('/analyze', methods=['POST'])
def analyze_video():
    video_url = request.form.get('video_url')
    video_basename = os.path.basename(video_url).split('.')[0]

    container_client = blob_service_client.get_container_client(os.getenv('AZURE_CONTAINER_NAME'))
    blob_list = list(container_client.list_blobs(name_starts_with=video_basename))

    if not blob_list:
        flash('No frames found for the video.')
        return redirect(url_for('browse'))

    random_frame_blob = random.choice(blob_list)
    frame_blob_client = container_client.get_blob_client(random_frame_blob.name)
    frame_bytes = io.BytesIO(frame_blob_client.download_blob().readall())
    img_arr = np.frombuffer(frame_bytes.getvalue(), dtype=np.uint8)
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)

    analysis = computervision_client.analyze_image_in_stream(frame_bytes, visual_features=[VisualFeatureTypes.objects])

    detected_objects = []
    for detected_object in analysis.objects:
        # Draw bounding boxes around detected objects
        left = detected_object.rectangle.x
        top = detected_object.rectangle.y
        right = left + detected_object.rectangle.w
        bottom = top + detected_object.rectangle.h
        label = detected_object.object_property
        confidence = detected_object.confidence

        # Draw rectangle and label
        color = (255, 0, 0)
        cv2.rectangle(img, (left, top), (right, bottom), color, 2)
        font = cv2.FONT_HERSHEY_SIMPLEX
        label_size = cv2.getTextSize(label, font, 0.5, 2)[0]
        cv2.rectangle(img, (left, top - label_size[1] - 10), (left + label_size[0], top), color, -1)
        cv2.putText(img, f"{label} ({confidence:.2f})", (left, top - 5), font, 0.5, (255, 255, 255), 2)

        detected_objects.append({
            'label': label,
            'confidence': confidence
        })

    # Convert image back to bytes to store in blob storage
    _, buffer = cv2.imencode('.jpg', img)
    img_byte_io = io.BytesIO(buffer)

    # Upload the result image to the Blob storage
    result_blob_name = f"{video_basename}/analyzed_frame.jpg"
    result_blob_client = container_client.get_blob_client(result_blob_name)
    result_blob_client.upload_blob(img_byte_io, overwrite=True)
    video_urls = get_video_urls()
    # Send analysis results to the template
    analysis_results = {
    'analyzed_video_url': video_url,  # The URL of the video that was analyzed
    'img_url': result_blob_client.url,  # The URL of the analyzed frame
    'objects': detected_objects  # Detected objects and their details
    }
  
    return render_template('browse.html', video_urls=video_urls, analysis_results=analysis_results)

if __name__ == '__main__':
    app.run(debug=True)
```

## Architecture

This Project was very challenging, a lot of hours and many times came to almost give up ! Anyway...

Here is the main idea as an Architecture, of course we can step much further with Storage Blob Lifecycle Policies for those Videos, Front Door etc.

![](/wp-content/uploads/2023/10/InfraVisionA-1024x576.jpg)

## Closing

I love to work on ideas like this on Azure, and my limits are always pushed. But the final results are always more than rewarding, with Azure being such an amazing platform with strong dynamics, always evolving and taking us along for the ride, the experiences and to learn new things.

References:

- [Azure AI Vision - Computer Vision](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
- [Image Build Automation](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tutorial-build-task)
- [Cognitive Services - Computer Vision API](https://learn.microsoft.com/en-us/samples/azure/azure-quickstart-templates/cognitive-services-computer-vision-api/)
- [Quickstart - Python Web APP on App Service](https://learn.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=flask%2Cwindows%2Cazure-cli%2Cvscode-deploy%2Cdeploy-instructions-azportal%2Cterminal-bash%2Cdeploy-instructions-zip-azcli)
