---
title: "Terraform: Randomness as a Service"
slug: "terraform-randomness-as-a-service"
date: 2023-08-04T21:54:03
author: "editor"
excerpt: "Native ways to create random values in your Terraform code!"
categories: ["Azure", "Devops"]
tags: ["Azure", "Cloud", "iac", "terraform"]
featuredImage: "/wp-content/uploads/2023/08/rand-1.jpg"
originalUrl: "https://archive.cloudblogger.eu/2023/08/04/terraform-randomness-as-a-service/"
wordpressId: 947
---

## Native ways to create random values in your Terraform code!

![](/wp-content/uploads/2023/08/rand-1.jpg)

Welcome to another Cloudblogger post ! Summer is heating up and we are searching ways to cool down, so grab a cool drink, and hop in today's post about randomness and Terraform!

> randomness: **the quality or state of being or seeming random** (as in lacking or seeming to lack a definite plan, purpose, or pattern)
>
> https://www.merriam-webster.com/dictionary/randomness

It is a common issue when it comes to coding, particularly in Terraform, when we need to create our resources in Azure for example and just have a random string or number or both as a helper for naming.

Most deployments should have a persistent naming convention pattern ( have a look at this great post by @[George Markou](https://www.markou.me/) , [Generate Resource Names using Bicep and Azure Naming Tool](https://www.markou.me/2023/07/programmatically-generate-resource-names-with-bicep-and-azure-naming-tool-v2/) ), but there are cases where we want randomness. We need random names, strings , IDs or numbers and we prefer to have a standard block within Terraform to do that.

Well, look no further here are the random resources by Terraform to assist :

#### random\_id (Resource)

The resource `random_id` generates random numbers that are intended to be used as unique identifiers for other resources.

This resource *does* use a cryptographic random number generator in order to minimize the chance of collisions, making the results of this resource when a 16-byte identifier is requested of equivalent uniqueness to a type-4 UUID.

This resource can be used in conjunction with resources that have the `create_before_destroy` lifecycle flag set to avoid conflicts with unique names during the brief period where both the old and new resources exist concurrently.

*Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id)*

Let's have an example here with random\_id.

```
main.tf

# Random ID
resource "random_id" "ran_id" {
  prefix = 'az-"
  byte_length = 4
}

resource "azurerm_resource_group" "rgroup" {
  name     = "rg-${random_id.ran_id.hex}"
  location = "North Europe"
}
```

Now when we apply we can see all the available Schema properties, and when we destroy we have an output of the values of the available properties since they have been applied into our configuration, regardless which one we actually used.

```
  # azurerm_resource_group.rgroup will be created
  + resource "azurerm_resource_group" "rgroup" {
      + id       = (known after apply)
      + location = "northeurope"
      + name     = (known after apply)
    }

  # random_id.ran_id will be created
  + resource "random_id" "ran_id" {
      + b64_std     = (known after apply)
      + b64_url     = (known after apply)
      + byte_length = 4
      + dec         = (known after apply)
      + hex         = (known after apply)
      + id          = (known after apply)
      + prefix      = "az-"
    }
```

```
  # azurerm_resource_group.rgroup will be destroyed
  - resource "azurerm_resource_group" "rgroup" {
      - id       = "/subscriptions/d33b3162-55d5-4c85-8ee7-b3ddd1a391ae/resourceGroups/rg-az-496aae9d" -> null
      - location = "northeurope" -> null
      - name     = "rg-az-496aae9d" -> null
      - tags     = {} -> null
    }

  # random_id.ran_id will be destroyed
  - resource "random_id" "ran_id" {
      - b64_std     = "az-SWqunQ==" -> null
      - b64_url     = "az-SWqunQ" -> null
      - byte_length = 4 -> null
      - dec         = "az-1231728285" -> null
      - hex         = "az-496aae9d" -> null
      - id          = "SWqunQ" -> null
      - prefix      = "az-" -> null
    }
```

There is also the keepers value available for **random\_id**. The `keepers` value allows you to specify a set of key-value pairs that are used to uniquely identify a resource instance. When the values of the keepers are changed, Terraform will recreate the resource instance to reflect the new values.

Here's an example of using **`keepers`** with an Azure resource:

```
locals {
  rg_location = "eastus"
}

resource "random_id" "rg_name" {
  length = 8
  prefix = "rg-"
}

resource "azurerm_resource_group" "example" {
  name     = random_id.rg_name.hex
  location = local.rg_location

  # Use keepers to identify the resource instance
  keepers = {
    rg_location = local.rg_location
  }
}
```

In this example, we're using the `keepers` value to identify the `azurerm_resource_group` resource instance based on the `rg_location` variable. If the value of `rg_location` changes, Terraform will recreate the resource group to reflect the new location.

You can specify multiple key-value pairs in the `keepers` value to create a more complex identifier for the resource instance. For example, you could use a combination of region, environment, and application name to uniquely identify a resource instance.

#### random\_integer (Resource)

The resource `random_integer` generates random values from a given range, described by the `min` and `max` attributes of a given resource.

This resource can be used in conjunction with resources that have the `create_before_destroy` lifecycle flag set, to avoid conflicts with unique names during the brief period where both the old and new resources exist concurrently.

*Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/integer)*

The `random_integer` resource in Terraform can be used to generate a random integer within a specified range. This can be useful for generating unique IDs or other numeric values in your Terraform configuration. Here's an example:

```
resource "random_integer" "example" {
  min = 100
  max = 999
}

output "random_number" {
  value = random_integer.example.result
}
```

In this example, we're using the `random_integer` resource to generate a random integer between 100 and 999. We can then use the `output` block to display the generated integer. Each time you run `terraform apply`, the `random_integer` resource will generate a new random integer within the specified range.

You can customize the range of the generated integer by modifying the `min` and `max` values in the `random_integer` resource. You can also use the `keepers` value to trigger a recreate of the resource instance when certain values change, just like with the `random_id` resource.

#### random\_password (Resource)

Identical to random\_string with the exception that the result is treated as sensitive and, thus, *not* displayed in console output.

This resource *does* use a cryptographic random number generator.

Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/password)

```
resource "random_password" "example" {
  length = 16
  special = true
}

resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "West Europe"
}

resource "azurerm_mysql_server" "example" {
  name                = "example-mysqlserver"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name

  administrator_login          = "mysqladminun"
  administrator_login_password = random_password.example.result # This is the password generated above

  sku_name   = "B_Gen5_2"
  storage_mb = 5120
  version    = "5.7"

  auto_grow_enabled                 = true
  backup_retention_days             = 7
  geo_redundant_backup_enabled      = true
  infrastructure_encryption_enabled = true
  public_network_access_enabled     = false
  ssl_enforcement_enabled           = true
  ssl_minimal_tls_version_enforced  = "TLS1_2"
}

resource "azurerm_mysql_configuration" "example" {
  name                = "interactive_timeout"
  resource_group_name = azurerm_resource_group.example.name
  server_name         = azurerm_mysql_server.example.name
  value               = "600"
}
```

In this example, we're using the `random_password` resource to generate a random password string with a length of 16 characters and special characters included. We're then using the `result` attribute of the **`random_password`** resource to set the `administrator_password` property of Azure MySQL.

This ensures that the password is unique and randomly generated!

#### **random\_pet (Resource)**

The resource `random_pet` generates random pet names that are intended to be used as unique identifiers for other resources.

This resource can be used in conjunction with resources that have the `create_before_destroy` lifecycle flag set, to avoid conflicts with unique names during the brief period where both the old and new resources exist concurrently.

Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/pet)

```
resource "random_pet" "example" {
  length = 2 # Number of words that for the Pet Name
  prefix = "rg-"  # A prefix can be set as well
}

resource "azurerm_resource_group" "rgdemo" {
  name     = "${random_pet.example.id}"
  location = "northeurope"
}
```

Quite useful randomness for Dev/Test deployments to have quick and consistent strings for naming our resources. As we can see the resource has a separator default to "-".

```
# azurerm_resource_group.rgdemo will be destroyed
  - resource "azurerm_resource_group" "rgdemo" {
      - id       = "/subscriptions/d33b3162-55d5-4c85-8ee7-b3ddd1a391ae/resourceGroups/rg-willing-python" -> null
      - location = "northeurope" -> null
      - name     = "rg-willing-python" -> null
      - tags     = {} -> null
    }

  # random_pet.example will be destroyed
  - resource "random_pet" "example" {
      - id        = "rg-willing-python" -> null
      - length    = 2 -> null
      - prefix    = "rg" -> null
      - separator = "-" -> null
    }
```

We can customize the length of the generated pet name by modifying the `length` value in the `random_pet` resource. We can also use the `keepers` value to trigger a recreate of the resource instance when certain values change, just like with the `random_id` and `random_integer` resources.

#### random\_shuffle (Resource)

The resource `random_shuffle` generates a random permutation of a list of strings given as an argument.

Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/shuffle)

The `random_shuffle` resource in Terraform can be used to shuffle a list of values and select a random subset of those values. Here's an example of using `random_shuffle` with Azure availability zones:

```
variable "zones" {
  default = ["1", "2", "3"]
}

resource "random_shuffle" "example" {
  input = var.zones
}

resource "azurerm_availability_set" "example" {
  name                = "example-as"
  location            = "eastus"
  resource_group_name = "example-rg"
  managed             = true
  platform_update_domain_count = 5
  platform_fault_domain_count = 3
  availability_zone = slice(random_shuffle.example.result, 0, 2)
}
```

In this example, we're using the `random_shuffle` resource to shuffle the list of availability zones specified in the `zones` variable, and then select a random subset of two zones. We're then using the `slice` function to select the first two values from the shuffled list, and using those values as the `availability_zone` property for the `azurerm_availability_set` resource.

This ensures that the availability zones for the availability set are randomly selected each time the Terraform configuration is applied, which can help distribute your resources across multiple zones for increased availability.

You can modify the `input` value in the `random_shuffle` resource to specify a different list of values to shuffle. You can also modify the `slice` function to select a different number of values from the shuffled list.

#### random\_string (Resource)

The resource `random_string` generates a random permutation of alphanumeric characters and optionally special characters.

This resource *does* use a cryptographic random number generator.

Historically this resource's intended usage has been ambiguous as the original example used it in a password. For backwards compatibility it will continue to exist. For unique ids please use [random\_id](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/id), for sensitive random values please use [random\_password](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/password).

Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/string)

The random\_string is useful when we need random strings, especially with resources which need unique names. It has various control elements on the created string such as :

```
resource "random_string" "example" {
  length  = 12
  special = true
}

resource "azurerm_storage_account" "example" {
  name                     = "example${random_string.example.result}"
  resource_group_name      = "example-rg"
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "GRS"
}
```

In this example, we're using the `random_string` resource to generate a random string of 12 characters with special characters included. We're then using the `result` attribute of the `random_string` resource to append the generated string to the storage account name. This ensures that the storage account name is unique and doesn't conflict with any existing storage accounts in the same Azure region.

#### random\_uuid (Resource)

The resource `random_uuid` generates random uuid string that is intended to be used as unique identifiers for other resources.

This resource uses [hashicorp/go-uuid](https://github.com/hashicorp/go-uuid) to generate a UUID-formatted string for use with services needed a unique string identifier.

Source: [Terraform Documentation](https://registry.terraform.io/providers/hashicorp/random/latest/docs/resources/uuid)

The `random_uuid` resource in Terraform can be used to generate a random UUID (Universally Unique Identifier) string. UUIDs are designed to be unique across space and time, making them useful for generating unique IDs for resources in your Terraform configuration.

```
resource "random_uuid" "example" {
  keepers = {
    app_name = "example-app"
  }
}

resource "azurerm_storage_account" "example" {
  name                     = "example${random_uuid.example.result}"
  resource_group_name      = "example-rg"
  location                 = "eastus"
  account_tier             = "Standard"
  account_replication_type = "GRS"
}
```

In this example, we're using the `random_uuid` resource to generate a random UUID string. We're then using the `result` attribute of the `random_uuid` resource to append the generated UUID to the storage account name. This ensures that the storage account name is unique and doesn't conflict with any existing storage accounts in the same Azure region.

We're also using the `keepers` value to identify the `random_uuid` resource instance based on the `app_name` value. This means that if the value of `app_name` changes, Terraform will recreate the `random_uuid` resource instance to reflect the new value.

You can use the `keepers` value to trigger a recreate of the resource instance when certain values change, just like with the `random_id`, `random_integer`, `random_pet`, and `random_string` resources.

### Conclusion

Random resources in Terraform provide a powerful way to generate unique values for resources in your infrastructure. By using these resources, you can ensure that your resource names, IDs, and other properties are unique and don't conflict with existing resources.

Terraform provides several built-in random resources, including **`random_id`, `random_integer`, `random_pet`, `random_string`, `random_uuid`, and `random_shuffle`**. Each of these resources has specific use cases and can be customized to fit your needs.

We can use `random_id` to generate a random ID for a resource, `random_integer` to generate a random integer value, `random_pet` to generate a random name, `random_string` to generate a random string, `random_uuid` to generate a random UUID, and `random_shuffle` to shuffle a list of values and select a random subset.

We can also use the `keepers` value to trigger a recreate of the resource instance when certain values change, ensuring that your resources remain unique even as your infrastructure evolves.

```
terraform {
  required_providers {
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
  }
}

provider "random" {
  # Configuration options
}
```
