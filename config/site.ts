export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: 'Nazmul Hassan',
	description: 'Portfolio Website of Nazmul Hassan',
	navItems: [
		{
			label: 'Home',
			href: '/',
		},
		{
			label: 'Docs',
			href: '/docs',
		},
		{
			label: 'Blog',
			href: '/blog',
		},
		{
			label: 'About',
			href: '/about',
		},
	],
	navMenuItems: [
		{
			label: 'Profile',
			href: '/profile',
		},
		{
			label: 'Dashboard',
			href: '/dashboard',
		},
		{
			label: 'Projects',
			href: '/projects',
		},
		{
			label: 'Team',
			href: '/team',
		},
		{
			label: 'Calendar',
			href: '/calendar',
		},
		{
			label: 'Settings',
			href: '/settings',
		},
		{
			label: 'Help & Feedback',
			href: '/help-feedback',
		},
		{
			label: 'Logout',
			href: '/logout',
		},
	],
	links: {
		github: 'https://github.com/nazmul-nhb',
		discord: 'https://discord.com/users/831030314528538664',
	},
};
