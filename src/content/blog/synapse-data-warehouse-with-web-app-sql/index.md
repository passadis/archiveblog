---
title: "Synapse Data Warehouse with Web App & SQL"
slug: "synapse-data-warehouse-with-web-app-sql"
date: 2023-09-16T21:27:18
author: "editor"
excerpt: "Create a secure Data Warehouse for Data Analysis with Synapse Analytics, Azure SQL and Web APP Service"
categories: ["Azure"]
tags: ["Azure", "Azure SQL", "Cloud", "Python", "WebApps"]
featuredImage: "/wp-content/uploads/2023/09/DataWarehouseSchema.jpg"
originalUrl: "https://archive.cloudblogger.eu/2023/09/16/synapse-data-warehouse-with-web-app-sql/"
wordpressId: 997
---

### Create a secure Data Warehouse for Data Analysis with Synapse Analytics, Azure SQL and Web APP Service

![](/wp-content/uploads/2023/09/FeaturedDataWarehouse-1-1024x576.png)

Welcome to another Cloudblogger post!

Data is the core of our business, data provides insights, and we can create quite interesting visualizations providing added value to our existing Applications and Infrastructure. Azure Ecosystem has a wide range for Data Solutions and Data Warehouse as well as Data Analytics with Azure Synapse Analytics.

As we know, integration allows us to create extremely agile Solutions but also Secure. Azure Private Endpoints takes integration to the backbone while only the required Services are exposed.

Our example has a similar approach. We are running a Poll with an Azure Web App in Python and all data is securely stored in our SQL Database while we will explore how Synapse will ingest the Data and provide analysis and insights ! So let's start !

#### Tools & Deployment

We need an active Azure Subscription and VS Code fully loaded with [Azure Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-node-azure-pack) and Python installed.

Our Architecture is quite straight forward. An Azure Web APP protected by Front Door will serve our Poll and the Data is inserted into an Azure SQL Database. Then Synapse will process the data and provide analysis , even Power Bi visualizations!

#### Deploy

Our Poll is an HTML Web App with four questions for the users. Once they submit the data is securely inserted into our SQL Database . We should create an Azure SQL DB beforehands with locked networks and private endpoint. We need a VNET with 2 Subnets. One will stay dedicated for Azure Web Apps VNET injection and the other to host private endpoints for our Key Vault , SQL and Storage Accounts.

Create a new Azure DB , Serverless SQL (the lower possible Tier) and Create a Table :

![](/wp-content/uploads/2023/09/sql1.jpg)

Azure SQL Serverless

Here is a sample SQL Query to create the Table:

```
CREATE TABLE WebPollResponses (
    ResponseID INT IDENTITY(1,1) PRIMARY KEY,
    Timestamp DATETIME DEFAULT GETDATE(),
    FavoriteFeline VARCHAR(50),
    DreamVacation VARCHAR(50),
    MusicPreference VARCHAR(50),
    MovementMode VARCHAR(50)
);
```

Secure our SQL Server by adding a Private Endpoint and locking down access only from you IP and the VNET Subnets :

![](/wp-content/uploads/2023/09/sql2.jpg)

Azure SQL Firewall

Create an Azure Key Vault and use RBAC for the Web App with **Key Vault Secrets User** role.

Add four secrets , SQL Server, SQL Username , SQL Password and SQL Database.

Create a new Web App from VSCode and select Python10 as the Framework, also create the requirements.txt file.

Now here is our Code for the Web App in Python:

```
#app.py
from flask import Flask, render_template, request, redirect, url_for, flash
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import pyodbc
import os

app = Flask(__name__)
app.secret_key = 'a_secret_key'  # Required for flashing messages

key_vault_url = "https://kvpoller9.vault.azure.net/"
credential = DefaultAzureCredential()

secret_client = SecretClient(vault_url=key_vault_url, credential=credential)

server = secret_client.get_secret("server").value
database = secret_client.get_secret("database").value
username = secret_client.get_secret("sqladmin").value
password = secret_client.get_secret("sqlpass").value
driver = '{ODBC Driver 18 for SQL Server}'

connection_str = f"DRIVER={driver};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    if request.method == 'POST':
        try:
            feline = request.form.get('feline')
            vacation = request.form.get('vacation')
            music = request.form.get('music')
            movement = request.form.get('movement')

            # Insert data into Azure SQL Data Warehouse
            conn = pyodbc.connect(connection_str)
            cursor = conn.cursor()
            query = "INSERT INTO WebPoll (Feline, Vacation, Music, Movement) VALUES (?, ?, ?, ?)"
            cursor.execute(query, (feline, vacation, music, movement))
            conn.commit()
            conn.close()

            flash('Your response has been recorded successfully!', 'success')
        except Exception as e:
            flash(f'An error occurred: {str(e)}', 'danger')
        
        return redirect(url_for('index'))

if __name__ == "__main__":
    app.run()
```

Create a new Web App from VSCode and select Python10 as the Framework, also create the requirements.txt file :

```
#requirements.txt
Flask==2.0.1
pyodbc
gunicorn
flash
azure-keyvault
azure-keyvault-secrets
azure-identity
```

Enable VNET Integration so our Traffic is directed via the Virual Network.Observe that this feature requires a dedicated Subnet so have it ready !

![](/wp-content/uploads/2023/09/webappvnet.jpg)

Make some tests to verify that Polls are insterted into the DB :

![](/wp-content/uploads/2023/09/poll1-1024x725.jpg)

Testing Azure Web App connection to Azure SQL

Great ! We are communicating via Private DNS and Endpoints from our Web App to Azure SQL!

Time to build a new Storage Account as Data Lake Storage V2. It is a Standard procedure, you just have to enable Hierarchial Namespace and create a new Blob for the Synpase Data Lake destination:

![](/wp-content/uploads/2023/09/str1.jpg)

And finally the Synapse Workspace ! We need a new Synapse Workspace with Managed Network enabled, linked to the previous Data Lake Storage. Enable also Private Endpoint and allow Public Access unless you are using a Virtual Machine that can reach the Private Endpoint.

Now the Data part. We must edit the **Integration Runtime** to have Interactive Authoring Enabled and also take care the approval on the Storage Account Private Endpoints needed to access Data Lake Storage via the Managed Private Endpoint :

From Azure Synapse Studio :

![](/wp-content/uploads/2023/09/syn1-1024x305.jpg)

Integration runtime - Interactive Authoring

![](/wp-content/uploads/2023/09/syn2-1024x476.jpg)

Managed Private Endpoints

Before we proceed to create a Linked Service with our Azure SQL, we need a small tweak to allow Synapse Managed Identity to connect to the Database. So from a Query Editor ( Portal, Data Studio etc.) run this :

```
CREATE USER [dsynapse09] FROM EXTERNAL PROVIDER
ALTER ROLE db_owner ADD MEMBER [dsynapse09];
```

Where dsynapse09 would be the name of your Synapse Workspace.

Create a new Linked Service as Azure SQL and enter the required data, you could also use Key Vault , our example is using Managed Identity :

![](/wp-content/uploads/2023/09/syn2a-1024x270.jpg)

New Azure SQL Linked Service

Now, we want to add a Copy Task Pipeline in Synapse so we can have a consistent dataset for our Analysis

Let's go to Home and select Ingest form the middle menu. We are goint to create a new Copy Task , and you can set a Trigger as well or Run Once for test and later make it consistent:

![](/wp-content/uploads/2023/09/syn3a-1024x440.jpg)

The Source would be Azure SQL to our new linked Service :

![](/wp-content/uploads/2023/09/syn3b-1024x514.jpg)

You can also observe the existing data, but we will **use a query** to bring only the interesting Rows:

```
select ResponseID, Feline, Vacation, Music, Movement  from dbo.WebPoll
```

Next select the Destination, our Data Lake Storage where we will declare the sink as a new CSV File :

![](/wp-content/uploads/2023/09/syn3c.jpg)

Have a look here, we provide the Path, which shoud exist, but the filename will be created as the Task completes. Carefully set the option to "Add header to file" if not checked :

![](/wp-content/uploads/2023/09/syn3d.jpg)

Proceed, and make naming changes if you need and watch the Pipeline completes with success. A new CSV should exist in the Data Lake :

![](/wp-content/uploads/2023/09/syn4.jpg)

Select the new CSV and let's run a new SQL query to perform some Data Analysis :

```
-- Combine the results for all categories in a single query using the OPENROWSET function:
WITH PollData AS (
    SELECT *
    FROM OPENROWSET(
            BULK 'https://dlake09.dfs.core.windows.net/datas/mypolldata.csv',
            FORMAT = 'CSV',
            PARSER_VERSION = '2.0',
            FIRST_ROW = 1,
            HEADER_ROW = TRUE
        ) AS [result]
)

SELECT 'Feline' as Category, Feline as Answer, COUNT(Feline) as NumberOfResponses 
FROM PollData 
GROUP BY Feline
UNION ALL
SELECT 'Music', Music, COUNT(Music) 
FROM PollData 
GROUP BY Music
UNION ALL
SELECT 'Vacation', Vacation, COUNT(Vacation) 
FROM PollData 
GROUP BY Vacation
UNION ALL
SELECT 'Movement', Movement, COUNT(Movement) 
FROM PollData 
GROUP BY Movement
ORDER BY Category, NumberOfResponses DESC;
```

Watch the results and make changes to the Chart option :

![](/wp-content/uploads/2023/09/syn4a-1024x442.jpg)
![](/wp-content/uploads/2023/09/syn4b-1024x435.jpg)

Synapse Analytics

Of course we can start a Power Bi Trial and proceed to create advanced visualizations and Interactive Reports ! Here is a a sample for reference :

![](/wp-content/uploads/2023/09/pb2-1024x637.jpg)

Last but not least , activate your Defender Plan ( Free for 30 Days ) on your desired Services :

![](/wp-content/uploads/2023/09/def1-1024x366.jpg)

Defender for Cloud

Azure Front Door or Application Gateway would be the Front End guardian and we can also utilize CDN for faster content delivery in case we expand our App with User personalized data or media and other content. We will dedicate another post for Front Door and Azure Web App Service Integration for this post is already big enough!

#### Final Thoughts

We are great enthusiasts of Azure Cloud Services ! Integration is key as to achieve our goals and build upon our ideas, with Security as a guide and Flexibility as a must ! Azure Services have matured and now Security comes first, especially when Data Analytics needs to be robust and Accessibe, with Real Time ingestion and data tranformation, and Synapse Analytics can do more than that ! Today we saw a small fraction with Integration for our Data Warehouse and Analytics solution.

![](/wp-content/uploads/2023/09/DataWarehouseSchema-1024x576.jpg)

Secure Data Warehouse

*Many thanks to [@liorkamrat](https://thewalkingdevs.io/) for the amazing tutorial on Azure Architecture Designs!* Find the tutorial in [THIS](https://www.youtube.com/watch?v=QR-64mFqhf4&list=PLKp2DTcN5hRE7JAtLRgLDayHhCYXS8hxr&index=2&t=2686s) link
