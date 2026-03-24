import type { Route } from 'next';
import type { HttpStatusCode } from 'nhb-toolbox/http-status/types';
import type { GenericObject } from 'nhb-toolbox/object/types';
import type React from 'react';
import type { ReactNode, SVGProps } from 'react';
import type { SiteConfig } from '@/configs/site';
import type { FONT_OPTIONS } from '@/lib/constants';

export type Uncertain<T> = T | null | undefined;

export type AuthProviders = 'credentials' | 'google';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type TCollection =
    | 'N/A'
    | 'User'
    | 'Contact Message'
    | 'Project'
    | 'Skill'
    | 'Bio'
    | 'Education'
    | 'Package'
    | 'Experience'
    | 'Testimonial'
    | 'Link'
    | 'Email'
    | 'Blog'
    | 'Comment'
    | 'Tag'
    | 'Category'
    | 'Expense'
    | 'Loan'
    | 'Loan Payment'
    | 'Receipt'
    | 'Message'
    | 'Conversation'
    | 'OTP'
    | 'Poll'
    | 'Vote';

export type UserRole = SiteConfig['userRoles'][number];

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'OK';

export type TResponseDetails = { message: string; statusCode: HttpStatusCode };

export type ErrorCode = HttpStatusCode<'clientError' | 'serverError'>;

export type SuccessCode = HttpStatusCode<'informational' | 'success'>;

export interface DBItem {
    id: string;
    created_at: string;
    updated_at: string;
}

export interface ServerResponse<T> {
    success: boolean;
    message: string;
    status: number;
    data?: T;
}

export interface Tab {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    path: Route;
    type?: never;
}

export interface Separator {
    type: 'separator';
    title?: never;
    icon?: never;
    path?: never;
}

export type TabItem = Tab | Separator;

export type ChildrenProp = {
    children: ReactNode;
};

export interface ReorderItem {
    id: number;
    sort_order: number;
}

/** Utility type to replace `Date` properties with `string` in a given type `T` */
export type ReplaceDate<T extends GenericObject> = {
    [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type FontId = (typeof FONT_OPTIONS)[number]['value'];
