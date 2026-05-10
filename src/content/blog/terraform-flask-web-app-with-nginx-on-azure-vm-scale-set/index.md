---
title: "Terraform: Flask Web App with NGINX on Azure VM Scale Set"
slug: "terraform-flask-web-app-with-nginx-on-azure-vm-scale-set"
date: 2023-04-02T12:25:50
author: "editor"
excerpt: "Terraform: Flask Web App with NGINX on Azure VM Scale Set"
categories: ["Azure"]
tags: ["Azure", "iac", "terraform", "vmss"]
featuredImage: "/wp-content/uploads/2023/04/Flaskv2.png"
originalUrl: "https://archive.cloudblogger.eu/2023/04/02/terraform-flask-web-app-with-nginx-on-azure-vm-scale-set/"
wordpressId: 775
---

#### Introduction

The need to deploy quickly and provide simplified management and flexible configurations has increased drastically. Businesses and engineering teams need the ability to deploy , test , destroy and re apply , so they can save costs and also be able to test and make adjustments. Infrastructure as Code has introduced this ability with rapid deployments over any resource or technology and Azure is one of them.

Our scenario is the deployment of a Flask Server with Gunicorn and NGINX on Azure Scale Set and we are using Terraform. We will also see the use of Cloud Init for our Linux Scale Set and how easy has become to build our test environment with all the required variables and focus on the result rather than the deployment itself!

#### Prerequisites

We are going to use :

- Azure Subscription
- Terraform
- VSCode

#### Architecture

Our Architecture is quite straightforward. We will deploy a Linux Scale Set, with Cloud Init scripts that build a Flask Web App with Gunicorn and NGINX, a Standard Load Balancer with NAT rules for management (optional) and Load Balancing rules, an Azure Key Vault to store the Linux SSH key and later the Certificate for HTTPs, NSG and our Public IP!

![](/wp-content/uploads/2023/04/Flaskv2-1024x766.png)

VMSS for Flask with NGINX

#### Terraform

First of all we need a Service Principal with Contributor rights on our Subscription.

**az ad sp create-for-rbac --name myServicePrincipalName \ --role Contributor \ --scopes /subscriptions/xxxxxxxxxxxx-xxxx-xxxxxxx**

Keep the exported data for Terraform input variables.

We are going to need the whole nine yards with main.tf, providers.tf , variables.tf and terraform.tfvars, and of course cloud-init.yaml which makes our deployment much easier by running the code each time a new instance is provisioned.

Lets start with the core, being providers.tf and variables.tf. We can have all Azure References into variables here we have the Service Principal ID (AppID) and the Secret (SP)

```
providers.tf :
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
  subscription_id = "xxxxxxxxxxxxxxxxx"
  tenant_id       = "xxxxxxxxxxxxxxxxx"
  client_id       = var.azure_clientid
  client_secret   = var.azure_spsecret
}
```

```
variables.tf :
variable "azure_spsecret" {
  description = "SP"
  type        = string
}
variable "azure_clientid" {
  description = "AppID"
  type        = string
}
```

Now we need the terraform.tfvars where we store the values and the main.tf were we have all our code:

```
terraform.tfvars : 
#Azure Secrets
azure_spsecret = "xxxxxxxxxxxxxxxx"
#Azure  ClientID
azure_clientid  = "xxxxxxxxxxxxxxxxxxx"
```

```
CLOUD-INIT.YAML : 
#cloud-config
packages:
  - python3-pip
  - nginx
  - software-properties-common
write_files:
  - content: |
      server {
          listen 80;
          server_name flasker.hybridcloud.gr;
          location / {
              proxy_pass http://127.0.0.1:5000;
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          }
      }
    path: /etc/nginx/sites-available/my_flask_app
    permissions: '0644'

  - content: |
      from flask import Flask, render_template

      app = Flask(__name__)

      @app.route('/')
      def index():
          return render_template('index.html')

      if __name__ == '__main__':
          app.run(debug=True, host='0.0.0.0', port=5000)
    path: /home/kpassadis/my_flask_app/app.py
    permissions: '0755'
  - content: |
      <!DOCTYPE html>
      <html lang="en">
      <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Register Form</title>
       <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
      </head>
      <body>
       <div class="container">
         <form action="<FUNCTION_URL>" method="post">
          <h1>Registration App</h1>
            <label for="first-name">First Name</label>
            <input type="text" id="first-name" name="first-name" required>
            
            <label for="last-name">Last Name</label>
            <input type="text" id="last-name" name="last-name" required>
            
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
            
            <button type="submit">Submit</button>
         </form>
       </div>
      </body>
      </html>
    path: /home/kpassadis/my_flask_app/templates/index.html
    permissions: '0644'
  - content: |
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
    path: /home/kpassadis/my_flask_app/static/style.css
    permissions: '0644'
runcmd:
  - sudo add-apt-repository ppa:certbot/certbot -y
  - sudo apt-get update
  - sudo apt-get install certbot python3-certbot-nginx -y
  - sudo pip3 install gunicorn Flask
  - sudo ln -s /etc/nginx/sites-available/my_flask_app /etc/nginx/sites-enabled/
  - sudo rm /etc/nginx/sites-enabled/default || true
  - sudo systemctl restart nginx
  - cd /home/kpassadis/my_flask_app && gunicorn --bind 0.0.0.0:5000 app:app &
```

```
main.tf : 
locals {
  cloud_init = templatefile("${path.module}/cloud-init.yaml", {})
}
# Random String Helper
resource "random_string" "str-name" {
  length  = 5
  upper   = false
  numeric = false
  lower   = true
  special = false
}

# Create a resource group
resource "azurerm_resource_group" "rgdemo" {
  name     = "rg-demo-flask"
  location = "westeurope"
}

# Create virtual network
resource "azurerm_virtual_network" "vnetdemo" {
  name                = "vnet-demo"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
}

# Create a subnet
resource "azurerm_subnet" "snetdemo" {
  name                 = "snet-demo"
  address_prefixes     = ["10.0.1.0/24"]
  virtual_network_name = azurerm_virtual_network.vnetdemo.name
  resource_group_name  = azurerm_resource_group.rgdemo.name
}

# Create a public IP address
resource "azurerm_public_ip" "pipdemo" {
  name                = "pip-demo"
  sku                 = "Standard"
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
  allocation_method   = "Static"
}

# Create a load balancer
resource "azurerm_lb" "lbdemo" {
  name                = "lbdemo"
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "PublicIPAddress"
    public_ip_address_id = azurerm_public_ip.pipdemo.id
  }
}

# Create a backend pool
resource "azurerm_lb_backend_address_pool" "backend" {
  name            = "demo-backend-pool"
  loadbalancer_id = azurerm_lb.lbdemo.id
}

# Create a health probe
resource "azurerm_lb_probe" "demoprobe" {
  name            = "ssh-health-probe"
  protocol        = "Tcp"
  port            = 5000
  loadbalancer_id = azurerm_lb.lbdemo.id
}

# Create a network security group
resource "azurerm_network_security_group" "nsgdemo" {
  name                = "demo-nsg"
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
}

# Create a rule to allow HTTP traffic
resource "azurerm_network_security_rule" "flask-in" {
  name                        = "flask-http-rule"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_ranges     = ["22", "80", "443"]
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.rgdemo.name
  network_security_group_name = azurerm_network_security_group.nsgdemo.name
}
# Associate NSG TO Subnet
resource "azurerm_subnet_network_security_group_association" "nsgassociate" {
  subnet_id                 = azurerm_subnet.snetdemo.id
  network_security_group_id = azurerm_network_security_group.nsgdemo.id
}
# Create a LoadBalancer Rule
resource "azurerm_lb_rule" "lbrule" {
  loadbalancer_id                = azurerm_lb.lbdemo.id
  name                           = "LBRule"
  protocol                       = "Tcp"
  frontend_port                  = 80
  backend_port                   = 80
  probe_id                       = azurerm_lb_probe.demoprobe.id
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.backend.id]
  frontend_ip_configuration_name = "PublicIPAddress"
}
# Create a LoadBalancer Rule 2
resource "azurerm_lb_rule" "lbrule2" {
  loadbalancer_id                = azurerm_lb.lbdemo.id
  name                           = "LBRule2"
  protocol                       = "Tcp"
  frontend_port                  = 443
  backend_port                   = 443
  probe_id                       = azurerm_lb_probe.demoprobe.id
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.backend.id]
  frontend_ip_configuration_name = "PublicIPAddress"
}
# Create a Loab Balancer NAT Pool rule
resource "azurerm_lb_nat_pool" "lbnat" {
  resource_group_name            = azurerm_resource_group.rgdemo.name
  name                           = "ssh"
  loadbalancer_id                = azurerm_lb.lbdemo.id
  protocol                       = "Tcp"
  frontend_port_start            = 8022
  frontend_port_end              = 8025
  backend_port                   = 22
  frontend_ip_configuration_name = "PublicIPAddress"
}
# Create the SSH key
resource "tls_private_key" "dev_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Export Key
output "ssh_key" {
  description = "ssh key generated by terraform"
  value       = tls_private_key.dev_key.private_key_pem
  sensitive   = true
}
# Create a KeyVault
data "azurerm_client_config" "current" {}
resource "azurerm_key_vault" "kv1" {
  name                = "certkv${random_string.str-name.result}"
  location            = azurerm_resource_group.rgdemo.location
  resource_group_name = azurerm_resource_group.rgdemo.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"
}
  resource "azurerm_key_vault_access_policy" "vmss_access_policy" {
    key_vault_id = azurerm_key_vault.kv1.id

    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_linux_virtual_machine_scale_set.vmssdemo.identity[0].principal_id

    certificate_permissions = [
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

# Store SSH to KeyVault
resource "azurerm_key_vault_secret" "privatekey" {
  name         = "private-key"
  value        = tls_private_key.dev_key.private_key_pem
  key_vault_id = azurerm_key_vault.kv1.id
}

# Create a Linux VMSS
resource "azurerm_linux_virtual_machine_scale_set" "vmssdemo" {
  name                            = "flask-vmss"
  resource_group_name             = azurerm_resource_group.rgdemo.name
  location                        = azurerm_resource_group.rgdemo.location
  sku                             = "Standard_B2ms"
  instances                       = 1
  upgrade_mode                    = "Automatic"
  health_probe_id                 = azurerm_lb_probe.demoprobe.id
  admin_username                  = "kpassadis"
  disable_password_authentication = true
  computer_name_prefix            = "srv"
  custom_data                     = base64encode(local.cloud_init)

  identity {
    type = "SystemAssigned"
  }
  admin_ssh_key {
    username   = "kpassadis"
    public_key = tls_private_key.dev_key.public_key_openssh
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  os_disk {
    storage_account_type = "Standard_LRS"
    caching              = "ReadWrite"
  }

  network_interface {
    name    = "flask-nic"
    primary = true

    ip_configuration {
      name                                   = "internal"
      primary                                = true
      subnet_id                              = azurerm_subnet.snetdemo.id
      load_balancer_backend_address_pool_ids = [azurerm_lb_backend_address_pool.backend.id]
      load_balancer_inbound_nat_rules_ids    = [azurerm_lb_nat_pool.lbnat.id]
    }
  }
  depends_on = [azurerm_lb_probe.demoprobe]
}
```

Every resource is very well and clearly documented into [Docs overview | hashicorp/azurerm | Terraform Registry](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs) , so with persistence and some Googling even a novice user can find the way to build!

Save cloud-init.yaml in the same directory as main.tf, and deploy with terraform plan , terraform apply.

Don't forget the terraform init to initialize and download all required providers !

You will notice the Health Probe on port 5000 it is the default Flask port for Web Apps. Also the 8022-8023 is there for direct SSH, of course it is not recommended for Production environments , we can have a Bastion for example, but you can play with the NAT and the LB rules.

That's all! Hit the Public IP with HTTP and there you have it ! A simple Registration form .....that does nothing for now! Play with Scaling and see hoe the VMSS responds to curl requests.

For example create scaling rules for network traffic and use this from a Terminal :

```
while true; do
  curl -s -o /dev/null http://your_endpoint
  sleep 1
done
```

Watch the Instances added while the script is running and removed when the script is stopped!

You can see that we also have 443 port for Load Balancing rules. This is in case we want to get a Lets Encrypt Certificate and Upload it to our Key Vault, but the effort to make it available to all our instances, instructs us to use Front Door or Application Gateway. So we will update this or make a new Post with another approach ( Shared Image Gallery) and the addition of our Certificate!

#### Conclusion

We can do pretty much anything with Terraform and IaC, and today we saw how to deploy our Scale Set in minutes, with a ready to go Flask Web App! Of course this is not intended for Production workloads as we said we need our Certificate for example , but it is a fast way to test our deployments and make our adjustments !

#### Links - References

- [What are Azure VM Scale Sets](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview)
- [Networking in VMSS](https://learn.microsoft.com/en-us/azure/virtual-network/network-overview?toc=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fvirtual-machine-scale-sets%2Ftoc.json&bc=https%3A%2F%2Flearn.microsoft.com%2Fen-us%2Fazure%2Fbread%2Ftoc.json)
- [Cloud-init Overview](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/using-cloud-init)
- [Deploy a Java App to a VM Scale Set](https://learn.microsoft.com/en-us/azure/devops/pipelines/apps/cd/azure/deploy-virtual-scale-set-java?view=azure-devops)

![](/wp-content/uploads/2023/04/VMSS-252x300.png)
