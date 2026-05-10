---
title: "Terraform Modules 2: Advancing Your Expertise With Better Configurations"
slug: "introduction-to-terraform-modules-2"
date: 2024-02-26T13:07:34
author: "editor"
excerpt: "Introduction to Terraform Modules Part 2: Advanced Configurations for your Infrastructure as Code deployments"
categories: ["Azure", "Devops"]
tags: ["automation", "Azure", "iac", "terraform"]
featuredImage: "/wp-content/uploads/2024/02/tf-modules.png"
originalUrl: "https://archive.cloudblogger.eu/2024/02/26/introduction-to-terraform-modules-2/"
wordpressId: 1481
---

## Terraform Modules Part 2: Advanced Configurations

![Terraform Modules Intro](/wp-content/uploads/2024/02/tf-modules.png)

### Introduction

Welcome to Terraform Modules Part 2

In our previous entry, "Introduction to Terraform Modules," we discussed the foundational aspects of Terraform modules. Building upon that, this post dives into more sophisticated Terraform configurations, specifically tailored for Azure infrastructure and the Cloud Adoption Framework (CAF) modules.

Azure's cloud services offer a broad range of features and complexities. To manage these effectively, Terraform modules, especially those designed for Azure, become invaluable tools. This post will explore advanced module sourcing, intricate input variables, output values, and module composition strategies, with a particular focus on Azure and CAF Modules. Whether you're a cloud architect, a DevOps engineer, or an IT professional working with Azure, these insights will help you navigate the complexities of Azure infrastructure with Terraform.

### Azure-Specific Module Sources

Terraform's flexibility extends to Azure, offering specialized modules that cater to Azure's unique infrastructure components. These modules simplify the creation and management of Azure resources, ensuring consistency and best practices.

**Azure Modules from Terraform Registry:** The Terraform Registry hosts a variety of Azure-specific modules. These modules are community-driven and often maintained by experts in Azure infrastructure. They cover a wide range of Azure services and are versioned for reliable deployment.

```
module "azure_network" {
  source  = "Azure/network/azurerm"
  version = "2.3.0"
}
```

**Azure GitHub Repositories:** Microsoft and the Azure community provide a wealth of modules on GitHub. These often include modules that align with the Azure Cloud Adoption Framework (CAF), offering a structured approach to building a cloud environment.

```
module "caf_foundations" {
  source = "github.com/Azure/caf-terraform-landingzones"
}
```

**CAF Modules:** The Cloud Adoption Framework for Azure provides best practices and guidance for cloud environments. The associated Terraform modules help implement these practices, ensuring that your infrastructure aligns with Azure's recommended architectures.

```
module "caf_enterprise_scale" {
  source  = "Azure/caf-enterprise-scale/azurerm"
  version = "0.3.1"
}
```

### Advanced Input Variables for Azure Modules

When dealing with Azure resources in Terraform, the complexity and variety of the infrastructure often require advanced input variable techniques. This section explores strategies to efficiently handle these variables, enhancing modularity and reusability.

**Complex Variable Types:** Azure modules may require complex variables, such as lists, maps, and objects, to configure resources like networks, virtual machines, and storage. For instance, defining a network module might require a complex object to specify multiple subnet configurations:

```
variable "subnets" {
  type = list(object({
    name          = string
    address_range = string
  }))
}
```

**Default Values and Validation:** Providing default values and adding validation rules to variables can prevent errors and streamline module usage. For example, setting default sizes for virtual machines and validating against accepted values ensures that the infrastructure adheres to organizational standards.

```
variable "vm_size" {
  type        = string
  default     = "Standard_DS1_v2"
  description = "The size of the virtual machine"
  
  validation {
    condition     = contains(["Standard_DS1_v2", "Standard_DS2_v2"], var.vm_size)
    error_message = "Invalid VM size. Must be Standard_DS1_v2 or Standard_DS2_v2."
  }
}
```

**Organizing Variables in Large Projects:** In extensive Azure deployments, organizing variables becomes crucial. Grouping related variables into separate files (like `network.tfvars`, `vm.tfvars`) and using Terraform's `workspace` feature can help manage different environments (development, staging, production) with distinct configurations.

### Leveraging Output Values in Azure Modules

Output values in Terraform are instrumental in organizing and interconnecting various parts of your Azure infrastructure. They enable the sharing of information between modules, making your configurations more dynamic and interconnected.

**Sharing Resource Information:** Outputs from one module can be used as inputs to another, creating a cohesive infrastructure setup. For example, the output of a network module can be used to configure the networking settings of a virtual machine module.

```
output "subnet_id" {
  value = azurerm_subnet.example.id
}

module "vm" {
  source    = "./modules/vm"
  subnet_id = module.network.subnet_id
}
```

**Conditional Outputs:** In complex deployments, you might only want to output certain information based on specific conditions. Utilizing Terraform's conditional expressions can tailor the output to the current deployment scenario.

```
output "public_ip_address" {
  value = var.create_public_ip ? azurerm_public_ip.example.ip_address : ""
}
```

**Structured Outputs for Complex Data:** When modules output complex data structures (like lists or maps), these can be used to provide comprehensive information about the deployed resources, such as a list of VM IDs or a map of storage account URLs.

### Module Composition with Azure and CAF Modules

In Terraform, module composition and nesting are powerful strategies for building sophisticated and scalable Azure infrastructures. This approach, especially when combined with the Cloud Adoption Framework (CAF) modules, allows for creating highly customizable and robust environments.

**Composing Modules for a Unified Infrastructure:** By composing different modules, such as networking, compute, and storage, you can build a complete Azure environment. This modular approach ensures each component is manageable and reusable. For instance, you might use a networking module together with a VM module to create a basic infrastructure:

```
module "network" {
  source  = "./modules/network"
  # network-specific variables
}

module "vm" {
  source    = "./modules/vm"
  subnet_id = module.network.subnet_id
  # other VM-specific variables
}
```

**Leveraging CAF Modules for Enterprise-Scale Solutions:** The CAF modules are designed to implement the Cloud Adoption Framework practices, helping you create enterprise-scale solutions in Azure. They cover a broad range of Azure's capabilities and are aligned with best practices for governance, security, and compliance.

For example, the `caf_enterprise_scale` module can be used to set up landing zones that are compliant with your organization's policies and cloud adoption plans:

```
module "caf_enterprise_scale" {
  source  = "Azure/caf-enterprise-scale/azurerm"
  root_parent_id      = var.root_parent_id
  root_management_grp = var.root_management_grp
  # other configuration variables
}
```

**Nested Module Configurations for Complex Scenarios:** For more complex scenarios, you can nest modules within other modules. This is particularly useful when you have repetitive patterns in your infrastructure or when you want to encapsulate specific functionalities.

For example, a VM module might internally use a smaller module for configuring each disk attached to the VMs, abstracting away the complexity from the main configuration.

### Conclusion

Throughout this post, we've delved into advanced configurations for Terraform Modules with a focus on Azure and the Cloud Adoption Framework. We've covered Azure-specific module sources, advanced input variables, output value optimization, and the art of module composition and nesting.

The journey to mastering Terraform in Azure is ongoing and requires continual learning and experimentation. With these advanced techniques, you're well-equipped to tackle more complex Azure infrastructures, ensuring your deployments are efficient, scalable, and align with best practices.

We encourage you to explore these concepts further in your Terraform projects. The more you experiment and apply these advanced configurations, the more proficient you'll become in managing Azure infrastructures with Terraform.

#### References

- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Module Creation](https://developer.hashicorp.com/terraform/tutorials/modules/pattern-module-creation)
- [Using Modules](https://developer.hashicorp.com/terraform/language/modules#using-modules)
- [Developing Modules](https://developer.hashicorp.com/terraform/language/modules/develop)

![Terraform Modules footer](/wp-content/uploads/2024/02/tf-modules.png)
