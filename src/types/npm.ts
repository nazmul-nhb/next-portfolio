import type { ISOTimeString } from 'nhb-toolbox/date/types';
import type { Prettify } from 'nhb-toolbox/utils/types';
import type { PKG_FIELDS } from '@/lib/constants';

export interface PackageDetails {
    _id: string;
    _rev: string;
    name: string;
    'dist-tags'?: Partial<DistTags>;
    versions?: Partial<Versions>;
    time: Partial<Time>;
    bugs?: Partial<Bugs>;
    author?: Partial<Contributor>;
    license?: string;
    homepage?: string;
    keywords?: string[];
    repository?: Partial<Repository>;
    description?: string;
    contributors?: Partial<Contributor>[];
    maintainers?: Partial<Contributor>[];
    readme?: string;
    readmeFilename?: string;
}

interface Time {
    created: ISOTimeString;
    modified: ISOTimeString;
    [version: string]: ISOTimeString;
}

interface Versions {
    [version: string]: string;
}

interface Bugs {
    url: string;
    email: string;
}

export interface Contributor {
    url: string;
    name: string;
    email: string;
}

interface Repository {
    url: string;
    type: string;
}

interface DistTags {
    next: string;
    latest: string;
    [tag: string]: string;
}

export interface PackageDlData {
    downloads: number;
    start: string;
    end: string;
    package: string;
}

export type PackageResponse = Prettify<
    Pick<PackageDetails, (typeof PKG_FIELDS)[number]> & PackageDlData
>;

export type PackageSearch = { packageName: string; startDate: string; endDate: string };
