/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OdsServerController } from './controllers/odsServerController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SbomController } from './controllers/odsServerController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Timestamp": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Phase": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["design"]},{"dataType":"enum","enums":["pre-build"]},{"dataType":"enum","enums":["build"]},{"dataType":"enum","enums":["post-build"]},{"dataType":"enum","enums":["operations"]},{"dataType":"enum","enums":["discovery"]},{"dataType":"enum","enums":["decommission"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PreDefinedPhase": {
        "dataType": "refObject",
        "properties": {
            "phase": {"ref":"Phase","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomPhase": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name","required":true},
            "description": {"ref":"Description"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lifecycle": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"PreDefinedPhase"},{"ref":"CustomPhase"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Lifecycles": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"Lifecycle"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["application"]},{"dataType":"enum","enums":["framework"]},{"dataType":"enum","enums":["library"]},{"dataType":"enum","enums":["container"]},{"dataType":"enum","enums":["platform"]},{"dataType":"enum","enums":["operating-system"]},{"dataType":"enum","enums":["device"]},{"dataType":"enum","enums":["device-driver"]},{"dataType":"enum","enums":["firmware"]},{"dataType":"enum","enums":["file"]},{"dataType":"enum","enums":["machine-learning-model"]},{"dataType":"enum","enums":["data"]},{"dataType":"enum","enums":["cryptographic-asset"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MimeType": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Country": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Region": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Locality": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostOfficeBoxNumber": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostalCode": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StreetAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationAddress": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference2"},
            "country": {"ref":"Country"},
            "region": {"ref":"Region"},
            "locality": {"ref":"Locality"},
            "postOfficeBoxNumber": {"ref":"PostOfficeBoxNumber"},
            "postalCode": {"ref":"PostalCode"},
            "streetAddress": {"ref":"StreetAddress"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationURLS": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EmailAddress": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Phone": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalContact1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference3"},
            "name": {"ref":"Name1"},
            "email": {"ref":"EmailAddress"},
            "phone": {"ref":"Phone"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalContact": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalContact1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentSupplier": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentManufacturer": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentAuthors": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalContact1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentAuthorLegacy": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentPublisher": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentGroup": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentDescription": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentScope": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["required"]},{"dataType":"enum","enums":["optional"]},{"dataType":"enum","enums":["excluded"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HashAlgorithm": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MD5"]},{"dataType":"enum","enums":["SHA-1"]},{"dataType":"enum","enums":["SHA-256"]},{"dataType":"enum","enums":["SHA-384"]},{"dataType":"enum","enums":["SHA-512"]},{"dataType":"enum","enums":["SHA3-256"]},{"dataType":"enum","enums":["SHA3-384"]},{"dataType":"enum","enums":["SHA3-512"]},{"dataType":"enum","enums":["BLAKE2b-256"]},{"dataType":"enum","enums":["BLAKE2b-384"]},{"dataType":"enum","enums":["BLAKE2b-512"]},{"dataType":"enum","enums":["BLAKE3"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HashValue": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Hash": {
        "dataType": "refObject",
        "properties": {
            "alg": {"ref":"HashAlgorithm","required":true},
            "content": {"ref":"HashValue","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentHashes": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Hash"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "License1": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "License": {
        "dataType": "refObject",
        "properties": {
            "license": {"ref":"License1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MultipleLicenses": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"License"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SPDXLicenseExpression": {
        "dataType": "refAlias",
        "type": {"dataType":"any","validators":{"minItems":{"value":1},"maxItems":{"value":1}}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentLicenseS1": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"MultipleLicenses"},{"ref":"SPDXLicenseExpression"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentLicenseS": {
        "dataType": "refAlias",
        "type": {"ref":"ComponentLicenseS1","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentCopyright": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommonPlatformEnumerationCPE": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PackageURLPurl": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OmniBORArtifactIdentifierGitoid": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SoftWareHeritageIdentifier": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TagID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Version": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TagVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Patch": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContentType": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Encoding": {
        "dataType": "refAlias",
        "type": {"dataType":"enum","enums":["base64"],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentText1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentText": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SWIDTag": {
        "dataType": "refObject",
        "properties": {
            "tagId": {"ref":"TagID"},
            "name": {"ref":"Name2"},
            "version": {"ref":"Version"},
            "tagVersion": {"ref":"TagVersion"},
            "patch": {"ref":"Patch"},
            "text": {"ref":"AttachmentText"},
            "url": {"ref":"URL"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentModifiedFromOriginal": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Component": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"ComponentType"},
            "mime-type": {"ref":"MimeType"},
            "bom-ref": {"ref":"BOMReference"},
            "supplier": {"ref":"ComponentSupplier"},
            "manufacturer": {"ref":"ComponentManufacturer"},
            "authors": {"ref":"ComponentAuthors"},
            "author": {"ref":"ComponentAuthorLegacy"},
            "publisher": {"ref":"ComponentPublisher"},
            "group": {"ref":"ComponentGroup"},
            "name": {"ref":"ComponentName"},
            "version": {"ref":"ComponentVersion"},
            "description": {"ref":"ComponentDescription"},
            "scope": {"ref":"ComponentScope"},
            "hashes": {"ref":"ComponentHashes"},
            "licenses": {"ref":"ComponentLicenseS"},
            "copyright": {"ref":"ComponentCopyright"},
            "cpe": {"ref":"CommonPlatformEnumerationCPE"},
            "purl": {"ref":"PackageURLPurl"},
            "omniborId": {"ref":"OmniBORArtifactIdentifierGitoid"},
            "swhid": {"ref":"SoftWareHeritageIdentifier"},
            "swid": {"ref":"SWIDTag"},
            "modified": {"ref":"ComponentModifiedFromOriginal"},
            "pedigree": {"ref":"ComponentPedigree"},
            "externalReferences": {"ref":"ExternalReferences"},
            "components": {"ref":"Components1"},
            "evidence": {"ref":"Evidence"},
            "releaseNotes": {"ref":"ReleaseNotes"},
            "modelCard": {"ref":"AIMLModelCard"},
            "data": {"ref":"Data"},
            "cryptoProperties": {"ref":"CryptographicProperties"},
            "properties": {"ref":"Properties4"},
            "tags": {"ref":"Tags1"},
            "signature": {"ref":"Signature"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ancestors": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Descendants": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Variants": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Timestamp1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EMail": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Author": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"ref":"Timestamp1"},
            "name": {"ref":"Name3"},
            "email": {"ref":"EMail"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Committer": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"ref":"Timestamp1"},
            "name": {"ref":"Name3"},
            "email": {"ref":"EMail"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Message": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Commit": {
        "dataType": "refObject",
        "properties": {
            "uid": {"ref":"UID"},
            "url": {"ref":"URL1"},
            "author": {"ref":"Author"},
            "committer": {"ref":"Committer"},
            "message": {"ref":"Message"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Commits": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Commit"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PatchType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["unofficial"]},{"dataType":"enum","enums":["monkey"]},{"dataType":"enum","enums":["backport"]},{"dataType":"enum","enums":["cherry-pick"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DiffText": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Diff": {
        "dataType": "refObject",
        "properties": {
            "text": {"ref":"DiffText"},
            "url": {"ref":"URL2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssueType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["defect"]},{"dataType":"enum","enums":["enhancement"]},{"dataType":"enum","enums":["security"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssueID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssueName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssueDescription": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name4": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Source": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name4"},
            "url": {"ref":"URL3"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "References": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Issue": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"IssueType","required":true},
            "id": {"ref":"IssueID"},
            "name": {"ref":"IssueName"},
            "description": {"ref":"IssueDescription"},
            "source": {"ref":"Source"},
            "references": {"ref":"References"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Resolves": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Issue"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Patch1": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"PatchType","required":true},
            "diff": {"ref":"Diff"},
            "resolves": {"ref":"Resolves"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Patches": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Patch1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Notes": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentPedigree": {
        "dataType": "refObject",
        "properties": {
            "ancestors": {"ref":"Ancestors"},
            "descendants": {"ref":"Descendants"},
            "variants": {"ref":"Variants"},
            "commits": {"ref":"Commits"},
            "patches": {"ref":"Patches"},
            "notes": {"ref":"Notes"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkDocument": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLink": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"BOMLinkDocument"},{"ref":"BOMLinkElement"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL4": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"URL5"},{"ref":"BOMLink"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Comment": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["vcs"]},{"dataType":"enum","enums":["issue-tracker"]},{"dataType":"enum","enums":["website"]},{"dataType":"enum","enums":["advisories"]},{"dataType":"enum","enums":["bom"]},{"dataType":"enum","enums":["mailing-list"]},{"dataType":"enum","enums":["social"]},{"dataType":"enum","enums":["chat"]},{"dataType":"enum","enums":["documentation"]},{"dataType":"enum","enums":["support"]},{"dataType":"enum","enums":["source-distribution"]},{"dataType":"enum","enums":["distribution"]},{"dataType":"enum","enums":["distribution-intake"]},{"dataType":"enum","enums":["license"]},{"dataType":"enum","enums":["build-meta"]},{"dataType":"enum","enums":["build-system"]},{"dataType":"enum","enums":["release-notes"]},{"dataType":"enum","enums":["security-contact"]},{"dataType":"enum","enums":["model-card"]},{"dataType":"enum","enums":["log"]},{"dataType":"enum","enums":["configuration"]},{"dataType":"enum","enums":["evidence"]},{"dataType":"enum","enums":["formulation"]},{"dataType":"enum","enums":["attestation"]},{"dataType":"enum","enums":["threat-model"]},{"dataType":"enum","enums":["adversary-model"]},{"dataType":"enum","enums":["risk-assessment"]},{"dataType":"enum","enums":["vulnerability-assertion"]},{"dataType":"enum","enums":["exploitability-statement"]},{"dataType":"enum","enums":["pentest-report"]},{"dataType":"enum","enums":["static-analysis-report"]},{"dataType":"enum","enums":["dynamic-analysis-report"]},{"dataType":"enum","enums":["runtime-analysis-report"]},{"dataType":"enum","enums":["component-analysis-report"]},{"dataType":"enum","enums":["maturity-report"]},{"dataType":"enum","enums":["certification-report"]},{"dataType":"enum","enums":["codified-infrastructure"]},{"dataType":"enum","enums":["quality-metrics"]},{"dataType":"enum","enums":["poam"]},{"dataType":"enum","enums":["electronic-signature"]},{"dataType":"enum","enums":["digital-signature"]},{"dataType":"enum","enums":["rfc-9116"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Hashes": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Hash"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReference": {
        "dataType": "refObject",
        "properties": {
            "url": {"ref":"URL4","required":true},
            "comment": {"ref":"Comment"},
            "type": {"ref":"Type","required":true},
            "hashes": {"ref":"Hashes"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Field": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["group"]},{"dataType":"enum","enums":["name"]},{"dataType":"enum","enums":["version"]},{"dataType":"enum","enums":["purl"]},{"dataType":"enum","enums":["cpe"]},{"dataType":"enum","enums":["omniborId"]},{"dataType":"enum","enums":["swhid"]},{"dataType":"enum","enums":["swid"]},{"dataType":"enum","enums":["hash"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Confidence": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConcludedValue": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Technique": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["source-code-analysis"]},{"dataType":"enum","enums":["binary-analysis"]},{"dataType":"enum","enums":["manifest-analysis"]},{"dataType":"enum","enums":["ast-fingerprint"]},{"dataType":"enum","enums":["hash-comparison"]},{"dataType":"enum","enums":["instrumentation"]},{"dataType":"enum","enums":["dynamic-analysis"]},{"dataType":"enum","enums":["filename"]},{"dataType":"enum","enums":["attestation"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Confidence1": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Methods": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"value":{"ref":"Value"},"confidence":{"ref":"Confidence1","required":true},"technique":{"ref":"Technique","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ref": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReferences": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"Ref"},{"ref":"BOMLinkElement1"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IdentityEvidence1": {
        "dataType": "refObject",
        "properties": {
            "field": {"ref":"Field","required":true},
            "confidence": {"ref":"Confidence"},
            "concludedValue": {"ref":"ConcludedValue"},
            "methods": {"ref":"Methods"},
            "tools": {"ref":"BOMReferences"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ArrayOfIdentityObjects": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"IdentityEvidence1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IdentityEvidence2": {
        "dataType": "refObject",
        "properties": {
            "field": {"ref":"Field","required":true},
            "confidence": {"ref":"Confidence"},
            "concludedValue": {"ref":"ConcludedValue"},
            "methods": {"ref":"Methods"},
            "tools": {"ref":"BOMReferences"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IdentityEvidence": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"ArrayOfIdentityObjects"},{"ref":"IdentityEvidence2"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Location": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LineNumber": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Offset": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Symbol": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdditionalContext": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Occurrences": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"additionalContext":{"ref":"AdditionalContext"},"symbol":{"ref":"Symbol"},"offset":{"ref":"Offset"},"line":{"ref":"LineNumber"},"location":{"ref":"Location","required":true},"bom-ref":{"ref":"BOMReference5"}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Package": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Module": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Function": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Parameters": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Line": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Column": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FullFilename": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Frames": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"fullFilename":{"ref":"FullFilename"},"column":{"ref":"Column"},"line":{"ref":"Line"},"parameters":{"ref":"Parameters"},"function":{"ref":"Function"},"module":{"ref":"Module","required":true},"package":{"ref":"Package"}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CallStack": {
        "dataType": "refObject",
        "properties": {
            "frames": {"ref":"Frames"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LicenseEvidence1": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"MultipleLicenses"},{"ref":"SPDXLicenseExpression"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LicenseEvidence2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LicenseEvidence": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"ref":"LicenseEvidence1"},{"ref":"LicenseEvidence2"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CopyrightText": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Copyright": {
        "dataType": "refObject",
        "properties": {
            "text": {"ref":"CopyrightText","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CopyrightEvidence": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Copyright"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Evidence": {
        "dataType": "refObject",
        "properties": {
            "identity": {"ref":"IdentityEvidence"},
            "occurrences": {"ref":"Occurrences"},
            "callstack": {"ref":"CallStack"},
            "licenses": {"ref":"LicenseEvidence"},
            "copyright": {"ref":"CopyrightEvidence"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Title": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeaturedImage": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SocialImage": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Timestamp2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Aliases": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tags": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Resolves1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Issue"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Locale": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReleaseNoteContent": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Note": {
        "dataType": "refObject",
        "properties": {
            "locale": {"ref":"Locale"},
            "text": {"ref":"ReleaseNoteContent","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Notes1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Note"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LightweightNameValuePair": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name5","required":true},
            "value": {"ref":"Value1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReleaseNotes": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"Type1","required":true},
            "title": {"ref":"Title"},
            "featuredImage": {"ref":"FeaturedImage"},
            "socialImage": {"ref":"SocialImage"},
            "description": {"ref":"Description1"},
            "timestamp": {"ref":"Timestamp2"},
            "aliases": {"ref":"Aliases"},
            "tags": {"ref":"Tags"},
            "resolves": {"ref":"Resolves1"},
            "notes": {"ref":"Notes1"},
            "properties": {"ref":"Properties"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference6": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LearningType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["supervised"]},{"dataType":"enum","enums":["unsupervised"]},{"dataType":"enum","enums":["reinforcement-learning"]},{"dataType":"enum","enums":["semi-supervised"]},{"dataType":"enum","enums":["self-supervised"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Approach": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"LearningType"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Task": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ArchitectureFamily": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModelArchitecture": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference7": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TypeOfData": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["source-code"]},{"dataType":"enum","enums":["configuration"]},{"dataType":"enum","enums":["dataset"]},{"dataType":"enum","enums":["definition"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DatasetName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataAttachment": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataURL": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConfigurationProperties": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataContents": {
        "dataType": "refObject",
        "properties": {
            "attachment": {"ref":"DataAttachment"},
            "url": {"ref":"DataURL"},
            "properties": {"ref":"ConfigurationProperties"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataClassification": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SensitiveData": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name6": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GraphicImage": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Graphic": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name6"},
            "image": {"ref":"GraphicImage"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Collection": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Graphic"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GraphicsCollection": {
        "dataType": "refObject",
        "properties": {
            "description": {"ref":"Description2"},
            "collection": {"ref":"Collection"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DatasetDescription": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organization": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalContact2": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference3"},
            "name": {"ref":"Name1"},
            "email": {"ref":"EmailAddress"},
            "phone": {"ref":"Phone"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataGovernanceResponsibleParty1": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataGovernanceResponsibleParty": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"contact":{"ref":"OrganizationalContact2"},"organization":{"ref":"Organization"}}},{"ref":"DataGovernanceResponsibleParty1"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataCustodians": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"DataGovernanceResponsibleParty"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataStewards": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"DataGovernanceResponsibleParty1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataOwners": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"DataGovernanceResponsibleParty1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataGovernance": {
        "dataType": "refObject",
        "properties": {
            "custodians": {"ref":"DataCustodians"},
            "stewards": {"ref":"DataStewards"},
            "owners": {"ref":"DataOwners"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InlineDataInformation": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference7"},
            "type": {"ref":"TypeOfData","required":true},
            "name": {"ref":"DatasetName"},
            "contents": {"ref":"DataContents"},
            "classification": {"ref":"DataClassification"},
            "sensitiveData": {"ref":"SensitiveData"},
            "graphics": {"ref":"GraphicsCollection"},
            "description": {"ref":"DatasetDescription"},
            "governance": {"ref":"DataGovernance"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ref1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Reference": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Ref1"},{"ref":"BOMLinkElement2"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataReference": {
        "dataType": "refObject",
        "properties": {
            "ref": {"ref":"Reference"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Datasets": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"InlineDataInformation"},{"ref":"DataReference"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InputOutputFormat": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InputAndOutputParameters": {
        "dataType": "refObject",
        "properties": {
            "format": {"ref":"InputOutputFormat"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Inputs": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"InputAndOutputParameters"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Outputs": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"InputAndOutputParameters"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModelParameters": {
        "dataType": "refObject",
        "properties": {
            "approach": {"ref":"Approach"},
            "task": {"ref":"Task"},
            "architectureFamily": {"ref":"ArchitectureFamily"},
            "modelArchitecture": {"ref":"ModelArchitecture"},
            "datasets": {"ref":"Datasets"},
            "inputs": {"ref":"Inputs"},
            "outputs": {"ref":"Outputs"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Slice": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LowerBound": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpperBound": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConfidenceInterval": {
        "dataType": "refObject",
        "properties": {
            "lowerBound": {"ref":"LowerBound"},
            "upperBound": {"ref":"UpperBound"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceMetric": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"Type2"},
            "value": {"ref":"Value2"},
            "slice": {"ref":"Slice"},
            "confidenceInterval": {"ref":"ConfidenceInterval"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceMetrics": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"PerformanceMetric"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "QuantitativeAnalysis": {
        "dataType": "refObject",
        "properties": {
            "performanceMetrics": {"ref":"PerformanceMetrics"},
            "graphics": {"ref":"GraphicsCollection"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Users": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UseCases": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TechnicalLimitations": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PerformanceTradeoffs": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name7": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MitigationStrategy": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Risk": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name7"},
            "mitigationStrategy": {"ref":"MitigationStrategy"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EthicalConsiderations": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Risk"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Activity": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["design"]},{"dataType":"enum","enums":["data-collection"]},{"dataType":"enum","enums":["data-preparation"]},{"dataType":"enum","enums":["training"]},{"dataType":"enum","enums":["fine-tuning"]},{"dataType":"enum","enums":["validation"]},{"dataType":"enum","enums":["deployment"]},{"dataType":"enum","enums":["inference"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference8": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organization1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergySource": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["coal"]},{"dataType":"enum","enums":["oil"]},{"dataType":"enum","enums":["natural-gas"]},{"dataType":"enum","enums":["nuclear"]},{"dataType":"enum","enums":["wind"]},{"dataType":"enum","enums":["solar"]},{"dataType":"enum","enums":["geothermal"]},{"dataType":"enum","enums":["hydropower"]},{"dataType":"enum","enums":["biofuel"]},{"dataType":"enum","enums":["unknown"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value3": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Unit": {
        "dataType": "refAlias",
        "type": {"dataType":"enum","enums":["kWh"],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergyProvided": {
        "dataType": "refObject",
        "properties": {
            "value": {"ref":"Value3","required":true},
            "unit": {"ref":"Unit","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergyProvider": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference8"},
            "description": {"ref":"Description3"},
            "organization": {"ref":"Organization1","required":true},
            "energySource": {"ref":"EnergySource","required":true},
            "energyProvided": {"ref":"EnergyProvided","required":true},
            "externalReferences": {"ref":"ExternalReferences1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergyProviders": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"EnergyProvider"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivityEnergyCost": {
        "dataType": "refObject",
        "properties": {
            "value": {"ref":"Value3","required":true},
            "unit": {"ref":"Unit","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value4": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Unit1": {
        "dataType": "refAlias",
        "type": {"dataType":"enum","enums":["tCO2eq"],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CO2EquivalentCost": {
        "dataType": "refObject",
        "properties": {
            "value": {"ref":"Value4","required":true},
            "unit": {"ref":"Unit1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CO2CostOffset": {
        "dataType": "refObject",
        "properties": {
            "value": {"ref":"Value4","required":true},
            "unit": {"ref":"Unit1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergyConsumption": {
        "dataType": "refObject",
        "properties": {
            "activity": {"ref":"Activity","required":true},
            "energyProviders": {"ref":"EnergyProviders","required":true},
            "activityEnergyCost": {"ref":"ActivityEnergyCost","required":true},
            "co2CostEquivalent": {"ref":"CO2EquivalentCost"},
            "co2CostOffset": {"ref":"CO2CostOffset"},
            "properties": {"ref":"Properties1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnergyConsumptions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"EnergyConsumption"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnvironmentalConsiderations": {
        "dataType": "refObject",
        "properties": {
            "energyConsumptions": {"ref":"EnergyConsumptions"},
            "properties": {"ref":"Properties2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GroupAtRisk": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Benefits": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Harms": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MitigationStrategy1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FairnessAssessment": {
        "dataType": "refObject",
        "properties": {
            "groupAtRisk": {"ref":"GroupAtRisk"},
            "benefits": {"ref":"Benefits"},
            "harms": {"ref":"Harms"},
            "mitigationStrategy": {"ref":"MitigationStrategy1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FairnessAssessments": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"FairnessAssessment"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Considerations": {
        "dataType": "refObject",
        "properties": {
            "users": {"ref":"Users"},
            "useCases": {"ref":"UseCases"},
            "technicalLimitations": {"ref":"TechnicalLimitations"},
            "performanceTradeoffs": {"ref":"PerformanceTradeoffs"},
            "ethicalConsiderations": {"ref":"EthicalConsiderations"},
            "environmentalConsiderations": {"ref":"EnvironmentalConsiderations"},
            "fairnessAssessments": {"ref":"FairnessAssessments"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AIMLModelCard": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference6"},
            "modelParameters": {"ref":"ModelParameters"},
            "quantitativeAnalysis": {"ref":"QuantitativeAnalysis"},
            "considerations": {"ref":"Considerations"},
            "properties": {"ref":"Properties3"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentData": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference7"},
            "type": {"ref":"TypeOfData","required":true},
            "name": {"ref":"DatasetName"},
            "contents": {"ref":"DataContents"},
            "classification": {"ref":"DataClassification"},
            "sensitiveData": {"ref":"SensitiveData"},
            "graphics": {"ref":"GraphicsCollection"},
            "description": {"ref":"DatasetDescription"},
            "governance": {"ref":"DataGovernance"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Data": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ComponentData"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AssetType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["algorithm"]},{"dataType":"enum","enums":["certificate"]},{"dataType":"enum","enums":["protocol"]},{"dataType":"enum","enums":["related-crypto-material"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Primitive": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["drbg"]},{"dataType":"enum","enums":["mac"]},{"dataType":"enum","enums":["block-cipher"]},{"dataType":"enum","enums":["stream-cipher"]},{"dataType":"enum","enums":["signature"]},{"dataType":"enum","enums":["hash"]},{"dataType":"enum","enums":["pke"]},{"dataType":"enum","enums":["xof"]},{"dataType":"enum","enums":["kdf"]},{"dataType":"enum","enums":["key-agree"]},{"dataType":"enum","enums":["kem"]},{"dataType":"enum","enums":["ae"]},{"dataType":"enum","enums":["combiner"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ParameterSetIdentifier": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EllipticCurve": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExecutionEnvironment": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["software-plain-ram"]},{"dataType":"enum","enums":["software-encrypted-ram"]},{"dataType":"enum","enums":["software-tee"]},{"dataType":"enum","enums":["hardware"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ImplementationPlatform": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["generic"]},{"dataType":"enum","enums":["x86_32"]},{"dataType":"enum","enums":["x86_64"]},{"dataType":"enum","enums":["armv7-a"]},{"dataType":"enum","enums":["armv7-m"]},{"dataType":"enum","enums":["armv8-a"]},{"dataType":"enum","enums":["armv8-m"]},{"dataType":"enum","enums":["armv9-a"]},{"dataType":"enum","enums":["armv9-m"]},{"dataType":"enum","enums":["s390x"]},{"dataType":"enum","enums":["ppc64"]},{"dataType":"enum","enums":["ppc64le"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CertificationLevel": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["none"]},{"dataType":"enum","enums":["fips140-1-l1"]},{"dataType":"enum","enums":["fips140-1-l2"]},{"dataType":"enum","enums":["fips140-1-l3"]},{"dataType":"enum","enums":["fips140-1-l4"]},{"dataType":"enum","enums":["fips140-2-l1"]},{"dataType":"enum","enums":["fips140-2-l2"]},{"dataType":"enum","enums":["fips140-2-l3"]},{"dataType":"enum","enums":["fips140-2-l4"]},{"dataType":"enum","enums":["fips140-3-l1"]},{"dataType":"enum","enums":["fips140-3-l2"]},{"dataType":"enum","enums":["fips140-3-l3"]},{"dataType":"enum","enums":["fips140-3-l4"]},{"dataType":"enum","enums":["cc-eal1"]},{"dataType":"enum","enums":["cc-eal1+"]},{"dataType":"enum","enums":["cc-eal2"]},{"dataType":"enum","enums":["cc-eal2+"]},{"dataType":"enum","enums":["cc-eal3"]},{"dataType":"enum","enums":["cc-eal3+"]},{"dataType":"enum","enums":["cc-eal4"]},{"dataType":"enum","enums":["cc-eal4+"]},{"dataType":"enum","enums":["cc-eal5"]},{"dataType":"enum","enums":["cc-eal5+"]},{"dataType":"enum","enums":["cc-eal6"]},{"dataType":"enum","enums":["cc-eal6+"]},{"dataType":"enum","enums":["cc-eal7"]},{"dataType":"enum","enums":["cc-eal7+"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Mode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["cbc"]},{"dataType":"enum","enums":["ecb"]},{"dataType":"enum","enums":["ccm"]},{"dataType":"enum","enums":["gcm"]},{"dataType":"enum","enums":["cfb"]},{"dataType":"enum","enums":["ofb"]},{"dataType":"enum","enums":["ctr"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Padding": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pkcs5"]},{"dataType":"enum","enums":["pkcs7"]},{"dataType":"enum","enums":["pkcs1v15"]},{"dataType":"enum","enums":["oaep"]},{"dataType":"enum","enums":["raw"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CryptographicFunctions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["generate"]},{"dataType":"enum","enums":["keygen"]},{"dataType":"enum","enums":["encrypt"]},{"dataType":"enum","enums":["decrypt"]},{"dataType":"enum","enums":["digest"]},{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["keyderive"]},{"dataType":"enum","enums":["sign"]},{"dataType":"enum","enums":["verify"]},{"dataType":"enum","enums":["encapsulate"]},{"dataType":"enum","enums":["decapsulate"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ClassicalSecurityLevel": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NISTSecurityStrengthCategory": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorithmProperties": {
        "dataType": "refObject",
        "properties": {
            "primitive": {"ref":"Primitive"},
            "parameterSetIdentifier": {"ref":"ParameterSetIdentifier"},
            "curve": {"ref":"EllipticCurve"},
            "executionEnvironment": {"ref":"ExecutionEnvironment"},
            "implementationPlatform": {"ref":"ImplementationPlatform"},
            "certificationLevel": {"ref":"CertificationLevel"},
            "mode": {"ref":"Mode"},
            "padding": {"ref":"Padding"},
            "cryptoFunctions": {"ref":"CryptographicFunctions"},
            "classicalSecurityLevel": {"ref":"ClassicalSecurityLevel"},
            "nistQuantumSecurityLevel": {"ref":"NISTSecurityStrengthCategory"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubjectName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IssuerName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotValidBefore": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotValidAfter": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorithmReference": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "KeyReference": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CertificateFormat": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CertificateFileExtension": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CertificateProperties": {
        "dataType": "refObject",
        "properties": {
            "subjectName": {"ref":"SubjectName"},
            "issuerName": {"ref":"IssuerName"},
            "notValidBefore": {"ref":"NotValidBefore"},
            "notValidAfter": {"ref":"NotValidAfter"},
            "signatureAlgorithmRef": {"ref":"AlgorithmReference"},
            "subjectPublicKeyRef": {"ref":"KeyReference"},
            "certificateFormat": {"ref":"CertificateFormat"},
            "certificateExtension": {"ref":"CertificateFileExtension"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RelatedCryptoMaterialType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["private-key"]},{"dataType":"enum","enums":["public-key"]},{"dataType":"enum","enums":["secret-key"]},{"dataType":"enum","enums":["key"]},{"dataType":"enum","enums":["ciphertext"]},{"dataType":"enum","enums":["signature"]},{"dataType":"enum","enums":["digest"]},{"dataType":"enum","enums":["initialization-vector"]},{"dataType":"enum","enums":["nonce"]},{"dataType":"enum","enums":["seed"]},{"dataType":"enum","enums":["salt"]},{"dataType":"enum","enums":["shared-secret"]},{"dataType":"enum","enums":["tag"]},{"dataType":"enum","enums":["additional-data"]},{"dataType":"enum","enums":["password"]},{"dataType":"enum","enums":["credential"]},{"dataType":"enum","enums":["token"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "State": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pre-activation"]},{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["suspended"]},{"dataType":"enum","enums":["deactivated"]},{"dataType":"enum","enums":["compromised"]},{"dataType":"enum","enums":["destroyed"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorithmReference1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreationDate": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ActivationDate": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateDate": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExpirationDate": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Value5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Size": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Format": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Mechanism": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorithmReference2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SecuredBy": {
        "dataType": "refObject",
        "properties": {
            "mechanism": {"ref":"Mechanism"},
            "algorithmRef": {"ref":"AlgorithmReference2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RelatedCryptographicMaterialProperties": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"RelatedCryptoMaterialType"},
            "id": {"ref":"ID"},
            "state": {"ref":"State"},
            "algorithmRef": {"ref":"AlgorithmReference1"},
            "creationDate": {"ref":"CreationDate"},
            "activationDate": {"ref":"ActivationDate"},
            "updateDate": {"ref":"UpdateDate"},
            "expirationDate": {"ref":"ExpirationDate"},
            "value": {"ref":"Value5"},
            "size": {"ref":"Size"},
            "format": {"ref":"Format"},
            "securedBy": {"ref":"SecuredBy"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type3": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["tls"]},{"dataType":"enum","enums":["ssh"]},{"dataType":"enum","enums":["ipsec"]},{"dataType":"enum","enums":["ike"]},{"dataType":"enum","enums":["sstp"]},{"dataType":"enum","enums":["wpa"]},{"dataType":"enum","enums":["other"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProtocolVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommonName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AlgorithmReference3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RelatedAlgorithms": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"AlgorithmReference3"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Identifier": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CipherSuiteIdentifiers": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"Identifier"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CipherSuite": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"CommonName"},
            "algorithms": {"ref":"RelatedAlgorithms"},
            "identifiers": {"ref":"CipherSuiteIdentifiers"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CipherSuites": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"CipherSuite"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefType": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EncryptionAlgorithmENCR": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PseudorandomFunctionPRF": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IntegrityAlgorithmINTEG": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "KeyExchangeMethodKE": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExtendedSequenceNumbersESN": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IKEv2AuthenticationMethod": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IKEv2TransformTypes": {
        "dataType": "refObject",
        "properties": {
            "encr": {"ref":"EncryptionAlgorithmENCR"},
            "prf": {"ref":"PseudorandomFunctionPRF"},
            "integ": {"ref":"IntegrityAlgorithmINTEG"},
            "ke": {"ref":"KeyExchangeMethodKE"},
            "esn": {"ref":"ExtendedSequenceNumbersESN"},
            "auth": {"ref":"IKEv2AuthenticationMethod"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CryptographicReferences": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"RefType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProtocolProperties": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"Type3"},
            "version": {"ref":"ProtocolVersion"},
            "cipherSuites": {"ref":"CipherSuites"},
            "ikev2TransformTypes": {"ref":"IKEv2TransformTypes"},
            "cryptoRefArray": {"ref":"CryptographicReferences"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CryptographicProperties": {
        "dataType": "refObject",
        "properties": {
            "assetType": {"ref":"AssetType","required":true},
            "algorithmProperties": {"ref":"AlgorithmProperties"},
            "certificateProperties": {"ref":"CertificateProperties"},
            "relatedCryptoMaterialProperties": {"ref":"RelatedCryptographicMaterialProperties"},
            "protocolProperties": {"ref":"ProtocolProperties"},
            "oid": {"ref":"OID"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties4": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tags1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference9": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Provider": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceGroup": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceDescription": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Endpoints": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthenticationRequired": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CrossesTrustBoundary": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TrustZone": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DirectionalFlow": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["inbound"]},{"dataType":"enum","enums":["outbound"]},{"dataType":"enum","enums":["bi-directional"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name8": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description4": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataGovernance1": {
        "dataType": "refObject",
        "properties": {
            "custodians": {"ref":"DataCustodians"},
            "stewards": {"ref":"DataStewards"},
            "owners": {"ref":"DataOwners"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL6": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Source1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"URL6"},{"ref":"BOMLinkElement3"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL7": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement4": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Destination": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"URL7"},{"ref":"BOMLinkElement4"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "HashObjects": {
        "dataType": "refObject",
        "properties": {
            "flow": {"ref":"DirectionalFlow","required":true},
            "classification": {"ref":"DataClassification","required":true},
            "name": {"ref":"Name8"},
            "description": {"ref":"Description4"},
            "governance": {"ref":"DataGovernance1"},
            "source": {"ref":"Source1"},
            "destination": {"ref":"Destination"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Data1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"HashObjects"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentLicenseS4": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"MultipleLicenses"},{"ref":"SPDXLicenseExpression"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentLicenseS3": {
        "dataType": "refAlias",
        "type": {"ref":"ComponentLicenseS4","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Service": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference9"},
            "provider": {"ref":"Provider"},
            "group": {"ref":"ServiceGroup"},
            "name": {"ref":"ServiceName","required":true},
            "version": {"ref":"ServiceVersion"},
            "description": {"ref":"ServiceDescription"},
            "endpoints": {"ref":"Endpoints"},
            "authenticated": {"ref":"AuthenticationRequired"},
            "x-trust-boundary": {"ref":"CrossesTrustBoundary"},
            "trustZone": {"ref":"TrustZone"},
            "data": {"ref":"Data1"},
            "licenses": {"ref":"ComponentLicenseS3"},
            "externalReferences": {"ref":"ExternalReferences2"},
            "services": {"ref":"Services1"},
            "releaseNotes": {"ref":"ReleaseNotes1"},
            "properties": {"ref":"Properties5"},
            "tags": {"ref":"Tags2"},
            "signature": {"ref":"Signature1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ReleaseNotes1": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"Type1","required":true},
            "title": {"ref":"Title"},
            "featuredImage": {"ref":"FeaturedImage"},
            "socialImage": {"ref":"SocialImage"},
            "description": {"ref":"Description1"},
            "timestamp": {"ref":"Timestamp2"},
            "aliases": {"ref":"Aliases"},
            "tags": {"ref":"Tags"},
            "resolves": {"ref":"Resolves1"},
            "notes": {"ref":"Notes1"},
            "properties": {"ref":"Properties"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties5": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tags2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature1": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tools1": {
        "dataType": "refObject",
        "properties": {
            "components": {"ref":"Components"},
            "services": {"ref":"Services"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ToolVendor": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ToolName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ToolVersion": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Hashes1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Hash"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tool": {
        "dataType": "refObject",
        "properties": {
            "vendor": {"ref":"ToolVendor"},
            "name": {"ref":"ToolName"},
            "version": {"ref":"ToolVersion"},
            "hashes": {"ref":"Hashes1"},
            "externalReferences": {"ref":"ExternalReferences3"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ToolsLegacy": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Tool"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tools": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Tools1"},{"ref":"ToolsLegacy"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMManufacturer": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMAuthors": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalContact1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentLicenseS6": {
        "dataType": "refAlias",
        "type": {"ref":"ComponentLicenseS1","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Component1": {
        "dataType": "refObject",
        "properties": {
            "type": {"ref":"ComponentType"},
            "mime-type": {"ref":"MimeType"},
            "bom-ref": {"ref":"BOMReference"},
            "supplier": {"ref":"ComponentSupplier"},
            "manufacturer": {"ref":"ComponentManufacturer"},
            "authors": {"ref":"ComponentAuthors"},
            "author": {"ref":"ComponentAuthorLegacy"},
            "publisher": {"ref":"ComponentPublisher"},
            "group": {"ref":"ComponentGroup"},
            "name": {"ref":"ComponentName"},
            "version": {"ref":"ComponentVersion"},
            "description": {"ref":"ComponentDescription"},
            "scope": {"ref":"ComponentScope"},
            "hashes": {"ref":"ComponentHashes"},
            "licenses": {"ref":"ComponentLicenseS6"},
            "copyright": {"ref":"ComponentCopyright"},
            "cpe": {"ref":"CommonPlatformEnumerationCPE"},
            "purl": {"ref":"PackageURLPurl"},
            "omniborId": {"ref":"OmniBORArtifactIdentifierGitoid"},
            "swhid": {"ref":"SoftWareHeritageIdentifier"},
            "swid": {"ref":"SWIDTag"},
            "modified": {"ref":"ComponentModifiedFromOriginal"},
            "pedigree": {"ref":"ComponentPedigree"},
            "externalReferences": {"ref":"ExternalReferences"},
            "components": {"ref":"Components1"},
            "evidence": {"ref":"Evidence"},
            "releaseNotes": {"ref":"ReleaseNotes"},
            "modelCard": {"ref":"AIMLModelCard"},
            "data": {"ref":"Data"},
            "cryptoProperties": {"ref":"CryptographicProperties"},
            "properties": {"ref":"Properties4"},
            "tags": {"ref":"Tags1"},
            "signature": {"ref":"Signature"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ComponentManufactureLegacy": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Supplier": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLicenseS1": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"MultipleLicenses"},{"ref":"SPDXLicenseExpression"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLicenseS2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLicenseS": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"ref":"BOMLicenseS1"},{"ref":"BOMLicenseS2"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties6": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMMetadata": {
        "dataType": "refObject",
        "properties": {
            "timestamp": {"ref":"Timestamp"},
            "lifecycles": {"ref":"Lifecycles"},
            "tools": {"ref":"Tools"},
            "manufacturer": {"ref":"BOMManufacturer"},
            "authors": {"ref":"BOMAuthors"},
            "component": {"ref":"Component1"},
            "manufacture": {"ref":"ComponentManufactureLegacy"},
            "supplier": {"ref":"Supplier"},
            "licenses": {"ref":"BOMLicenseS"},
            "properties": {"ref":"Properties6"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences4": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Reference1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DependsOn": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Provides": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Dependency": {
        "dataType": "refObject",
        "properties": {
            "ref": {"ref":"Reference1","required":true},
            "dependsOn": {"ref":"DependsOn"},
            "provides": {"ref":"Provides"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Dependencies": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Dependency"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference10": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Aggregate": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["complete"]},{"dataType":"enum","enums":["incomplete"]},{"dataType":"enum","enums":["incomplete_first_party_only"]},{"dataType":"enum","enums":["incomplete_first_party_proprietary_only"]},{"dataType":"enum","enums":["incomplete_first_party_opensource_only"]},{"dataType":"enum","enums":["incomplete_third_party_only"]},{"dataType":"enum","enums":["incomplete_third_party_proprietary_only"]},{"dataType":"enum","enums":["incomplete_third_party_opensource_only"]},{"dataType":"enum","enums":["unknown"]},{"dataType":"enum","enums":["not_specified"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ref2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReferences1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"Ref2"},{"ref":"BOMLinkElement5"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReferences2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReferences3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature2": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Compositions1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference10"},
            "aggregate": {"ref":"Aggregate","required":true},
            "assemblies": {"ref":"BOMReferences1"},
            "dependencies": {"ref":"BOMReferences2"},
            "vulnerabilities": {"ref":"BOMReferences3"},
            "signature": {"ref":"Signature2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Compositions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Compositions1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference11": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ID1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL8": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name9": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Source2": {
        "dataType": "refObject",
        "properties": {
            "url": {"ref":"URL8"},
            "name": {"ref":"Name9"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ID2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Source3": {
        "dataType": "refObject",
        "properties": {
            "url": {"ref":"URL8"},
            "name": {"ref":"Name9"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "References1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"source":{"ref":"Source3","required":true},"id":{"ref":"ID2","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Source4": {
        "dataType": "refObject",
        "properties": {
            "url": {"ref":"URL8"},
            "name": {"ref":"Name9"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Score": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Severity": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["critical"]},{"dataType":"enum","enums":["high"]},{"dataType":"enum","enums":["medium"]},{"dataType":"enum","enums":["low"]},{"dataType":"enum","enums":["info"]},{"dataType":"enum","enums":["none"]},{"dataType":"enum","enums":["unknown"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Method": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CVSSv2"]},{"dataType":"enum","enums":["CVSSv3"]},{"dataType":"enum","enums":["CVSSv31"]},{"dataType":"enum","enums":["CVSSv4"]},{"dataType":"enum","enums":["OWASP"]},{"dataType":"enum","enums":["SSVC"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Vector": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Justification": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Rating": {
        "dataType": "refObject",
        "properties": {
            "source": {"ref":"Source4"},
            "score": {"ref":"Score"},
            "severity": {"ref":"Severity"},
            "method": {"ref":"Method"},
            "vector": {"ref":"Vector"},
            "justification": {"ref":"Justification"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ratings": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Rating"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CWE": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CWEs": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"CWE"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Details": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Recommendation": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workarounds": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "StepsToReproduce": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Environment": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attachment": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SupportingMaterial": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Attachment"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProofOfConcept": {
        "dataType": "refObject",
        "properties": {
            "reproductionSteps": {"ref":"StepsToReproduce"},
            "environment": {"ref":"Environment"},
            "supportingMaterial": {"ref":"SupportingMaterial"},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Title1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "URL9": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Advisory": {
        "dataType": "refObject",
        "properties": {
            "title": {"ref":"Title1"},
            "url": {"ref":"URL9","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Advisories": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Advisory"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Created": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Published": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Updated": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Rejected": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalEntity": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organizations": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalEntity"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Individuals": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalContact1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Credits": {
        "dataType": "refObject",
        "properties": {
            "organizations": {"ref":"Organizations"},
            "individuals": {"ref":"Individuals"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tools3": {
        "dataType": "refObject",
        "properties": {
            "components": {"ref":"Components3"},
            "services": {"ref":"Services3"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ToolsLegacy1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Tool"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tools2": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Tools3"},{"ref":"ToolsLegacy1"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ImpactAnalysisState": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["resolved"]},{"dataType":"enum","enums":["resolved_with_pedigree"]},{"dataType":"enum","enums":["exploitable"]},{"dataType":"enum","enums":["in_triage"]},{"dataType":"enum","enums":["false_positive"]},{"dataType":"enum","enums":["not_affected"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ImpactAnalysisJustification": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["code_not_present"]},{"dataType":"enum","enums":["code_not_reachable"]},{"dataType":"enum","enums":["requires_configuration"]},{"dataType":"enum","enums":["requires_dependency"]},{"dataType":"enum","enums":["requires_environment"]},{"dataType":"enum","enums":["protected_by_compiler"]},{"dataType":"enum","enums":["protected_at_runtime"]},{"dataType":"enum","enums":["protected_at_perimeter"]},{"dataType":"enum","enums":["protected_by_mitigating_control"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Response": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["can_not_fix"]},{"dataType":"enum","enums":["will_not_fix"]},{"dataType":"enum","enums":["update"]},{"dataType":"enum","enums":["rollback"]},{"dataType":"enum","enums":["workaround_available"]}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Detail": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FirstIssued": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LastUpdated": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ImpactAnalysis": {
        "dataType": "refObject",
        "properties": {
            "state": {"ref":"ImpactAnalysisState"},
            "justification": {"ref":"ImpactAnalysisJustification"},
            "response": {"ref":"Response"},
            "detail": {"ref":"Detail"},
            "firstIssued": {"ref":"FirstIssued"},
            "lastUpdated": {"ref":"LastUpdated"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ref3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement6": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Reference2": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"ref":"Ref3"},{"ref":"BOMLinkElement6"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Versions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Affects": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"versions":{"ref":"Versions"},"ref":{"ref":"Reference2","required":true}}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties7": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Vulnerability": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference11"},
            "id": {"ref":"ID1"},
            "source": {"ref":"Source2"},
            "references": {"ref":"References1"},
            "ratings": {"ref":"Ratings"},
            "cwes": {"ref":"CWEs"},
            "description": {"ref":"Description5"},
            "detail": {"ref":"Details"},
            "recommendation": {"ref":"Recommendation"},
            "workaround": {"ref":"Workarounds"},
            "proofOfConcept": {"ref":"ProofOfConcept"},
            "advisories": {"ref":"Advisories"},
            "created": {"ref":"Created"},
            "published": {"ref":"Published"},
            "updated": {"ref":"Updated"},
            "rejected": {"ref":"Rejected"},
            "credits": {"ref":"Credits"},
            "tools": {"ref":"Tools2"},
            "analysis": {"ref":"ImpactAnalysis"},
            "affects": {"ref":"Affects"},
            "properties": {"ref":"Properties7"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Vulnerabilities": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Vulnerability"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference12": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Ref4": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMLinkElement7": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Subjects": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"Ref4"},{"ref":"BOMLinkElement7"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Annotator": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Timestamp3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Text": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature3": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Annotations1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference12"},
            "subjects": {"ref":"Subjects","required":true},
            "annotator": {"ref":"Annotator","required":true},
            "timestamp": {"ref":"Timestamp3","required":true},
            "text": {"ref":"Text","required":true},
            "signature": {"ref":"Signature3"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Annotations": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Annotations1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference13": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components4": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services4": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference14": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name10": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description6": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferences": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"ResourceReferenceChoice"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference15": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name11": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description7": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferences1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"ResourceReferenceChoice"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskType": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["copy"]},{"dataType":"enum","enums":["clone"]},{"dataType":"enum","enums":["lint"]},{"dataType":"enum","enums":["scan"]},{"dataType":"enum","enums":["merge"]},{"dataType":"enum","enums":["build"]},{"dataType":"enum","enums":["test"]},{"dataType":"enum","enums":["deliver"]},{"dataType":"enum","enums":["deploy"]},{"dataType":"enum","enums":["release"]},{"dataType":"enum","enums":["clean"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskTypes": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"TaskType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference16": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name12": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description8": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferences2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"ResourceReferenceChoice"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type4": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["manual"]},{"dataType":"enum","enums":["api"]},{"dataType":"enum","enums":["webhook"]},{"dataType":"enum","enums":["scheduled"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description9": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeReceived": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attachment1": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice1": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice2": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties8": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Event": {
        "dataType": "refObject",
        "properties": {
            "uid": {"ref":"UniqueIdentifierUID3"},
            "description": {"ref":"Description9"},
            "timeReceived": {"ref":"TimeReceived"},
            "data": {"ref":"Attachment1"},
            "source": {"ref":"ResourceReferenceChoice1"},
            "target": {"ref":"ResourceReferenceChoice2"},
            "properties": {"ref":"Properties8"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description10": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Expression": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties9": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Condition": {
        "dataType": "refObject",
        "properties": {
            "description": {"ref":"Description10"},
            "expression": {"ref":"Expression"},
            "properties": {"ref":"Properties9"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Conditions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Condition"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeActivated": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "InputType": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Inputs1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"InputType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Type5": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["artifact"]},{"dataType":"enum","enums":["attestation"]},{"dataType":"enum","enums":["log"]},{"dataType":"enum","enums":["evidence"]},{"dataType":"enum","enums":["metrics"]},{"dataType":"enum","enums":["other"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice3": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice4": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferenceChoice5": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attachment2": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EnvironmentVariables": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"ref":"LightweightNameValuePair"},{"dataType":"string"}]},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties10": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OutputType1": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OutputType": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"properties":{"ref":"Properties10"},"environmentVars":{"ref":"EnvironmentVariables"},"data":{"ref":"Attachment2"},"resource":{"ref":"ResourceReferenceChoice5"},"target":{"ref":"ResourceReferenceChoice4"},"source":{"ref":"ResourceReferenceChoice3"},"type":{"ref":"Type5"}}},{"ref":"OutputType1"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Outputs1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"OutputType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties11": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Trigger": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference16","required":true},
            "uid": {"ref":"UniqueIdentifierUID2","required":true},
            "name": {"ref":"Name12"},
            "description": {"ref":"Description8"},
            "resourceReferences": {"ref":"ResourceReferences2"},
            "type": {"ref":"Type4","required":true},
            "event": {"ref":"Event"},
            "conditions": {"ref":"Conditions"},
            "timeActivated": {"ref":"TimeActivated"},
            "inputs": {"ref":"Inputs1"},
            "outputs": {"ref":"Outputs1"},
            "properties": {"ref":"Properties11"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name13": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description11": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Executed": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties12": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Command": {
        "dataType": "refObject",
        "properties": {
            "executed": {"ref":"Executed"},
            "properties": {"ref":"Properties12"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Commands": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Command"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties13": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Step": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"Name13"},
            "description": {"ref":"Description11"},
            "commands": {"ref":"Commands"},
            "properties": {"ref":"Properties13"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Steps": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Step"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Inputs2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"InputType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Outputs2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"OutputType1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeStart": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeEnd": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference17": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID4": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name14": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Aliases1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description12": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResourceReferences3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"ResourceReferenceChoice"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AccessMode": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["read-only"]},{"dataType":"enum","enums":["read-write"]},{"dataType":"enum","enums":["read-write-once"]},{"dataType":"enum","enums":["write-once"]},{"dataType":"enum","enums":["write-only"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MountPath": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ManagedDataType": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VolumeRequest": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UniqueIdentifierUID5": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name15": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Mode1": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["filesystem"]},{"dataType":"enum","enums":["block"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Path": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SizeAllocated": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Persistent": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Remote": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties14": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Volume": {
        "dataType": "refObject",
        "properties": {
            "uid": {"ref":"UniqueIdentifierUID5"},
            "name": {"ref":"Name15"},
            "mode": {"ref":"Mode1"},
            "path": {"ref":"Path"},
            "sizeAllocated": {"ref":"SizeAllocated"},
            "persistent": {"ref":"Persistent"},
            "remote": {"ref":"Remote"},
            "properties": {"ref":"Properties14"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties15": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workspace": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference17","required":true},
            "uid": {"ref":"UniqueIdentifierUID4","required":true},
            "name": {"ref":"Name14"},
            "aliases": {"ref":"Aliases1"},
            "description": {"ref":"Description12"},
            "resourceReferences": {"ref":"ResourceReferences3"},
            "accessMode": {"ref":"AccessMode"},
            "mountPath": {"ref":"MountPath"},
            "managedDataType": {"ref":"ManagedDataType"},
            "volumeRequest": {"ref":"VolumeRequest"},
            "volume": {"ref":"Volume"},
            "properties": {"ref":"Properties15"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workspaces": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Workspace"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RuntimeTopology": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Dependency"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties16": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Task1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference15","required":true},
            "uid": {"ref":"UniqueIdentifierUID1","required":true},
            "name": {"ref":"Name11"},
            "description": {"ref":"Description7"},
            "resourceReferences": {"ref":"ResourceReferences1"},
            "taskTypes": {"ref":"TaskTypes","required":true},
            "trigger": {"ref":"Trigger"},
            "steps": {"ref":"Steps"},
            "inputs": {"ref":"Inputs2"},
            "outputs": {"ref":"Outputs2"},
            "timeStart": {"ref":"TimeStart"},
            "timeEnd": {"ref":"TimeEnd"},
            "workspaces": {"ref":"Workspaces"},
            "runtimeTopology": {"ref":"RuntimeTopology"},
            "properties": {"ref":"Properties16"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Tasks": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Task1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskDependencyGraph": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Dependency"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TaskTypes1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"TaskType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Trigger1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference16","required":true},
            "uid": {"ref":"UniqueIdentifierUID2","required":true},
            "name": {"ref":"Name12"},
            "description": {"ref":"Description8"},
            "resourceReferences": {"ref":"ResourceReferences2"},
            "type": {"ref":"Type4","required":true},
            "event": {"ref":"Event"},
            "conditions": {"ref":"Conditions"},
            "timeActivated": {"ref":"TimeActivated"},
            "inputs": {"ref":"Inputs1"},
            "outputs": {"ref":"Outputs1"},
            "properties": {"ref":"Properties11"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Steps1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Step"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Inputs3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"InputType"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Outputs3": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"OutputType1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeStart1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "TimeEnd1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workspaces1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Workspace"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RuntimeTopology1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Dependency"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties17": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workflow": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference14","required":true},
            "uid": {"ref":"UniqueIdentifierUID","required":true},
            "name": {"ref":"Name10"},
            "description": {"ref":"Description6"},
            "resourceReferences": {"ref":"ResourceReferences"},
            "tasks": {"ref":"Tasks"},
            "taskDependencies": {"ref":"TaskDependencyGraph"},
            "taskTypes": {"ref":"TaskTypes1","required":true},
            "trigger": {"ref":"Trigger1"},
            "steps": {"ref":"Steps1"},
            "inputs": {"ref":"Inputs3"},
            "outputs": {"ref":"Outputs3"},
            "timeStart": {"ref":"TimeStart1"},
            "timeEnd": {"ref":"TimeEnd1"},
            "workspaces": {"ref":"Workspaces1"},
            "runtimeTopology": {"ref":"RuntimeTopology1"},
            "properties": {"ref":"Properties17"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Workflows": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Workflow"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties18": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Formula": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference13"},
            "components": {"ref":"Components4"},
            "services": {"ref":"Services4"},
            "workflows": {"ref":"Workflows"},
            "properties": {"ref":"Properties18"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Formulation": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Formula"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference18": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ThirdParty": {
        "dataType": "refAlias",
        "type": {"dataType":"boolean","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalEntity1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference1"},
            "name": {"ref":"OrganizationName"},
            "address": {"ref":"OrganizationAddress"},
            "url": {"ref":"OrganizationURLS"},
            "contact": {"ref":"OrganizationalContact"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Assessor": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference18"},
            "thirdParty": {"ref":"ThirdParty"},
            "organization": {"ref":"OrganizationalEntity1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Assessors": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Assessor"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Summary": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Assessor1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Requirement": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Claims": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CounterClaims": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Score1": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Rationale": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MitigationStrategies": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Conformance": {
        "dataType": "refObject",
        "properties": {
            "score": {"ref":"Score1"},
            "rationale": {"ref":"Rationale"},
            "mitigationStrategies": {"ref":"MitigationStrategies"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Score2": {
        "dataType": "refAlias",
        "type": {"dataType":"double","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Rationale1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Confidence2": {
        "dataType": "refObject",
        "properties": {
            "score": {"ref":"Score2"},
            "rationale": {"ref":"Rationale1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Map1": {
        "dataType": "refObject",
        "properties": {
            "requirement": {"ref":"Requirement"},
            "claims": {"ref":"Claims"},
            "counterClaims": {"ref":"CounterClaims"},
            "conformance": {"ref":"Conformance"},
            "confidence": {"ref":"Confidence2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Map": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Map1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature4": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attestation": {
        "dataType": "refObject",
        "properties": {
            "summary": {"ref":"Summary"},
            "assessor": {"ref":"Assessor1"},
            "map": {"ref":"Map"},
            "signature": {"ref":"Signature4"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attestations": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Attestation"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference19": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Target": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Predicate": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MitigationStrategies1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Reasoning": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Evidence1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CounterEvidence": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences5": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature5": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Claim": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference19"},
            "target": {"ref":"Target"},
            "predicate": {"ref":"Predicate"},
            "mitigationStrategies": {"ref":"MitigationStrategies1"},
            "reasoning": {"ref":"Reasoning"},
            "evidence": {"ref":"Evidence1"},
            "counterEvidence": {"ref":"CounterEvidence"},
            "externalReferences": {"ref":"ExternalReferences5"},
            "signature": {"ref":"Signature5"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Claims1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Claim"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference20": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PropertyName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description13": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataName": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Attachment3": {
        "dataType": "refObject",
        "properties": {
            "contentType": {"ref":"ContentType"},
            "encoding": {"ref":"Encoding"},
            "content": {"ref":"AttachmentText1","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataURL1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataContents1": {
        "dataType": "refObject",
        "properties": {
            "attachment": {"ref":"Attachment3"},
            "url": {"ref":"DataURL1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SensitiveData1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DataGovernance2": {
        "dataType": "refObject",
        "properties": {
            "custodians": {"ref":"DataCustodians"},
            "stewards": {"ref":"DataStewards"},
            "owners": {"ref":"DataOwners"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Data3": {
        "dataType": "refObject",
        "properties": {
            "name": {"ref":"DataName"},
            "contents": {"ref":"DataContents1"},
            "classification": {"ref":"DataClassification"},
            "sensitiveData": {"ref":"SensitiveData1"},
            "governance": {"ref":"DataGovernance2"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Data2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Data3"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Created1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Expires": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalContact3": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference3"},
            "name": {"ref":"Name1"},
            "email": {"ref":"EmailAddress"},
            "phone": {"ref":"Phone"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrganizationalContact4": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference3"},
            "name": {"ref":"Name1"},
            "email": {"ref":"EmailAddress"},
            "phone": {"ref":"Phone"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature6": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Evidence3": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference20"},
            "propertyName": {"ref":"PropertyName"},
            "description": {"ref":"Description13"},
            "data": {"ref":"Data2"},
            "created": {"ref":"Created1"},
            "expires": {"ref":"Expires"},
            "author": {"ref":"OrganizationalContact3"},
            "reviewer": {"ref":"OrganizationalContact4"},
            "signature": {"ref":"Signature6"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Evidence2": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Evidence3"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Organizations1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"OrganizationalEntity"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Components5": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Component"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Services5": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Service"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Targets": {
        "dataType": "refObject",
        "properties": {
            "organizations": {"ref":"Organizations1"},
            "components": {"ref":"Components5"},
            "services": {"ref":"Services5"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Statement": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signatory": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signatories": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refAlias","ref":"Signatory"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature7": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Affirmation": {
        "dataType": "refObject",
        "properties": {
            "statement": {"ref":"Statement"},
            "signatories": {"ref":"Signatories"},
            "signature": {"ref":"Signature7"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature8": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Declarations": {
        "dataType": "refObject",
        "properties": {
            "assessors": {"ref":"Assessors"},
            "attestations": {"ref":"Attestations"},
            "claims": {"ref":"Claims1"},
            "evidence": {"ref":"Evidence2"},
            "targets": {"ref":"Targets"},
            "affirmation": {"ref":"Affirmation"},
            "signature": {"ref":"Signature8"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference21": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Name16": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Version1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description14": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Owner": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference22": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Identifier1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Title2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Text1": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Descriptions": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OWASPOpenCREIdentifierS": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ParentBOMReference": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties19": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences6": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Requirement1": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference22"},
            "identifier": {"ref":"Identifier1"},
            "title": {"ref":"Title2"},
            "text": {"ref":"Text1"},
            "descriptions": {"ref":"Descriptions"},
            "openCre": {"ref":"OWASPOpenCREIdentifierS"},
            "parent": {"ref":"ParentBOMReference"},
            "properties": {"ref":"Properties19"},
            "externalReferences": {"ref":"ExternalReferences6"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Requirements": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Requirement1"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BOMReference23": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Identifier2": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Title3": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Description15": {
        "dataType": "refAlias",
        "type": {"dataType":"string","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Requirements1": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"string"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Level": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference23"},
            "identifier": {"ref":"Identifier2"},
            "title": {"ref":"Title3"},
            "description": {"ref":"Description15"},
            "requirements": {"ref":"Requirements1"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Levels": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Level"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ExternalReferences7": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"ExternalReference"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature9": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Standard": {
        "dataType": "refObject",
        "properties": {
            "bom-ref": {"ref":"BOMReference21"},
            "name": {"ref":"Name16"},
            "version": {"ref":"Version1"},
            "description": {"ref":"Description14"},
            "owner": {"ref":"Owner"},
            "requirements": {"ref":"Requirements"},
            "levels": {"ref":"Levels"},
            "externalReferences": {"ref":"ExternalReferences7"},
            "signature": {"ref":"Signature9"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Standards": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"Standard"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Definitions": {
        "dataType": "refObject",
        "properties": {
            "standards": {"ref":"Standards"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Properties20": {
        "dataType": "refAlias",
        "type": {"dataType":"array","array":{"dataType":"refObject","ref":"LightweightNameValuePair"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Signature10": {
        "dataType": "refObject",
        "properties": {
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Partial_SbomDocumentBase_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"$schema":{"dataType":"string"},"bomFormat":{"dataType":"enum","enums":["CycloneDX"]},"specVersion":{"dataType":"string"},"serialNumber":{"dataType":"string"},"version":{"dataType":"double"},"metadata":{"ref":"BOMMetadata"},"components":{"ref":"Components2"},"services":{"ref":"Services2"},"externalReferences":{"ref":"ExternalReferences4"},"dependencies":{"ref":"Dependencies"},"compositions":{"ref":"Compositions"},"vulnerabilities":{"ref":"Vulnerabilities"},"annotations":{"ref":"Annotations"},"formulation":{"ref":"Formulation"},"declarations":{"ref":"Declarations"},"definitions":{"ref":"Definitions"},"properties":{"ref":"Properties20"},"signature":{"ref":"Signature10"}},"additionalProperties":{"dataType":"any"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SbomDocumentCreate": {
        "dataType": "refObject",
        "properties": {
            "$schema": {"dataType":"string"},
            "bomFormat": {"dataType":"enum","enums":["CycloneDX"]},
            "specVersion": {"dataType":"string"},
            "serialNumber": {"dataType":"string"},
            "version": {"dataType":"double"},
            "metadata": {"ref":"BOMMetadata"},
            "components": {"ref":"Components2"},
            "services": {"ref":"Services2"},
            "externalReferences": {"ref":"ExternalReferences4"},
            "dependencies": {"ref":"Dependencies"},
            "compositions": {"ref":"Compositions"},
            "vulnerabilities": {"ref":"Vulnerabilities"},
            "annotations": {"ref":"Annotations"},
            "formulation": {"ref":"Formulation"},
            "declarations": {"ref":"Declarations"},
            "definitions": {"ref":"Definitions"},
            "properties": {"ref":"Properties20"},
            "signature": {"ref":"Signature10"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentCreate": {
        "dataType": "refObject",
        "properties": {
            "topic": {"dataType":"string","required":true},
            "text": {"dataType":"string","required":true},
            "private": {"dataType":"boolean"},
            "approved": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "hash": {"dataType":"string","required":true},
            "collection": {"dataType":"string"},
            "doc": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "size": {"dataType":"double","required":true},
            "date": {"dataType":"double","required":true},
            "type": {"dataType":"string","required":true},
            "url": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SbomDocumentUpdate": {
        "dataType": "refObject",
        "properties": {
            "$schema": {"dataType":"string"},
            "bomFormat": {"dataType":"enum","enums":["CycloneDX"]},
            "specVersion": {"dataType":"string"},
            "serialNumber": {"dataType":"string"},
            "version": {"dataType":"double"},
            "metadata": {"ref":"BOMMetadata"},
            "components": {"ref":"Components2"},
            "services": {"ref":"Services2"},
            "externalReferences": {"ref":"ExternalReferences4"},
            "dependencies": {"ref":"Dependencies"},
            "compositions": {"ref":"Compositions"},
            "vulnerabilities": {"ref":"Vulnerabilities"},
            "annotations": {"ref":"Annotations"},
            "formulation": {"ref":"Formulation"},
            "declarations": {"ref":"Declarations"},
            "definitions": {"ref":"Definitions"},
            "properties": {"ref":"Properties20"},
            "signature": {"ref":"Signature10"},
            "state": {"dataType":"string"},
            "comment": {"ref":"CommentCreate"},
            "attachments": {"dataType":"array","array":{"dataType":"refObject","ref":"AttachmentInfo"}},
            "$set": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentUpdate": {
        "dataType": "refObject",
        "properties": {
            "topic": {"dataType":"string"},
            "text": {"dataType":"string"},
            "private": {"dataType":"boolean"},
            "approved": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsOdsServerController_getInfo: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/odsServer/info',
            ...(fetchMiddlewares<RequestHandler>(OdsServerController)),
            ...(fetchMiddlewares<RequestHandler>(OdsServerController.prototype.getInfo)),

            async function OdsServerController_getInfo(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsServerController_getInfo, request, response });

                const controller = new OdsServerController();

              await templateService.apiHandler({
                methodName: 'getInfo',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsServerController_getRoles: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/odsServer/roles',
            ...(fetchMiddlewares<RequestHandler>(OdsServerController)),
            ...(fetchMiddlewares<RequestHandler>(OdsServerController.prototype.getRoles)),

            async function OdsServerController_getRoles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsServerController_getRoles, request, response });

                const controller = new OdsServerController();

              await templateService.apiHandler({
                methodName: 'getRoles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_getSboms: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/odsServer/docs/sbom',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.getSboms)),

            async function SbomController_getSboms(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_getSboms, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'getSboms',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_getSbom: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/odsServer/docs/sbom/:id',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.getSbom)),

            async function SbomController_getSbom(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_getSbom, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'getSbom',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_getSbomsWithFilter: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/odsServer/docs/sbom',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.getSbomsWithFilter)),

            async function SbomController_getSbomsWithFilter(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_getSbomsWithFilter, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'getSbomsWithFilter',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_createSbom: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"ref":"SbomDocumentCreate"},
        };
        app.put('/api/odsServer/docs/sbom',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.createSbom)),

            async function SbomController_createSbom(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_createSbom, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'createSbom',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_updateSbom: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"SbomDocumentUpdate"},
        };
        app.patch('/api/odsServer/docs/sbom/:id',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.updateSbom)),

            async function SbomController_updateSbom(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_updateSbom, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'updateSbom',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_deleteSbom: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/api/odsServer/docs/sbom/:id',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.deleteSbom)),

            async function SbomController_deleteSbom(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_deleteSbom, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'deleteSbom',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_deleteSbomWithFilter: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                match: {"in":"query","name":"match","required":true,"dataType":"string"},
        };
        app.delete('/api/odsServer/docs/sbom',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.deleteSbomWithFilter)),

            async function SbomController_deleteSbomWithFilter(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_deleteSbomWithFilter, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'deleteSbomWithFilter',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_addSbomComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CommentCreate"},
        };
        app.put('/api/odsServer/docs/sbom/:id/comment',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.addSbomComment)),

            async function SbomController_addSbomComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_addSbomComment, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'addSbomComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_updateSbomComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CommentUpdate"},
        };
        app.patch('/api/odsServer/docs/sbom/:id/comment/:commentId',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.updateSbomComment)),

            async function SbomController_updateSbomComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_updateSbomComment, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'updateSbomComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_deleteSbomComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
        };
        app.delete('/api/odsServer/docs/sbom/:id/comment/:commentId',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.deleteSbomComment)),

            async function SbomController_deleteSbomComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_deleteSbomComment, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'deleteSbomComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_addSbomAttachment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"CommentCreate"},
        };
        app.put('/api/odsServer/docs/sbom/:id/attachments',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.addSbomAttachment)),

            async function SbomController_addSbomAttachment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_addSbomAttachment, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'addSbomAttachment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSbomController_deleteSbomAttachment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                attachmentId: {"in":"path","name":"attachmentId","required":true,"dataType":"string"},
        };
        app.delete('/api/odsServer/docs/sbom/:id/attachments/:attachmentId',
            ...(fetchMiddlewares<RequestHandler>(SbomController)),
            ...(fetchMiddlewares<RequestHandler>(SbomController.prototype.deleteSbomAttachment)),

            async function SbomController_deleteSbomAttachment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSbomController_deleteSbomAttachment, request, response });

                const controller = new SbomController();

              await templateService.apiHandler({
                methodName: 'deleteSbomAttachment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
