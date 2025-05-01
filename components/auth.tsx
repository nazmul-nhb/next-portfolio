'use client';

import type { TCredentials, TUserFields } from '@/types/user.types';

import { Button, Form, Input, Tab, Tabs } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { isEmptyObject } from 'nhb-toolbox';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';

import { registerUser } from '@/lib/actions/api.auth';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/actions/cloudinary';
import { useAuthStore } from '@/lib/store/authStore';
import { UserLoginSchema, UserRegisterFields } from '@/schema/user.schema';

interface Props {
	/** Close the modal */
	closeModal: () => void;
}

/**
 * Login/Register Modal Component (HeroUI based)
 */
export default function LoginRegister({ closeModal }: Props) {
	const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

	return (
		<div className="flex w-full flex-col">
			<Tabs
				aria-label="Login or Register"
				className="mb-6"
				selectedKey={activeTab}
				onSelectionChange={(key) => setActiveTab(key as typeof activeTab)}
			>
				<Tab key="login" title="Login">
					<LoginForm closeModal={closeModal} />
				</Tab>
				<Tab key="register" title="Register">
					<RegisterForm closeModal={closeModal} />
				</Tab>
			</Tabs>
		</div>
	);
}

/**
 * Login Form Component
 */
function LoginForm({ closeModal }: Props) {
	const { login } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);
	const [catchError, setCatchError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TCredentials>({
		resolver: zodResolver(UserLoginSchema),
	});

	const onSubmit = async (data: TCredentials) => {
		try {
			setCatchError(null);

			await login(data);

			closeModal();
		} catch (err) {
			console.error(err);
			setCatchError((err as Error)?.message || 'Failed to login. Please try again!');
		}
	};

	return (
		<Form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<Input
				errorMessage={errors.email?.message}
				isInvalid={!!errors.email}
				label="Email"
				placeholder="example@mail.com"
				startContent={<FiMail />}
				type="email"
				{...register('email')}
			/>
			<Input
				endContent={
					<Button
						isIconOnly
						size="sm"
						type="button"
						variant="solid"
						onPress={() => setShowPassword((prev) => !prev)}
					>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</Button>
				}
				errorMessage={errors.password?.message}
				isInvalid={!!errors.password}
				label="Password"
				placeholder="Your password"
				startContent={<FiLock />}
				type={showPassword ? 'text' : 'password'}
				{...register('password')}
			/>

			{catchError && (
				<p className="text-sm text-red-500 text-center mt-2">{catchError}</p>
			)}
			<Button
				className="w-full bg-primary hover:bg-primary-dark"
				isLoading={isSubmitting}
				type="submit"
			>
				Login
			</Button>
		</Form>
	);
}

/**
 * Register Form Component
 */
function RegisterForm({ closeModal }: Props) {
	const { login } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);
	const [catchError, setCatchError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<TUserFields>({
		resolver: zodResolver(UserRegisterFields),
	});

	const onSubmit = async (data: TUserFields) => {
		try {
			setCatchError(null);

			const res = await uploadToCloudinary(data.image, 'user');

			if (isEmptyObject(res)) {
				return console.error('Image upload failed!');
			}

			const userData = { ...data, image: res.url };

			try {
				const reg = await registerUser(userData);

				if (!reg.success) {
					await deleteFromCloudinary(res.publicId);

					setCatchError('Registration failed. Please try again.');

					return;
				}

				await login({ email: data.email, password: data.password });

				closeModal();
			} catch (err) {
				if (res?.publicId) {
					await deleteFromCloudinary(res.publicId);
				}

				throw err;
			}
		} catch (error) {
			console.error(error);
			setCatchError(
				(error as Error)?.message || 'Failed to Register. Please try again!'
			);
		}
	};

	return (
		<Form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<Input
				errorMessage={errors.name?.message}
				isInvalid={!!errors.name}
				label="Name"
				placeholder="Your name"
				startContent={<FiUser />}
				type="text"
				{...register('name')}
			/>
			<Input
				errorMessage={errors.email?.message}
				isInvalid={!!errors.email}
				label="Email"
				placeholder="example@mail.com"
				startContent={<FiMail />}
				type="email"
				{...register('email')}
			/>
			<Input
				endContent={
					<Button
						isIconOnly
						size="sm"
						type="button"
						variant="solid"
						onPress={() => setShowPassword((prev) => !prev)}
					>
						{showPassword ? <FiEyeOff /> : <FiEye />}
					</Button>
				}
				errorMessage={errors.password?.message}
				isInvalid={!!errors.password}
				label="Password"
				placeholder="Your password"
				startContent={<FiLock />}
				type={showPassword ? 'text' : 'password'}
				{...register('password')}
			/>
			<Input
				accept="image/jpeg, image/jpg, image/png, image/svg+xml, image/gif"
				errorMessage={errors.image?.message?.toString()}
				isInvalid={!!errors.image}
				label="Profile Image"
				type="file"
				{...register('image')}
			/>
			{catchError && (
				<p className="text-sm text-red-500 text-center mt-2">{catchError}</p>
			)}
			<Button
				className="w-full bg-primary hover:bg-primary-dark"
				isLoading={isSubmitting}
				type="submit"
			>
				Register
			</Button>
		</Form>
	);
}
