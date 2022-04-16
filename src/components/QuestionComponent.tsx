import { Button, Radio, Space } from 'antd';
import { shuffle } from 'lodash';
import * as React from 'react';
import { useLocalStorage } from '../effects/useLocalStorage';
import '../styles.css';
import { Image, Question, Response } from '../types';

function ImageComponent(props: Image) {
	return (
		<a key={props.title} href={props.src} target={props.src}>
			<img height={150} src={props.src} />
		</a>
	);
}

function getQuestionProgress(
	question: Question,
	progress: { rightCount: number; wrongCount: number } | undefined
): Question {
	return progress ? { ...question, ...progress } : question;
}

export function QuestionComponent(props: { questionsDict: Record<string, Question>; progress: any; setProgress: any }) {
	const { questionsDict, progress, setProgress } = props;
	const [pastQuestionsIdList, setPastQuestionsIdList] = useLocalStorage<string[]>('answeredQuestions', []);
	const [selectedResponse, setSelectedResponse] = React.useState<Response | null>(null);
	const [currentQuestion, setQuestion] = React.useState<Question>(
		pastQuestionsIdList.length == 0? getQuestionProgress(questionsDict['0_Basis_Binnen'], progress['0_Basis_Binnen']): getQuestionProgress(questionsDict[pastQuestionsIdList[pastQuestionsIdList.length - 1]],progress[pastQuestionsIdList[pastQuestionsIdList.length - 1]])
	);

	const responses = React.useMemo(() => {
		return currentQuestion.responses.map((response) => (
			<Radio
				style={{
					background: selectedResponse
						? response.correct
							? 'green'
							: response.text == selectedResponse.text
							? 'red'
							: 'grey'
						: 'grey',
				}}
				className="Radio"
				value={response}
				key={response.text}
			>
				{response.text}
			</Radio>
		));
	}, [selectedResponse, currentQuestion]);

	const goToNextQuestion = React.useCallback(() => {
		const allIndexes = Object.keys(questionsDict);
		const randomInt = Math.floor(Math.random() * allIndexes.length);
		const nextRandomQuestionId = allIndexes[randomInt];
		const nextRandomQuestion = questionsDict[nextRandomQuestionId];

		// save last question in processed quere:
		setPastQuestionsIdList([...pastQuestionsIdList, currentQuestion.id]);

		// save stats to progess:
		const updatedCounts = { rightCount: currentQuestion.rightCount, wrongCount: currentQuestion.wrongCount };
		setProgress({
			...progress,
			[currentQuestion.id]: updatedCounts,
		});
		console.log('Saved question to progress:' + JSON.stringify(progress));

		// now set new question as current question and undo response
		const nextQuestionProgress =
			nextRandomQuestionId in Object.keys(progress)
				? progress[nextRandomQuestionId]
				: { rightCount: 0, wrongCount: 0 };

		setQuestion({
			...nextRandomQuestion,
			...nextQuestionProgress,
			responses: shuffle(nextRandomQuestion.responses),
		});
		setSelectedResponse(null);
		console.log('Set next question: ' + JSON.stringify(questionsDict[nextRandomQuestionId].question));
	}, [
		currentQuestion,
		questionsDict,
		setQuestion,
		pastQuestionsIdList,
		setPastQuestionsIdList,
		setProgress,
		progress,
	]);

	const goToLastQuestion = React.useCallback(() => {
		if (pastQuestionsIdList.length == 1) return;

		// else set last question as current question and undo response
		const lastQuestionId = pastQuestionsIdList[pastQuestionsIdList.length - 1];
		setQuestion(getQuestionProgress(questionsDict[lastQuestionId], progress[lastQuestionId]));
		setSelectedResponse(null);

		// remove last question again from pastQuestionsIdList
		setPastQuestionsIdList(pastQuestionsIdList.slice(0, -1));
	}, [setPastQuestionsIdList, pastQuestionsIdList, questionsDict, progress]);

	return (
		<div>
			{currentQuestion.images.map((image) => ImageComponent(image))}
			<div className="Question">{currentQuestion.question}</div>
			<Radio.Group
				disabled={selectedResponse != null}
				onChange={(value) => {
					console.log('responded: ' + value.target.value.text);
					console.log('Is correct? ' + value.target.value.correct);

					// Update selected response
					setSelectedResponse({ ...value.target.value });

					// update questions right/wrong answers count:
					if (value.target.value.correct) {
						setQuestion({
							...currentQuestion,
							rightCount: currentQuestion.rightCount + 1,
						});
					} else {
						setQuestion({
							...currentQuestion,
							wrongCount: currentQuestion.wrongCount + 1,
						});
					}

					[currentQuestion, setQuestion];
				}}
			>
				<Space direction="vertical">{responses}</Space>
			</Radio.Group>
			{
				<span style={{ display: 'flex' }}>
					{' '}
					<Button className="Button" onClick={() => goToLastQuestion()} type="primary">
						Previous Question
					</Button>
					<Button
						style={{ marginLeft: 'auto' }}
						className="Button"
						disabled={!selectedResponse}
						onClick={() => goToNextQuestion()}
						type="primary"
					>
						Next Question
					</Button>{' '}
				</span>
			}
		</div>
	);
}
