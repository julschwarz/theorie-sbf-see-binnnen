import { Checkbox } from 'antd';
import * as _ from 'lodash';
import * as React from 'react';
import { render } from 'react-dom';
import { ProgressUpload } from './components/ProgressUpload';
import { QuestionComponent } from './components/QuestionComponent';
import { StatsComponent } from './components/StatsComponent';
import { useLocalStorage } from './effects/useLocalStorage';
import './styles.css';
import { Question } from './types';

function App() {
	const [selectedQuestionCatalogues, setSelectedQuestionCatalogues] = useLocalStorage<string[]>('catalogues', [
		'Basis',
	]);

	function listToDict(list: Question[]) {
		return list.filter((a) => a.id).reduce((a, v) => ({ ...a, [v.id!]: v }), {});
	}

	const [questionCatalogue, setQuestionCatalogue] = React.useState<Record<string, Question>>(
		listToDict(
			_.flatten(
				selectedQuestionCatalogues.map((file: string) => {
					/* eslint-disable */
					const questions: Question[] = require(`./data/${file}.json`);
					// add a unique id to each question:
					return questions.map((question, idx) => {
						return { ...question, id: `${idx}_${file}`, rightCount: 0, wrongCount: 0 };
					});
				})
			)
		)
	);

	const options = [
		{ label: 'Basis', value: 'Basis' },
		{ label: 'Binnen Spezifisch', value: 'Binnen_Spezifisch' },
		{ label: 'See Spezifisch', value: 'See_Spezifisch' },
		{ label: 'Binnen_Segel', value: 'Binnen_Segel_Spezifisch' },
	];

	React.useEffect(() => {
		if (selectedQuestionCatalogues.length == 0) return;
		setQuestionCatalogue(
			listToDict(
				_.flatten(
					selectedQuestionCatalogues.map((file: string) => {
						/* eslint-disable */
						const questions: Question[] = require(`./data/${file}.json`);
						// add a unique id to each question:
						return questions.map((question, idx) => {
							return { ...question, id: `${idx}_${file}`, rightCount: 0, wrongCount: 0 };
						});
					})
				)
			)
		);
	}, [selectedQuestionCatalogues, setSelectedQuestionCatalogues]);

	function onQuestionCatalogueChange(checkedValues: any[]) {
		setSelectedQuestionCatalogues(checkedValues);
		console.log('Change in catalogue selection: ', checkedValues);
	}

	const selection = (
		<Checkbox.Group
			options={options}
			defaultValue={selectedQuestionCatalogues}
			onChange={onQuestionCatalogueChange}
		/>
	);

	const [progress, setProgress] = useLocalStorage<Record<string, { rightCount: number; wrongCount: number }>>(
		'progress',
		{}
	);

	return (
		<div className="App">
			<h1>{'Theoriefragen zum SBF Binnen & See'}</h1>
			{selection}
			<div>{`${Object.keys(questionCatalogue).length} questions`}</div>
			<QuestionComponent questionsDict={questionCatalogue} progress={progress} setProgress={setProgress} />
			<StatsComponent
				progress={progress}
				setProgress={setProgress}
				catalogues={selectedQuestionCatalogues}
				numberTotalQuestions={Object.keys(questionCatalogue).length}
			/>
			<ProgressUpload setProgress={setProgress} />
		</div>
	);
}

const rootElement = document.getElementById('root');
render(<App />, rootElement);
