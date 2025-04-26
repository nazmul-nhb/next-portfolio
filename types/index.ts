import type { STATUS_CODES } from '@/constants';
import type { SVGProps } from 'react';

export type IconSvgProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

export type TCollection =
	| 'N/A'
	| 'Project'
	| 'Skill'
	| 'Bio'
	| 'Education'
	| 'Package'
	| 'Experience'
	| 'Link'
	| 'Email';

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'OK';

export type TResponseDetails = { message: string; statusCode: number };

export type TStatusCode = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

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
