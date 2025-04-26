'use client';

import { Button, Input, Tab, Tabs } from '@heroui/react';
import { useState } from 'react';

import { loginUser, registerUser } from '@/lib/actions/api.auth';
import { useAuthStore } from '@/lib/store/authStore';

interface Props {
	/** Close the modal */
	closeModal: () => void;
}

/**
 * Login/Register Modal Component (HeroUI based)
 */
export default function LoginRegister({ closeModal }: Props) {
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { syncUser } = useAuthStore();

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			await loginUser(email, password);

			await syncUser();

			setEmail('');
			setPassword('');
			setError(null);
			closeModal();
		} catch (err) {
			setError((err as Error).message || 'Login failed');
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegister = async () => {
		setIsLoading(true);
		try {
			await registerUser(email, password);
			await loginUser(email, password);
			await syncUser();
			setEmail('');
			setPassword('');
			setError(null);
			closeModal();
		} catch (err) {
			setError((err as Error).message || 'Registration failed');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="Login or Register"
				className="mb-6"
				selectedKey={activeTab}
				onSelectionChange={(key) => setActiveTab(key as 'login' | 'register')}
			>
				<Tab key="login" title="Login">
					<FormFields
						buttonLabel="Login"
						email={email}
						error={error}
						isLoading={isLoading}
						password={password}
						setEmail={setEmail}
						setPassword={setPassword}
						onSubmit={handleLogin}
					/>
				</Tab>
				<Tab key="register" title="Register">
					<FormFields
						buttonLabel="Register"
						email={email}
						error={error}
						isLoading={isLoading}
						password={password}
						setEmail={setEmail}
						setPassword={setPassword}
						onSubmit={handleRegister}
					/>
				</Tab>
			</Tabs>
		</div>
	);
}

/**
 * Form Fields for Email and Password Input
 */
interface FormFieldsProps {
	email: string;
	password: string;
	setEmail: (email: string) => void;
	setPassword: (password: string) => void;
	isLoading: boolean;
	error: string | null;
	onSubmit: () => void;
	buttonLabel: string;
}

function FormFields({
	email,
	password,
	setEmail,
	setPassword,
	isLoading,
	error,
	onSubmit,
	buttonLabel,
}: FormFieldsProps) {
	return (
		<div className="space-y-4">
			<Input
				label="Email"
				placeholder="example@mail.com"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<Input
				label="Password"
				placeholder="Your password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			{error && <p className="text-sm text-red-500">{error}</p>}
			<Button
				className="w-full bg-primary hover:bg-primary-dark"
				isLoading={isLoading}
				onPress={onSubmit}
			>
				{buttonLabel}
			</Button>
		</div>
	);
}
