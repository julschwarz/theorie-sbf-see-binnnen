import { Button, Radio, Space } from 'antd';
import _, { shuffle } from 'lodash';
import * as React from 'react';
import { useLocalStorage } from '../effects/useLocalStorage';
import '../styles.css';
import { Image, Question, Response } from '../types';

function ImageComponent(props: Image) {
	return (
		<a key={props.title} href={props.src} target={props.src}>
			<img className="Image" src={props.src} />
		</a>
	);
}

function getNextQuestionId(
	availableQuestionIds: string[],
	progress: Record<string, { rightCount: number; wrongCount: number }>
): string {
	let nextQuestion = { index: availableQuestionIds[0], memorizationLevel: 10000 };

	for (const id of _.shuffle(availableQuestionIds)) {
		// if the id is not yet in progress and thus hasn't been seen by the user, return this question id
		if (!progress[id]) return id;

		// else find the question with the lowest memorization level,
		// if a question is answered right it has a higher memorization Level (x 2). Therefore accounts double to the memorizationLevel
		const memorizationLevel = progress[id].rightCount * 2 - progress[id].wrongCount;
		if (memorizationLevel < nextQuestion.memorizationLevel) {
			nextQuestion = { index: id, memorizationLevel };
		}
	}
	// if all questions were answered at least once then return the one that has the lowest memorizationLevel
	return nextQuestion.index;
}

function getQuestionProgress(
	question: Question,
	progress: { rightCount: number; wrongCount: number } | undefined
): Question {
	return progress ? { ...question, ...progress } : question;
}

export function QuestionComponent(props: {
	questionsDict: Record<string, Question>;
	progress: Record<string, { rightCount: number; wrongCount: number }>;
	setProgress: any;
}) {
	const { questionsDict, progress, setProgress } = props;
	const [pastQuestionsIdList, setPastQuestionsIdList] = useLocalStorage<string[]>('answeredQuestions', []);
	const [selectedResponse, setSelectedResponse] = React.useState<Response | null>(null);
	// const [onlyWronglyAnsweredMode, setOnlyWronglyAnsweredMode] = React.useState(false);
	const lastSavedQuestionId =
		pastQuestionsIdList.length == 0 ? '0_Basis_Binnen' : pastQuestionsIdList[pastQuestionsIdList.length - 1];
	const [currentQuestion, setQuestion] = React.useState<Question>(
		getQuestionProgress(questionsDict[lastSavedQuestionId], progress[lastSavedQuestionId])
	);

	const responses = React.useMemo(() => {
		if (!currentQuestion) return;
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
		// save last question in processed queue:
		setPastQuestionsIdList([...pastQuestionsIdList, currentQuestion.id]);
		console.log([...pastQuestionsIdList, currentQuestion.id]);
		// save stats to progess:
		const newProgress = {
			...progress,
			[currentQuestion.id]: { rightCount: currentQuestion.rightCount, wrongCount: currentQuestion.wrongCount },
		};
		setProgress(newProgress);
		console.log('Saved question to progress:' + JSON.stringify(newProgress));

		// now find next question, set it as current question and undo response
		const nextQuestionId = getNextQuestionId(Object.keys(questionsDict), newProgress);
		const nextRandomQuestion = questionsDict[nextQuestionId];

		const nextQuestionProgress = getQuestionProgress(questionsDict[nextQuestionId], newProgress[nextQuestionId]);

		setQuestion({
			...nextRandomQuestion,
			...nextQuestionProgress,
			responses: shuffle(nextRandomQuestion.responses),
		});
		setSelectedResponse(null);
		console.log('Set next question: ' + JSON.stringify(questionsDict[nextQuestionId].question));
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
		// set last question as current question and undo response
		const lastQuestionId = pastQuestionsIdList[pastQuestionsIdList.length - 1];
		console.log(pastQuestionsIdList);
		if (!lastQuestionId) return;
		console.log('a');
		setQuestion(getQuestionProgress(questionsDict[lastQuestionId], progress[lastQuestionId]));
		setSelectedResponse(null);

		// remove last question again from pastQuestionsIdList
		setPastQuestionsIdList(pastQuestionsIdList.slice(0, -1));
	}, [setPastQuestionsIdList, pastQuestionsIdList, questionsDict, progress]);

	return (
		<div>
			{/* <Checkbox onChange={(e) => setOnlyWronglyAnsweredMode(e.target.value)}>
				Nur falsch beantwortete Fragen
			</Checkbox> */}
			<br />
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
