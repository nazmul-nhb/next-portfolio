import { useEffect, useState } from 'react';

export const useMount = <T extends React.ReactNode>(children: T): T | null => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return children;
};
