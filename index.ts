import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as storage from "@pulumi/azure-native/storage";
import * as insights from "@pulumi/azure-native/insights";

const resourceGroup = new resources.ResourceGroup("export-config-resourceGroup");

const storageAccountName = `storage${pulumi.getStack()}`;

const storageAccount = new storage.StorageAccount("sa", {
    resourceGroupName: resourceGroup.name,
    kind: "Storage",
    sku: {
        name: "Standard_GRS",
    }
});

export const appInsightsContainer = new storage.BlobContainer("appinsights", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name
});

const appInsights = new insights.Component("ai", {
    resourceGroupName: resourceGroup.name,
    kind: "web",
    applicationType: insights.ApplicationType.Web,
});

var expiryDate = new Date((new Date()).getTime() + (3 * 365 * 86400000));

const sas = storage.listStorageAccountSASOutput({
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    permissions: storage.Permissions.W,
    resourceTypes: storage.SignedResourceTypes.C,
    services: storage.Services.B,
    sharedAccessExpiryTime: expiryDate.toISOString()
});



export const sasUrl = pulumi.interpolate`${storageAccount.primaryEndpoints.blob}${appInsightsContainer.name}?${sas.accountSasToken}`;


// const exportConfiguration = new insights.ExportConfiguration(`export-configuration`, {
//     destinationAccountId: storageAccount.id,
//     destinationAddress: sasUrl,
//     destinationType: "Blob",
//     isEnabled: "true",
//     notificationQueueEnabled: "false",
//     notificationQueueUri: "",
//     recordTypes: "Requests, Event, Exceptions, Metrics, PageViews, PageViewPerformance, Rdd, PerformanceCounters, Availability,Messages",
//     resourceGroupName: resourceGroup.name,
//     resourceName: appInsights.name,
//     destinationStorageLocationId: resourceGroup.location
// });
