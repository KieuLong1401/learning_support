'use client'

import {
	AlarmClock,
	ArrowLeft,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Timer,
	X,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export default function Pomodoro() {
	const [isOpen, setIsOpen] = useState(false)
	const [isRunning, setIsRunning] = useState(false)
	const [isSettingOpen, setIsSettingOpen] = useState(false)
	const [isAlarmOn, setIsAlarmOn] = useState(false)

	const [settings, setSettings] = useState({
		pomodoro: 25 * 60,
		shortBreak: 5 * 60,
		longBreak: 15 * 60,
	})
	const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>(
		'pomodoro'
	)
	const [time, setTime] = useState(10000)

	const [pomodoroInput, setPomodoroInput] = useState(
		(settings.pomodoro / 60).toString()
	)
	const [shortBreakInput, setShortBreakInput] = useState(
		(settings.shortBreak / 60).toString()
	)
	const [longBreakInput, setLongBreakInput] = useState(
		(settings.longBreak / 60).toString()
	)

	useEffect(() => {
		if (localStorage.getItem('pomodoroSettings')) {
			const settings = JSON.parse(
				localStorage.getItem('pomodoroSettings')!
			)
			setSettings(settings)
			setMode('pomodoro')
		} else {
			localStorage.setItem(
				'pomodoroSettings',
				JSON.stringify({
					pomodoro: 25 * 60,
					shortBreak: 5 * 60,
					longBreak: 15 * 60,
				})
			)
		}
	}, [])

	useEffect(() => {
		setTime(settings[mode])
		setIsRunning(false)
	}, [mode, settings])

	useEffect(() => {
		let interval = null

		if (isRunning) {
			if (time == 0) {
				setIsAlarmOn(true)
				setIsRunning(false)
			}
			interval = setInterval(() => {
				setTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
			}, 1000)
		} else if (!isRunning && time !== 0 && interval) {
			clearInterval(interval)
		}

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [isRunning, time])

	useEffect(() => {
		setPomodoroInput((settings.pomodoro / 60).toString())
		setShortBreakInput((settings.shortBreak / 60).toString())
		setLongBreakInput((settings.longBreak / 60).toString())
	}, [isSettingOpen, settings])

	function getTimeString(seconds: number) {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60
		return `${String(minutes).padStart(2, '0')}:${String(
			remainingSeconds
		).padStart(2, '0')}`
	}

	return (
		<>
			<div
				className={
					'absolute bottom-4 right-4 z-10' +
					(isOpen ? ' w-150 h-80' : '')
				}
			>
				<Button
					className='rounded-full w-fit absolute top-4 left-4'
					variant={'outline'}
					onClick={() => setIsSettingOpen(!isSettingOpen)}
					hidden={!isOpen}
				>
					{isSettingOpen ? <ArrowLeft /> : <Settings />}
				</Button>
				{isSettingOpen && isOpen ? (
					<Card className='flex flex-col items-center justify-center gap-16 h-full'>
						<div className='flex flex-row gap-4 px-32'>
							<div className='flex flex-col items-center'>
								<Label
									htmlFor='pomodoro-time'
									className='mb-4'
								>
									포모도로
								</Label>
								<Input
									id='pomodoro-time'
									type='text'
									value={pomodoroInput}
									onChange={(e) => {
										setPomodoroInput(e.target.value)
									}}
								/>
							</div>
							<div className='flex flex-col items-center'>
								<Label
									htmlFor='short-break-time'
									className='mb-4'
								>
									짧은 휴식
								</Label>
								<Input
									id='short-break-time'
									type='text'
									value={shortBreakInput}
									onChange={(e) =>
										setShortBreakInput(e.target.value)
									}
								/>
							</div>
							<div className='flex flex-col items-center'>
								<Label
									htmlFor='long-break-time'
									className='mb-4'
								>
									긴 휴식
								</Label>
								<Input
									id='long-break-time'
									type='text'
									value={longBreakInput}
									onChange={(e) =>
										setLongBreakInput(e.target.value)
									}
								/>
							</div>
						</div>
						<div className='flex gap-4 items-center justify-center'>
							<Button
								variant='outline'
								onClick={() => {
									const newSettings = {
										pomodoro: 25 * 60,
										shortBreak: 5 * 60,
										longBreak: 15 * 60,
									}
									setSettings(newSettings)
									localStorage.setItem(
										'pomodoroSettings',
										JSON.stringify(newSettings)
									)
									setTime(newSettings[mode])
									setIsSettingOpen(false)
								}}
							>
								원래대로
							</Button>
							<Button
								onClick={() => {
									const newSettings = {
										pomodoro: parseInt(pomodoroInput) * 60,
										shortBreak:
											parseInt(shortBreakInput) * 60,
										longBreak:
											parseInt(longBreakInput) * 60,
									}
									setSettings(newSettings)
									localStorage.setItem(
										'pomodoroSettings',
										JSON.stringify(newSettings)
									)
									setTime(newSettings[mode])
									setIsSettingOpen(false)
								}}
							>
								저장
							</Button>
						</div>
					</Card>
				) : (
					<Card
						className='flex flex-col items-center justify-center gap-0 h-full'
						hidden={!isOpen}
					>
						<div className='flex gap-4 mb-8'>
							<Button
								onClick={() => setMode('pomodoro')}
								variant={
									mode == 'pomodoro' ? 'default' : 'secondary'
								}
							>
								포모도로
							</Button>
							<Button
								onClick={() => setMode('shortBreak')}
								variant={
									mode == 'shortBreak'
										? 'default'
										: 'secondary'
								}
							>
								짧은 휴식
							</Button>
							<Button
								onClick={() => setMode('longBreak')}
								variant={
									mode == 'longBreak'
										? 'default'
										: 'secondary'
								}
							>
								긴 휴식
							</Button>
						</div>
						<h1 className='text-8xl mb-8'>{getTimeString(time)}</h1>
						<div className='flex gap-2'>
							<Button onClick={() => setIsRunning(!isRunning)}>
								{isRunning ? <Pause /> : <Play />}
							</Button>
							<Button
								onClick={() => {
									setTime(settings[mode])
									setIsRunning(false)
								}}
							>
								<RotateCcw />
							</Button>
						</div>
					</Card>
				)}

				<Button
					className='absolute bottom-4 right-4'
					onClick={() => setIsOpen(!isOpen)}
				>
					{isOpen ? <X /> : <Timer />}
				</Button>
			</div>
			<div
				className='bg-black absolute w-full h-full z-100 opacity-80 flex flex-col items-center justify-center gap-16 text-white'
				hidden={!isAlarmOn}
			>
				<AlarmClock
					size={200}
					className='wiggle'
				/>
				<div className='flex gap-4'>
					<Button
						variant={'outline'}
						onClick={() => setIsAlarmOn(false)}
					>
						닫기
					</Button>
					<Button>포모도로 시작</Button>
				</div>
			</div>
		</>
	)
}
