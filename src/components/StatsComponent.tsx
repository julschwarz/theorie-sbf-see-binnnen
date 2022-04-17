import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Col, Progress, Row, Statistic } from 'antd';
import { round } from 'lodash';
import React, { useEffect, useState } from 'react';
import '../styles.css';
export function StatsComponent(props: {
	progress: Record<string, { rightCount: number; wrongCount: number }>;
	setProgress: any;
	catalogues: string[];
	numberTotalQuestions: number;
}) {
	const { progress, setProgress, catalogues, numberTotalQuestions } = props;

	// Processed questions within selected catalogues:
	const indexesProcessedInSelectedCatalogue = Object.keys(progress).filter((index) =>
		catalogues.includes(index.replace(/[^/_]*[_]/, ''))
	);
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
				<Col flex={4}>Richtig / Falsch</Col>
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
						value={Object.values(progress).filter((value) => value.rightCount > 0).length}
						prefix={<LikeOutlined />}
					/>

					<Statistic
						title="Never answered right"
						value={
							Object.values(progress).filter((value) => value.wrongCount > 0 && value.rightCount == 0)
								.length
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
				</Col>
				<Col flex={3}>
					{Object.values(progress).filter((value) => value.rightCount >= 3).length} Fragen mindestens 3x
					richtig
				</Col>
				<Col flex={3}> {Object.keys(progress).length} / 466</Col>
			</Row>
		</div>
	);
}
