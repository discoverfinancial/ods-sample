/**
 * Copyright (c) 2025 Capital One
*/

export * from 'dlms-base';

export interface MostUsed {
    name: string;
    group: string;
    basePurl: string;
    count?: number;
}

export interface GetVersions {
    name: string;
    version: string;
    group: string;
    basePurl: string;
    count?: number;
}

export interface BomRef {
    name: string;
    version: string;
    type: string;
    purl: string;
    group: string;
}

export interface UsesLibrary {
    id?: string;
    name?: string;
    version?: string;
    purl?: string;
}

export interface OssAnalysis {
    name: string;
    version: string;
    purl: string;
    basePurl: string;
    latestVersion: string;
    scorecard: any;
    guidance: any;
    links: any;
    packageKey: any;
}