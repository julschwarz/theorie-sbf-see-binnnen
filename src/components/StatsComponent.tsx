import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Card, Progress, Statistic } from 'antd';
import _, { round } from 'lodash';
import React, { useEffect, useState } from 'react';
import '../styles.css';
export function StatsComponent(props: {
	progress: Record<string, { rightCount: number; wrongCount: number }>;
	setProgress: any;
	catalogues: string[];
	numberTotalQuestions: number;
}) {
	const { progress, setProgress, catalogues, numberTotalQuestions } = props;

	const answersInSelectedCatalogue = Object.entries(progress).filter(([index, counts]) =>
		catalogues.includes(index.replace(/[^/_]*[_]/, ''))
	);
	// every question equals its fraction from total number of questions.
	// If it has been answered once right -> 100 %, once right once wrong => 50%
	const catalogueMemorizationPercent =
		_.sum(
			answersInSelectedCatalogue.map(([index, count]) => count.rightCount / (count.rightCount + count.wrongCount))
		) / numberTotalQuestions;

	// Processed questions within selected catalogues:
	const indexesProcessedInSelectedCatalogue = answersInSelectedCatalogue.map((a) => a[0]);

	const selectedProgress = _.zipObject(
		indexesProcessedInSelectedCatalogue,
		answersInSelectedCatalogue.map((a) => a[1])
	);

	// Alle mindestens einmal richtig oder doppelt so oft richtig wie falsch beantwortet

	const [noAnsweredQuestions, setNoAnsweredQuestions] = useState(indexesProcessedInSelectedCatalogue.length);

	useEffect(() => {
		setNoAnsweredQuestions(indexesProcessedInSelectedCatalogue.length);
	}, [progress, setProgress, catalogues, indexesProcessedInSelectedCatalogue.length]); // Only re-run the effect if progress changes

	return (
		<div>
			<br />
			<h2>
				{`Lernstatistik für die Kataloge ${
					catalogues.length != 0 &&
					catalogues.reduce((prev, cur) => prev.replace('_', ' ') + ', ' + cur.replace('_', ' '))
				}`}
			</h2>
			<br />
			<div className={'StatsContainer'}>
				<Card title={`Jede Frage beantwortet`} bordered={false}>
					{
						<Progress
							type="circle"
							strokeColor={{
								'0%': 'red',
								'60%': 'orange',
								'99%': 'limegreen',
							}}
							percent={round(
								(indexesProcessedInSelectedCatalogue.length / numberTotalQuestions) * 100,
								1
							)}
						/>
					}
					<div>
						{indexesProcessedInSelectedCatalogue.length} / {numberTotalQuestions}
					</div>
				</Card>

				<Card title="Anzahl richtig/falsch beantworteter Fragen" bordered={false}>
					<Statistic
						title="Falsch beantwortete Fragen"
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].wrongCount > 0 && progress[id].rightCount == 0
							).length
						}
						prefix={<DislikeOutlined />}
					/>

					<Statistic
						title="Richtig beantwortete Fragen"
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].rightCount > 0
							).length
						}
						prefix={
							<div>
								1x
								<LikeOutlined />
							</div>
						}
					/>

					<Statistic
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].rightCount > 2
							).length
						}
						prefix={
							<div>
								2x
								<LikeOutlined />
							</div>
						}
					/>

					<Statistic
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].rightCount > 3
							).length
						}
						prefix={
							<div>
								3x
								<LikeOutlined />
							</div>
						}
					/>
				</Card>

				<Card title="Lernfortschritt" bordered={false}>
					{
						<Progress
							type="circle"
							strokeColor={{
								'0%': 'red',
								'60%': 'orange',
								'99%': 'limegreen',
							}}
							percent={round(catalogueMemorizationPercent * 100, 1)}
						/>
					}
					<div>{`Du bestehst die Prüfung zu ${round(catalogueMemorizationPercent * 100)}%`}</div>
				</Card>
			</div>
		</div>
	);
}
