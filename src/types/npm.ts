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
    created: string;
    modified: string;
    [version: string]: string;
}

interface Versions {
    [version: string]: string;
}

interface Bugs {
    url: string;
    email: string;
}

interface Contributor {
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
