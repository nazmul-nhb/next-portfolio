import type { HttpStatusCode } from 'nhb-toolbox/http-status/types';
import type { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};

export type TCollection =
    | 'N/A'
    | 'User'
    | 'Project'
    | 'Skill'
    | 'Bio'
    | 'Education'
    | 'Package'
    | 'Experience'
    | 'Link'
    | 'Email';

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'OK';

export type TResponseDetails = { message: string; statusCode: HttpStatusCode };

export type ErrorCode = HttpStatusCode<'clientError' | 'serverError'>;

export type SuccessCode = HttpStatusCode<'informational' | 'success'>;

export interface DBItem {
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServerResponse<T> {
    success: boolean;
    message: string;
    status: number;
    data?: T;
}
