'use client';

import React from 'react';
import { useTimer } from 'nhb-hooks';

export default function Test() {
	const { days, hours, minutes, seconds } = useTimer(6, 'day');
	return (
		<div>
			{days} : {hours} : {minutes}: {seconds}
		</div>
	);
}
