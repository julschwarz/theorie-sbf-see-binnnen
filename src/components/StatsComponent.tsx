import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Col, Progress, Row, Statistic } from 'antd';
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
			<Row>
				<Col flex={3}>
					<div>Fortschritt in den ausgewählten Fragenkatalogen</div>
				</Col>
				<Col flex={4}>{round(catalogueMemorizationPercent * 100)} %</Col>
				<Col flex={4}>Total</Col>
			</Row>
			<Row>
				<Col flex={3}>
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
								2
							)}
						/>
					}
				</Col>
				<Col flex={3}>
					<Statistic
						title="Correct once"
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].rightCount > 0
							).length
						}
						prefix={<LikeOutlined />}
					/>

					<Statistic
						title="Never answered right"
						value={
							Object.values(indexesProcessedInSelectedCatalogue).filter(
								(id) => progress[id] && progress[id].wrongCount > 0 && progress[id].rightCount == 0
							).length
						}
						prefix={<DislikeOutlined />}
					/>
				</Col>
				<Col flex={3}>
					{
						<Progress
							type="circle"
							strokeColor={{
								'0%': 'red',
								'60%': 'orange',
								'99%': 'limegreen',
							}}
							percent={round((Object.keys(progress).length / 466) * 100, 1)}
						/>
					}
				</Col>
			</Row>
			<Row>
				<Col flex={3}>
					{catalogues.length != 0 &&
						catalogues.reduce((prev, cur) => prev.replace('_', ' ') + ', ' + cur.replace('_', ' '))}
					<div>
						{indexesProcessedInSelectedCatalogue.length} / {numberTotalQuestions}
					</div>
				</Col>
				<Col flex={3}>
					{Object.values(selectedProgress).filter((value) => value.rightCount >= 3).length} Fragen mindestens
					3x richtig
				</Col>
				<Col flex={3}> {Object.keys(progress).length} / 466</Col>
			</Row>
		</div>
	);
}
